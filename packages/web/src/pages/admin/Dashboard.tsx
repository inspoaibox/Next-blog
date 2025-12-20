import { Card, CardContent, CardHeader } from '../../components/ui';

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="文章数" value="0" icon="📝" />
        <StatCard title="分类数" value="0" icon="📁" />
        <StatCard title="标签数" value="0" icon="🏷️" />
        <StatCard title="评论数" value="0" icon="💬" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">最近文章</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              暂无文章
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">最近评论</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              暂无评论
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
