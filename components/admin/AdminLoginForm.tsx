
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Shield } from 'lucide-react';

export interface AdminLoginFormProps {
  onLogin: (success: boolean) => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simple hardcoded check for demo purposes
      // In a real application, you'd want to check against your database
      if ((email === 'admin' && password === 'password') || 
          (email === 'admin@casino.com' && password === 'admin123')) {
        
        setTimeout(() => {
          onLogin(true);
          toast.success('Admin login successful!');
          toast.info('Welcome to the admin dashboard!', {
            description: "You now have access to all casino management features."
          });
          setIsLoading(false);
        }, 500);
      } else {
        toast.error('Invalid credentials', {
          description: 'Try admin/password or admin@casino.com/admin123'
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Login
          </CardTitle>
          <CardDescription>
            Please log in with your admin credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Username or Email</label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin or admin@casino.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use admin/password or admin@casino.com/admin123 for demo purposes
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Lock className="mr-2 h-4 w-4" />
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginForm;
