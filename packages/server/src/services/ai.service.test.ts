import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AIService } from './ai.service.js';

const prisma = new PrismaClient();
const aiService = new AIService();

beforeAll(async () => {
  await prisma.aIUsageLog.deleteMany({});
  await prisma.aIModel.deleteMany({});
});

afterEach(async () => {
  await prisma.aIUsageLog.deleteMany({});
  await prisma.aIModel.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('AIService', () => {
  /**
   * **Feature: blog-system, Property 28: AI 模型配置存储**
   * **Validates: Requirements 15.1**
   */
  it('Property 28: AI 模型配置存储', async () => {
    const model = await aiService.createModel({
      name: 'Test GPT',
      provider: 'openai',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-test-key-12345',
      modelId: 'gpt-4',
      config: { temperature: 0.7 },
    });

    expect(model.id).toBeDefined();
    expect(model.name).toBe('Test GPT');
    expect(model.provider).toBe('openai');
    expect(model.apiUrl).toBe('https://api.openai.com/v1/chat/completions');
    expect(model.modelId).toBe('gpt-4');
    // API Key 应该被加密存储
    expect(model.apiKey).not.toBe('sk-test-key-12345');

    // 验证可以获取
    const found = await aiService.findById(model.id);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Test GPT');
  }, 60000);

  /**
   * **Feature: blog-system, Property 29: 默认模型唯一性**
   * **Validates: Requirements 15.3**
   */
  it('Property 29: 默认模型唯一性', async () => {
    // 创建两个模型
    const model1 = await aiService.createModel({
      name: 'Model 1',
      provider: 'openai',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'key1',
      modelId: 'gpt-4',
    });

    const model2 = await aiService.createModel({
      name: 'Model 2',
      provider: 'openai',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'key2',
      modelId: 'gpt-3.5-turbo',
    });

    // 设置 model1 为默认
    await aiService.setDefault(model1.id);

    // 验证 model1 是默认
    let defaultModel = await aiService.getDefault();
    expect(defaultModel?.id).toBe(model1.id);

    // 设置 model2 为默认
    await aiService.setDefault(model2.id);

    // 验证只有 model2 是默认
    defaultModel = await aiService.getDefault();
    expect(defaultModel?.id).toBe(model2.id);

    // 验证 model1 不再是默认
    const model1Updated = await aiService.findById(model1.id);
    expect(model1Updated?.isDefault).toBe(false);
  }, 60000);

  it('should update model configuration', async () => {
    const model = await aiService.createModel({
      name: 'Original Name',
      provider: 'openai',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'original-key',
      modelId: 'gpt-4',
    });

    const updated = await aiService.updateModel(model.id, {
      name: 'Updated Name',
      isEnabled: false,
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.isEnabled).toBe(false);
  }, 60000);
});
