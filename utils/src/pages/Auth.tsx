
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { error } = await signUp(email, password, username);

      if (error) {
        throw error;
      }

      toast.success('Account created successfully!', {
        description: 'You can now login with your credentials.',
      });

      // Clear fields after successful registration
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error: any) {
      toast.error('Error creating account', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      const { error, session } = await signIn(email, password);

      if (error) {
        throw error;
      }

      if (session) {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Welcome to WayneWagers</h1>
            <p className="mt-2 text-gray-400">Sign in or create an account to play and win</p>
          </div>

          <Card className="border-casino-gold/20 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Account Access</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full bg-casino-gold text-black hover:bg-yellow-400"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label htmlFor="register-username" className="text-sm font-medium">Username</label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        placeholder="coolplayer123" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="register-email" className="text-sm font-medium">Email</label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="your@email.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full bg-casino-purple hover:bg-purple-600 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
