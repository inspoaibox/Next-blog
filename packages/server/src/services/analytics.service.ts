import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TrackingData {
  visitorId: string;
  sessionId?: string;
  path: string;
  title?: string;
  articleId?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // 设备信息
  ip?: string;
  userAgent?: string;
  browser?: string;
  browserVer?: string;
  os?: string;
  osVer?: string;
  device?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  timezone?: string;
  // 页面事件
  eventType: 'pageview' | 'pageleave' | 'session_end';
  duration?: number;
  scrollDepth?: number;
}

export const analyticsService = {
  // 记录访客和页面浏览
  async track(data: TrackingData) {
    const {
      visitorId,
      sessionId,
      path,
      title,
      articleId,
      referer,
      utmSource,
      utmMedium,
      utmCampaign,
      ip,
      browser,
      browserVer,
      os,
      osVer,
      device,
      screenWidth,
      screenHeight,
      language,
      timezone,
      eventType,
      duration,
      scrollDepth,
    } = data;

    // 1. 使用 upsert 避免并发创建冲突
    const visitor = await prisma.visitor.upsert({
      where: { visitorId },
      create: {
        visitorId,
        ip,
        browser,
        browserVer,
        os,
        osVer,
        device,
        screenWidth,
        screenHeight,
        language,
        timezone,
      },
      update: {
        lastVisit: new Date(),
        ...(browser && { browser }),
        ...(browserVer && { browserVer }),
        ...(os && { os }),
        ...(osVer && { osVer }),
        ...(device && { device }),
        ...(screenWidth && { screenWidth }),
        ...(screenHeight && { screenHeight }),
      },
    });

    // 2. 处理会话 - 使用前端sessionId作为标识符查找最近的会话
    let session;
    
    // 查找该访客最近30分钟内的活跃会话
    const sessionTimeout = 30 * 60 * 1000; // 30分钟
    const recentSession = await prisma.visitorSession.findFirst({
      where: {
        visitorId: visitor.id,
        endTime: null, // 未结束的会话
        startTime: { gte: new Date(Date.now() - sessionTimeout) },
      },
      orderBy: { startTime: 'desc' },
    });

    if (recentSession) {
      session = recentSession;
    } else if (eventType === 'pageview') {
      // 创建新会话
      session = await prisma.visitorSession.create({
        data: {
          visitorId: visitor.id,
          referer,
          utmSource,
          utmMedium,
          utmCampaign,
        },
      });

      // 增加访客访问次数
      await prisma.visitor.update({
        where: { id: visitor.id },
        data: { visitCount: { increment: 1 } },
      });
    }

    // 3. 处理页面浏览事件
    if (eventType === 'pageview' && session) {
      await prisma.visitorPageView.create({
        data: {
          sessionId: session.id,
          path,
          title,
          articleId,
        },
      });
    }

    // 4. 处理页面离开事件
    if (eventType === 'pageleave' && session) {
      const pageView = await prisma.visitorPageView.findFirst({
        where: {
          sessionId: session.id,
          path,
          leaveTime: null,
        },
        orderBy: { enterTime: 'desc' },
      });

      if (pageView) {
        await prisma.visitorPageView.update({
          where: { id: pageView.id },
          data: {
            leaveTime: new Date(),
            duration,
            scrollDepth,
          },
        });
      }
    }

    // 5. 处理会话结束事件
    if (eventType === 'session_end' && session) {
      const startTime = new Date(session.startTime);
      const endTime = new Date();
      const sessionDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      await prisma.visitorSession.update({
        where: { id: session.id },
        data: {
          endTime,
          duration: sessionDuration,
        },
      });
    }

    return {
      visitorId: visitor.visitorId,
      sessionId: session?.id,
    };
  },

  // 获取统计概览
  async getSummary(startDate?: Date, endDate?: Date) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const defaultStart = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 默认30天
    const defaultEnd = endDate || now;

    const [
      totalVisitors,
      totalSessions,
      totalPageViews,
      todayVisitors,
      todaySessions,
      todayPageViews,
      avgSessionDuration,
      avgPageDuration,
    ] = await Promise.all([
      prisma.visitor.count({
        where: {
          firstVisit: { gte: defaultStart, lte: defaultEnd },
        },
      }),
      prisma.visitorSession.count({
        where: {
          startTime: { gte: defaultStart, lte: defaultEnd },
        },
      }),
      prisma.visitorPageView.count({
        where: {
          enterTime: { gte: defaultStart, lte: defaultEnd },
        },
      }),
      prisma.visitor.count({
        where: {
          firstVisit: { gte: todayStart },
        },
      }),
      prisma.visitorSession.count({
        where: {
          startTime: { gte: todayStart },
        },
      }),
      prisma.visitorPageView.count({
        where: {
          enterTime: { gte: todayStart },
        },
      }),
      prisma.visitorSession.aggregate({
        _avg: { duration: true },
        where: {
          startTime: { gte: defaultStart, lte: defaultEnd },
          duration: { not: null },
        },
      }),
      prisma.visitorPageView.aggregate({
        _avg: { duration: true },
        where: {
          enterTime: { gte: defaultStart, lte: defaultEnd },
          duration: { not: null },
        },
      }),
    ]);

    // 计算跳出率（只访问一个页面的会话比例）
    const singlePageSessions = await prisma.visitorSession.count({
      where: {
        startTime: { gte: defaultStart, lte: defaultEnd },
        pageViews: { none: {} },
      },
    });
    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;

    return {
      totalVisitors,
      totalSessions,
      totalPageViews,
      avgSessionDuration: Math.round(avgSessionDuration._avg.duration || 0),
      avgPageDuration: Math.round(avgPageDuration._avg.duration || 0),
      bounceRate: Math.round(bounceRate * 100) / 100,
      todayVisitors,
      todaySessions,
      todayPageViews,
    };
  },

  // 获取时间序列数据
  async getTimeSeries(startDate: Date, endDate: Date, granularity: 'hour' | 'day' | 'week' | 'month' = 'day') {
    const sessions = await prisma.visitorSession.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        pageViews: true,
      },
    });

    // 按日期分组
    const dataMap = new Map<string, { visitors: Set<string>; sessions: number; pageViews: number }>();

    for (const session of sessions) {
      const date = session.startTime.toISOString().split('T')[0];
      if (!dataMap.has(date)) {
        dataMap.set(date, { visitors: new Set(), sessions: 0, pageViews: 0 });
      }
      const data = dataMap.get(date)!;
      data.visitors.add(session.visitorId);
      data.sessions++;
      data.pageViews += session.pageViews.length;
    }

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        visitors: data.visitors.size,
        sessions: data.sessions,
        pageViews: data.pageViews,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // 获取热门页面
  async getTopPages(startDate: Date, endDate: Date, limit = 10) {
    const pageViews = await prisma.visitorPageView.groupBy({
      by: ['path'],
      where: {
        enterTime: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      _avg: { duration: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return pageViews.map((pv) => ({
      path: pv.path,
      views: pv._count.id,
      avgDuration: Math.round(pv._avg.duration || 0),
    }));
  },

  // 获取来源统计
  async getTopReferers(startDate: Date, endDate: Date, limit = 10) {
    const referers = await prisma.visitorSession.groupBy({
      by: ['referer'],
      where: {
        startTime: { gte: startDate, lte: endDate },
        referer: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return referers
      .filter((r) => r.referer)
      .map((r) => ({
        referer: r.referer!,
        count: r._count.id,
      }));
  },

  // 获取设备统计 - 基于会话时间统计活跃访客的设备
  async getDeviceStats(startDate: Date, endDate: Date) {
    // 先获取时间范围内有会话的访客ID
    const activeSessions = await prisma.visitorSession.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      select: { visitorId: true },
      distinct: ['visitorId'],
    });
    
    const visitorIds = activeSessions.map(s => s.visitorId);
    
    if (visitorIds.length === 0) {
      return [];
    }
    
    const devices = await prisma.visitor.groupBy({
      by: ['device'],
      where: {
        id: { in: visitorIds },
      },
      _count: { id: true },
    });

    const total = devices.reduce((sum, d) => sum + d._count.id, 0);
    return devices.map((d) => ({
      device: d.device || 'unknown',
      count: d._count.id,
      percentage: Math.round((d._count.id / total) * 10000) / 100,
    }));
  },

  // 获取浏览器统计 - 基于会话时间统计活跃访客的浏览器
  async getBrowserStats(startDate: Date, endDate: Date) {
    const activeSessions = await prisma.visitorSession.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      select: { visitorId: true },
      distinct: ['visitorId'],
    });
    
    const visitorIds = activeSessions.map(s => s.visitorId);
    
    if (visitorIds.length === 0) {
      return [];
    }
    
    const browsers = await prisma.visitor.groupBy({
      by: ['browser'],
      where: {
        id: { in: visitorIds },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const total = browsers.reduce((sum, b) => sum + b._count.id, 0);
    return browsers.map((b) => ({
      browser: b.browser || 'unknown',
      count: b._count.id,
      percentage: Math.round((b._count.id / total) * 10000) / 100,
    }));
  },

  // 获取地区统计 - 基于会话时间统计活跃访客的地区
  async getCountryStats(startDate: Date, endDate: Date) {
    const activeSessions = await prisma.visitorSession.findMany({
      where: {
        startTime: { gte: startDate, lte: endDate },
      },
      select: { visitorId: true },
      distinct: ['visitorId'],
    });
    
    const visitorIds = activeSessions.map(s => s.visitorId);
    
    if (visitorIds.length === 0) {
      return [];
    }
    
    const countries = await prisma.visitor.groupBy({
      by: ['country'],
      where: {
        id: { in: visitorIds },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const total = countries.reduce((sum, c) => sum + c._count.id, 0);
    return countries.map((c) => ({
      country: c.country || 'unknown',
      count: c._count.id,
      percentage: Math.round((c._count.id / total) * 10000) / 100,
    }));
  },

  // 获取实时访客 - 按独立访客去重统计
  async getRealtimeVisitors(minutes = 5) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    // 获取最近的页面浏览记录，按访客去重
    const recentPageViews = await prisma.visitorPageView.findMany({
      where: {
        enterTime: { gte: since },
      },
      include: {
        session: {
          include: {
            visitor: true,
          },
        },
      },
      orderBy: { enterTime: 'desc' },
    });

    // 按访客ID去重，只保留每个访客最新的页面浏览
    const visitorMap = new Map<string, typeof recentPageViews[0]>();
    for (const pv of recentPageViews) {
      const visitorId = pv.session.visitor.visitorId;
      if (!visitorMap.has(visitorId)) {
        visitorMap.set(visitorId, pv);
      }
    }

    // 转换为数组并返回
    return Array.from(visitorMap.values()).slice(0, 50).map((pv) => ({
      path: pv.path,
      title: pv.title,
      enterTime: pv.enterTime,
      visitorId: pv.session.visitor.visitorId,
      visitor: {
        country: pv.session.visitor.country,
        city: pv.session.visitor.city,
        browser: pv.session.visitor.browser,
        os: pv.session.visitor.os,
        device: pv.session.visitor.device,
      },
    }));
  },

  // 获取访客列表
  async getVisitors(page = 1, pageSize = 20, startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate && endDate && {
        firstVisit: { gte: startDate, lte: endDate },
      }),
    };

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        orderBy: { lastVisit: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { sessions: true } },
        },
      }),
      prisma.visitor.count({ where }),
    ]);

    return {
      items: visitors,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  // 获取访客详情
  async getVisitorDetail(visitorId: string) {
    const visitor = await prisma.visitor.findUnique({
      where: { visitorId },
      include: {
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 20,
          include: {
            pageViews: {
              orderBy: { enterTime: 'asc' },
            },
          },
        },
      },
    });

    return visitor;
  },
};
