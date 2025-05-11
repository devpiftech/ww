
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Admin Components
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import DashboardStats from '@/components/admin/DashboardStats';
import GameSettingsTab from '@/components/admin/GameSettingsTab';
import UsersTab from '@/components/admin/UsersTab';
import TransactionsTab from '@/components/admin/TransactionsTab';
import SlotsTabContent from '@/components/admin/SlotsTabContent';
import BotControlPanel from '@/components/admin/BotControlPanel';

// Custom Hook for Admin Data
import { useAdminData } from '@/hooks/useAdminData';

const AdminDashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const {
    gameConfigs,
    slotConfigs,
    users,
    transactions,
    statistics,
    saveConfig,
    toggleGameStatus,
    saveSlotConfig,
    toggleSlotStatus
  } = useAdminData(authenticated);

  const handleLogin = (success: boolean) => {
    setAuthenticated(success);
  };

  // If not an admin, show login form
  if (!authenticated) {
    return <AdminLoginForm onLogin={handleLogin} />;
  }

  // Admin dashboard
  return (
    <Layout>
      <div className="py-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage casino operations, users, and game settings</p>
          </div>
          <div className="flex items-center gap-3">
            {authUser && (
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary h-2 w-2 rounded-full"></div>
                <span>Logged in as Admin</span>
              </div>
            )}
          </div>
        </div>

        <DashboardStats statistics={statistics} />
        
        <div className="mt-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-5 w-full">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="games">Game Settings</TabsTrigger>
              <TabsTrigger value="slots">Slot Machines</TabsTrigger>
              <TabsTrigger value="bots">Bot Control</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <TransactionsTab transactions={transactions} users={users} />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab users={users} />
            </TabsContent>
            <TabsContent value="games">
              <GameSettingsTab 
                gameConfigs={gameConfigs}
                onSaveConfig={saveConfig}
                onToggleGameStatus={toggleGameStatus}
              />
            </TabsContent>
            <TabsContent value="slots">
              <SlotsTabContent 
                slotConfigs={slotConfigs}
                onSaveSlotConfig={saveSlotConfig}
                onToggleSlotStatus={toggleSlotStatus}
              />
            </TabsContent>
            <TabsContent value="bots">
              <BotControlPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
