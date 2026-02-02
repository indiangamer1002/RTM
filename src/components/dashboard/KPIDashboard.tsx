import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, FileText, CheckCircle, AlertTriangle, Clock, Target, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export function KPIDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({
    totalReqs: 0,
    inProgress: 0,
    completed: 0,
    atRisk: 0
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Animate counters
    const targets = { totalReqs: 247, inProgress: 89, completed: 158, atRisk: 23 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        totalReqs: Math.floor(targets.totalReqs * progress),
        inProgress: Math.floor(targets.inProgress * progress),
        completed: Math.floor(targets.completed * progress),
        atRisk: Math.floor(targets.atRisk * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, []);

  const kpis = [
    {
      title: 'Total Requirements',
      value: animatedValues.totalReqs.toString(),
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: '0ms'
    },
    {
      title: 'In Progress',
      value: animatedValues.inProgress.toString(),
      change: '+5%',
      trend: 'up',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      delay: '100ms'
    },
    {
      title: 'Completed',
      value: animatedValues.completed.toString(),
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: '200ms'
    },
    {
      title: 'At Risk',
      value: animatedValues.atRisk.toString(),
      change: '-3%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      delay: '300ms'
    }
  ];

  const statusBreakdown = [
    { status: 'New', count: 45, percentage: 18, color: 'bg-blue-500' },
    { status: 'In Progress', count: 89, percentage: 36, color: 'bg-yellow-500' },
    { status: 'Completed', count: 158, percentage: 64, color: 'bg-green-500' },
    { status: 'On Hold', count: 12, percentage: 5, color: 'bg-gray-500' }
  ];

  const priorityBreakdown = [
    { priority: 'Critical', count: 34, color: 'bg-red-500' },
    { priority: 'High', count: 67, color: 'bg-orange-500' },
    { priority: 'Medium', count: 98, color: 'bg-yellow-500' },
    { priority: 'Low', count: 48, color: 'bg-green-500' }
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header with Live indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">RTM Dashboard</h2>
          <p className="text-muted-foreground">Overview of requirement traceability metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
          <span>597 Total Items</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card 
              key={kpi.title} 
              className={`transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: kpi.delay }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1 tabular-nums">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {kpi.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Metrics */}
        <Card className="transform transition-all duration-500 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Coverage Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Test Coverage', value: 55, color: 'bg-orange-500' },
              { label: 'Approval Rate', value: 32, color: 'bg-orange-500' },
              { label: 'Implementation', value: 41, color: 'bg-orange-500' },
              { label: 'Test Pass Rate', value: 23, color: 'bg-orange-500' }
            ].map((metric, index) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-semibold">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${metric.color} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: isVisible ? `${metric.value}%` : '0%',
                      transitionDelay: `${500 + index * 200}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="transform transition-all duration-500 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                {/* Draft - Red */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#dc2626" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 25 : 0} 251.2`}
                  strokeDashoffset="0"
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '800ms' }}
                />
                {/* In Progress - Orange */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#ea580c" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 40 : 0} 251.2`}
                  strokeDashoffset={`-${isVisible ? 25 : 0}`}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '1000ms' }}
                />
                {/* Completed - Green */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#16a34a" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 80 : 0} 251.2`}
                  strokeDashoffset={`-${isVisible ? 65 : 0}`}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '1200ms' }}
                />
              </svg>
            </div>
            {/* Legend */}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Draft', color: 'bg-red-600' },
                { label: 'Pending Review', color: 'bg-gray-400' },
                { label: 'Approved', color: 'bg-gray-600' },
                { label: 'In Progress', color: 'bg-orange-600' },
                { label: 'Completed', color: 'bg-green-600' },
                { label: 'Rejected', color: 'bg-gray-300' },
                { label: 'Deferred', color: 'bg-red-600' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work Item Types Pie Chart */}
        <Card className="transform transition-all duration-500 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Work Item Types
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                {/* Process - Red */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#dc2626" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 30 : 0} 251.2`}
                  strokeDashoffset="0"
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '800ms' }}
                />
                {/* Task - Red */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#dc2626" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 20 : 0} 251.2`}
                  strokeDashoffset={`-${isVisible ? 180 : 0}`}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '1400ms' }}
                />
                {/* Other items - Gray */}
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="#9ca3af" strokeWidth="8"
                  strokeDasharray={`${isVisible ? 150 : 0} 251.2`}
                  strokeDashoffset={`-${isVisible ? 30 : 0}`}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '1000ms' }}
                />
              </svg>
            </div>
            {/* Legend */}
            <div className="space-y-2 text-sm">
              {[
                { label: 'Process', color: 'bg-red-600' },
                { label: 'Requirement', color: 'bg-gray-400' },
                { label: 'Feature', color: 'bg-gray-400' },
                { label: 'User Story', color: 'bg-gray-400' },
                { label: 'Test Case', color: 'bg-gray-400' },
                { label: 'Defect', color: 'bg-gray-400' },
                { label: 'Task', color: 'bg-red-600' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}