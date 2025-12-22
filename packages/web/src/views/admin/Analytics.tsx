'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import type {
  AnalyticsSummary,
  AnalyticsTimeSeriesData,
  AnalyticsTopPage,
  AnalyticsTopReferer,
  AnalyticsDeviceStats,
  AnalyticsBrowserStats,
  AnalyticsCountryStats,
} from '../../types';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateParams = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '30d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '90d':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        endDate = customEnd ? new Date(customEnd) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [dateRange, customStart, customEnd]);

  // 获取统计概览
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['analytics-summary', dateParams],
    queryFn: () => api.get<AnalyticsSummary>(`/analytics/summary?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`),
  });

  // 获取时间序列数据
  const { data: timeSeries } = useQuery({
    queryKey: ['analytics-timeseries', dateParams],
    queryFn: () => api.get<AnalyticsTimeSeriesData[]>(`/analytics/timeseries?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`),
  });

  // 获取热门页面
  const { data: topPages } = useQuery({
    queryKey: ['analytics-top-pages', dateParams],
    queryFn: () => api.get<AnalyticsTopPage[]>(`/analytics/top-pages?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}&limit=10`),
  });

  // 获取来源统计
  const { data: topReferers } = useQuery({
    queryKey: ['analytics-top-referers', dateParams],
    queryFn: () => api.get<AnalyticsTopReferer[]>(`/analytics/top-referers?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}&limit=10`),
  });

  // 获取设备统计
  const { data: deviceStats } = useQuery({
    queryKey: ['analytics-devices', dateParams],
    queryFn: () => api.get<AnalyticsDeviceStats[]>(`/analytics/devices?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`),
  });

  // 获取浏览器统计
  const { data: browserStats } = useQuery({
    queryKey: ['analytics-browsers', dateParams],
    queryFn: () => api.get<AnalyticsBrowserStats[]>(`/analytics/browsers?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`),
  });

  // 获取地区统计
  const { data: countryStats } = useQuery({
    queryKey: ['analytics-countries', dateParams],
    queryFn: () => api.get<AnalyticsCountryStats[]>(`/analytics/countries?startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`),
  });

  // 获取实时访客
  const { data: realtimeVisitors, refetch: refetchRealtime } = useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: () => api.get<any[]>('/analytics/realtime?minutes=5'),
    refetchInterval: 30000, // 30秒刷新一次
  });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={16} />;
      case 'tablet':
        return <Tablet size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">网站统计</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            实时监控网站访问数据，了解用户行为
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
          >
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
            <option value="90d">最近90天</option>
            <option value="custom">自定义</option>
          </select>
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
              />
              <span className="text-gray-400">至</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
              />
            </>
          )}
          <button
            onClick={() => {
              refetchSummary();
              refetchRealtime();
            }}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
            title="刷新数据"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总访客"
          value={summary?.totalVisitors || 0}
          icon={<Users size={20} />}
          trend={summary?.todayVisitors ? `今日 +${summary.todayVisitors}` : undefined}
          loading={summaryLoading}
        />
        <StatCard
          title="总浏览量"
          value={summary?.totalPageViews || 0}
          icon={<Eye size={20} />}
          trend={summary?.todayPageViews ? `今日 +${summary.todayPageViews}` : undefined}
          loading={summaryLoading}
        />
        <StatCard
          title="平均停留"
          value={formatDuration(summary?.avgSessionDuration || 0)}
          icon={<Clock size={20} />}
          loading={summaryLoading}
        />
        <StatCard
          title="跳出率"
          value={`${summary?.bounceRate || 0}%`}
          icon={<TrendingUp size={20} />}
          loading={summaryLoading}
        />
      </div>

      {/* 实时访客 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={18} className="text-green-500" />
            实时访客
            <span className="text-sm font-normal text-gray-500">（最近5分钟）</span>
            <span className="ml-auto text-sm font-normal text-green-500">
              {realtimeVisitors?.length || 0} 人在线
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!realtimeVisitors?.length ? (
            <div className="text-center py-8 text-gray-500">暂无实时访客</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {realtimeVisitors.map((visitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium truncate max-w-xs">{visitor.path}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    {visitor.visitor?.country && (
                      <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {visitor.visitor.country}
                      </span>
                    )}
                    {visitor.visitor?.browser && (
                      <span>{visitor.visitor.browser}</span>
                    )}
                    {visitor.visitor?.device && getDeviceIcon(visitor.visitor.device)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 访问趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>访问趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {!timeSeries?.length ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="space-y-2">
                {timeSeries.slice(-14).map((item) => (
                  <div key={item.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{item.date.slice(5)}</span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{
                          width: `${Math.min(100, (item.pageViews / Math.max(...timeSeries.map((t) => t.pageViews))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                      {item.pageViews}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 热门页面 */}
        <Card>
          <CardHeader>
            <CardTitle>热门页面</CardTitle>
          </CardHeader>
          <CardContent>
            {!topPages?.length ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page.path}</p>
                      <p className="text-xs text-gray-500">
                        平均停留 {formatDuration(page.avgDuration)}
                      </p>
                    </div>
                    <span className="text-sm font-bold">{page.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 来源和设备 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 流量来源 */}
        <Card>
          <CardHeader>
            <CardTitle>流量来源</CardTitle>
          </CardHeader>
          <CardContent>
            {!topReferers?.length ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {topReferers.map((ref) => (
                  <div key={ref.referer} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[180px]" title={ref.referer}>
                      {new URL(ref.referer).hostname}
                    </span>
                    <span className="text-sm font-bold">{ref.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 设备分布 */}
        <Card>
          <CardHeader>
            <CardTitle>设备分布</CardTitle>
          </CardHeader>
          <CardContent>
            {!deviceStats?.length ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {deviceStats.map((device) => (
                  <div key={device.device} className="flex items-center gap-3">
                    {getDeviceIcon(device.device)}
                    <span className="flex-1 text-sm capitalize">{device.device}</span>
                    <span className="text-sm text-gray-500">{device.percentage}%</span>
                    <span className="text-sm font-bold">{device.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 浏览器分布 */}
        <Card>
          <CardHeader>
            <CardTitle>浏览器分布</CardTitle>
          </CardHeader>
          <CardContent>
            {!browserStats?.length ? (
              <div className="text-center py-8 text-gray-500">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {browserStats.map((browser) => (
                  <div key={browser.browser} className="flex items-center justify-between">
                    <span className="text-sm">{browser.browser}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{browser.percentage}%</span>
                      <span className="text-sm font-bold">{browser.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 地区分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} />
            访客地区分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!countryStats?.length ? (
            <div className="text-center py-8 text-gray-500">暂无数据</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {countryStats.map((country) => (
                <div
                  key={country.country}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
                >
                  <p className="text-2xl font-bold">{country.count}</p>
                  <p className="text-sm text-gray-500">{country.country}</p>
                  <p className="text-xs text-gray-400">{country.percentage}%</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
}) {
  const isPositive = trend?.includes('+');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
          <span className="text-gray-400">{icon}</span>
        </div>
        {loading ? (
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {trend}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
