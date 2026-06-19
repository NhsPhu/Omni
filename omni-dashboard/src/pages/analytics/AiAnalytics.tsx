import React, { useEffect, useState } from 'react';
// Assuming you have an api or fetch wrapper. We'll use standard fetch with Authorization if needed.

export const AiAnalytics: React.FC = () => {
  const [data, setData] = useState<{ totalSessions: number; averageResponseTime: string; growthPercentage: number } | null>(null);

  useEffect(() => {
    // Note: In a real app, use your authenticated API client
    const token = localStorage.getItem('token');
    fetch('http://localhost:8080/api/admin/analytics/ai/overview', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Analytics Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total AI Chat Sessions</h3>
          </div>
          <div className="text-2xl font-bold">{data ? data.totalSessions : 'Loading...'}</div>
          <p className="text-xs text-muted-foreground">+{data?.growthPercentage}% from last month</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Average Response Time</h3>
          </div>
          <div className="text-2xl font-bold">{data ? data.averageResponseTime : 'Loading...'}</div>
          <p className="text-xs text-muted-foreground">Based on recent 100 requests</p>
        </div>
      </div>
      <div className="h-[400px] w-full rounded-xl border bg-card text-card-foreground shadow flex items-center justify-center flex-col">
        <p className="text-muted-foreground mb-4">Detailed metrics chart</p>
        <iframe 
            src="http://localhost:3001/d-solo/your-dashboard-id/omni-ai-metrics?orgId=1&panelId=1" 
            width="100%" 
            height="100%" 
            frameBorder="0"
            title="Grafana AI Metrics"
            className="rounded-xl"
        />
      </div>
    </div>
  );
};

export default AiAnalytics;
