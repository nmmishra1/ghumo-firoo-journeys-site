import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Phone, Calendar, IndianRupee, UserCheck, Building, BarChart3 } from 'lucide-react';

interface DashboardStatsProps {
  userRole: string;
  stats: {
    total: number;
    new: number;
    contacted: number;
    quoteSent: number;
    quoteApproved: number;
    converted: number;
    dropped: number;
    hot: number;
    cold: number;
    assigned?: number;
    nextCalls?: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userRole, stats }) => {
  if (userRole === 'admin') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Admin Dashboard Cards */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <IndianRupee className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Amount Receivable</p>
                <p className="text-xl font-bold text-gray-900">₹2,45,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <IndianRupee className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Amount Payable</p>
                <p className="text-xl font-bold text-gray-900">₹85,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Customers</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Users</p>
                <p className="text-xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Lead Sources */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Direct</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor(stats.total * 0.4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Phone</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor(stats.total * 0.3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">f</div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Facebook</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor(stats.total * 0.2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">i</div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Instagram</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor(stats.total * 0.1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular User Dashboard
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Assigned Leads</p>
              <p className="text-xl font-bold text-gray-900">{stats.assigned || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-accent" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Next Calls</p>
              <p className="text-xl font-bold text-gray-900">{stats.nextCalls || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Converted</p>
              <p className="text-xl font-bold text-gray-900">{stats.converted}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-accent rounded-full" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Hot Prospects</p>
              <p className="text-xl font-bold text-gray-900">{stats.hot}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};