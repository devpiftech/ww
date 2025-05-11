
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, DollarSign, Percent, Users } from 'lucide-react';

interface DashboardStatsProps {
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalBets: number;
    totalWagered: number;
    grossRevenue: number;
    houseEdge: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-primary mr-2" />
            <span className="text-2xl font-bold">{statistics.totalUsers}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Wagered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-primary mr-2" />
            <span className="text-2xl font-bold">{statistics.totalWagered}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-2xl font-bold">{statistics.grossRevenue}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">House Edge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Percent className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-2xl font-bold">{statistics.houseEdge.toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
