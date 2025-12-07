import { Activity } from '@/hooks/useActivities';
import { getCategoryColor, CATEGORIES, formatMinutesToTime, MINUTES_IN_DAY } from '@/lib/categories';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Clock, Activity as ActivityIcon, Target, TrendingUp } from 'lucide-react';

interface AnalyticsDashboardProps {
  activities: Activity[];
  totalMinutes: number;
}

export const AnalyticsDashboard = ({ activities, totalMinutes }: AnalyticsDashboardProps) => {
  // Group by category
  const categoryData = CATEGORIES.map((cat) => {
    const total = activities
      .filter((a) => a.category === cat.name)
      .reduce((sum, a) => sum + a.duration_minutes, 0);
    return {
      name: cat.name,
      value: total,
      color: cat.color,
      icon: cat.icon,
    };
  }).filter((d) => d.value > 0);

  // Calculate percentages
  const dataWithPercentages = categoryData.map((d) => ({
    ...d,
    percentage: ((d.value / totalMinutes) * 100).toFixed(1),
  }));

  // Stats
  const topCategory = categoryData.reduce(
    (max, curr) => (curr.value > max.value ? curr : max),
    { value: 0, name: 'None', icon: '📌' }
  );

  const avgActivityDuration = activities.length > 0
    ? Math.round(totalMinutes / activities.length)
    : 0;

  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Logged"
          value={formatMinutesToTime(totalMinutes)}
          color="primary"
        />
        <StatCard
          icon={<ActivityIcon className="w-5 h-5" />}
          label="Activities"
          value={activities.length.toString()}
          color="accent"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Top Category"
          value={topCategory.icon + ' ' + topCategory.name}
          color="primary"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg Duration"
          value={formatMinutesToTime(avgActivityDuration)}
          color="accent"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Time Distribution</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.icon} {data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatMinutesToTime(data.value)} ({((data.value / totalMinutes) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {dataWithPercentages.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium truncate">{cat.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatMinutesToTime(cat.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-display font-semibold mb-4">Activity Duration Comparison</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activities} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${Math.floor(v / 60)}h`} />
              <YAxis
                type="category"
                dataKey="title"
                width={120}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatMinutesToTime(data.duration_minutes)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="duration_minutes"
                radius={[0, 4, 4, 0]}
              >
                {activities.map((activity, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(activity.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'accent';
}) => (
  <div className="glass-card p-4">
    <div className={`w-10 h-10 rounded-lg ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-xl font-display font-bold">{value}</p>
  </div>
);
