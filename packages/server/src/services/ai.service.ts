import { prisma } from '../lib/prisma.js';
import type { AIModel, AIUsageLog } from '@prisma/client';
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32chars!';

export interface CreateAIModelInput {
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  modelId: string;
  config?: Record<string, any>;
}

export interface UpdateAIModelInput {
  name?: string;
  provider?: string;
  apiUrl?: string;
  apiKey?: string;
  modelId?: string;
  isEnabled?: boolean;
  config?: Record<string, any>;
}

export interface GenerateArticleInput {
  idea: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface GenerateResult {
  title: string;
  content: string;
  tags: string[];
  tokensUsed?: number;
}

// 简单加密（实际项目应使用更安全的方式）
function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), Buffer.alloc(16, 0));
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), Buffer.alloc(16, 0));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class AIService {
  /**
   * 创建 AI 模型配置
   */
  async createModel(input: CreateAIModelInput): Promise<AIModel> {
    const encryptedKey = encrypt(input.apiKey);

    return prisma.aIModel.create({
      data: {
        name: input.name,
        provider: input.provider,
        apiUrl: input.apiUrl,
        apiKey: encryptedKey,
        modelId: input.modelId,
        config: input.config ? JSON.stringify(input.config) : null,
      },
    });
  }

  /**
   * 获取模型（不返回解密的 API Key）
   */
  async findById(id: string): Promise<AIModel | null> {
    return prisma.aIModel.findUnique({ where: { id } });
  }

  /**
   * 获取所有模型
   */
  async findAll(): Promise<AIModel[]> {
    return prisma.aIModel.findMany({ orderBy: { createdAt: 'desc' } });
  }


  /**
   * 更新模型配置
   */
  async updateModel(id: string, input: UpdateAIModelInput): Promise<AIModel> {
    const data: any = { ...input };
    if (input.apiKey) {
      data.apiKey = encrypt(input.apiKey);
    }

    return prisma.aIModel.update({ where: { id }, data });
  }

  /**
   * 删除模型
   */
  async deleteModel(id: string): Promise<void> {
    await prisma.aIModel.delete({ where: { id } });
  }

  /**
   * 设置默认模型（确保唯一性）
   */
  async setDefault(id: string): Promise<AIModel> {
    // 先取消所有默认
    await prisma.aIModel.updateMany({ data: { isDefault: false } });
    // 设置新默认
    return prisma.aIModel.update({ where: { id }, data: { isDefault: true } });
  }

  /**
   * 获取默认模型
   */
  async getDefault(): Promise<AIModel | null> {
    return prisma.aIModel.findFirst({ where: { isDefault: true, isEnabled: true } });
  }

  /**
   * 测试模型连接
   */
  async testConnection(id: string): Promise<{ success: boolean; error?: string }> {
    const model = await this.findById(id);
    if (!model) return { success: false, error: 'Model not found' };

    try {
      const apiKey = decrypt(model.apiKey);
      // 简单测试：发送一个简短请求
      const response = await this.callAPI(model, apiKey, 'Say "OK" if you can hear me.');
      return { success: !!response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 调用 AI API
   */
  private async callAPI(model: AIModel, apiKey: string, prompt: string): Promise<string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    // 根据 provider 设置不同的认证头
    if (model.provider === 'openai' || model.provider === 'qwen') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (model.provider === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const body = this.buildRequestBody(model, prompt);

    const response = await fetch(model.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return this.extractResponse(model, data);
  }

  private buildRequestBody(model: AIModel, prompt: string): any {
    if (model.provider === 'claude') {
      return {
        model: model.modelId,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      };
    }
    // OpenAI / Qwen 格式
    return {
      model: model.modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    };
  }

  private extractResponse(model: AIModel, data: any): string {
    if (model.provider === 'claude') {
      return data.content?.[0]?.text || '';
    }
    return data.choices?.[0]?.message?.content || '';
  }


  /**
   * 生成文章
   */
  async generateArticle(input: GenerateArticleInput): Promise<GenerateResult> {
    const model = await this.getDefault();
    if (!model) {
      throw new Error('No default AI model configured');
    }

    const apiKey = decrypt(model.apiKey);
    const lengthGuide = input.length === 'short' ? '500字左右' : input.length === 'long' ? '2000字以上' : '1000字左右';

    const prompt = `你是一个专业的博客写手。请根据以下想法撰写一篇博客文章。

想法：${input.idea}
${input.style ? `风格：${input.style}` : ''}
长度要求：${lengthGuide}

请按以下 JSON 格式返回（不要包含其他内容）：
{
  "title": "文章标题",
  "content": "文章正文（Markdown 格式）",
  "tags": ["标签1", "标签2", "标签3"]
}`;

    let response: string;
    let success = true;
    let error: string | undefined;

    try {
      response = await this.callAPI(model, apiKey, prompt);
    } catch (e: any) {
      success = false;
      error = e.message;
      response = '';
    }

    // 记录使用日志
    await this.logUsage(model.id, prompt, response, success, error);

    if (!success) {
      throw new Error(error || 'AI generation failed');
    }

    // 解析响应
    try {
      // 尝试提取 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          title: result.title || '无标题',
          content: result.content || '',
          tags: Array.isArray(result.tags) ? result.tags : [],
        };
      }
    } catch {
      // 解析失败，返回原始内容
    }

    return {
      title: '无标题',
      content: response,
      tags: [],
    };
  }

  /**
   * 记录 AI 使用日志
   */
  private async logUsage(
    modelId: string,
    prompt: string,
    response: string,
    success: boolean,
    error?: string
  ): Promise<AIUsageLog> {
    return prisma.aIUsageLog.create({
      data: {
        modelId,
        prompt,
        response,
        success,
        error,
      },
    });
  }

  /**
   * 获取使用日志
   */
  async getUsageLogs(options: { page?: number; limit?: number } = {}): Promise<{
    items: AIUsageLog[];
    total: number;
  }> {
    const { page = 1, limit = 20 } = options;

    const [items, total] = await Promise.all([
      prisma.aIUsageLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aIUsageLog.count(),
    ]);

    return { items, total };
  }
}

export const aiService = new AIService();
