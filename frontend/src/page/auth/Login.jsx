import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/authSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Lock, ShieldCheck, GraduationCap, Users, Briefcase, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [databaseUsers, setDatabaseUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Fetch users from database on component mount
  useEffect(() => {
    const fetchDatabaseUsers = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
        const response = await fetch(`${backendUrl}/api/auth/quick-login-users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.users && Array.isArray(data.users)) {
            // Enrich with UI data and set default password
            const enrichedUsers = data.users.map(user => ({
              ...user,
              password: 'password123', // Default demo password
              icon: getRoleIcon(user.role),
              color: getRoleColor(user.role).color,
              bgColor: getRoleColor(user.role).bgColor,
              textColor: getRoleColor(user.role).textColor,
            }));
            setDatabaseUsers(enrichedUsers);
          }
        }
      } catch (err) {
        console.log('Using fallback credentials (database users unavailable)');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchDatabaseUsers();
  }, []);

  const rememberMe = watch('rememberMe');


  // Helper function to get icon based on role
  const getRoleIcon = (role) => {
    const roleMap = {
      admin: ShieldCheck,
      alumni: GraduationCap,
      student: Users,
      recruiter: Briefcase,
      mentor: GraduationCap,
    };
    return roleMap[role?.toLowerCase()] || Users;
  };

  // Helper function to get color based on role
  const getRoleColor = (role) => {
    const roleMap = {
      admin: {
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50 hover:bg-red-100',
        textColor: 'text-red-700',
      },
      alumni: {
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        textColor: 'text-blue-700',
      },
      student: {
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50 hover:bg-green-100',
        textColor: 'text-green-700',
      },
      recruiter: {
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50 hover:bg-purple-100',
        textColor: 'text-purple-700',
      },
      mentor: {
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50 hover:bg-blue-100',
        textColor: 'text-blue-700',
      },
    };
    return roleMap[role?.toLowerCase()] || {
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      textColor: 'text-gray-700',
    };
  };

  // Fallback role credentials if database users not available
  const fallbackRoleCredentials = [
    {
      role: 'Admin',
      email: 'admin@alumni.edu',
      password: 'password123',
      icon: ShieldCheck,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
      textColor: 'text-red-700',
    },
    {
      role: 'Mentor',
      email: 'sarah.johnson@alumni.edu',
      password: 'password123',
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      role: 'Alumni',
      email: 'emily.rodriguez@alumni.edu',
      password: 'password123',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-700',
    },
    {
      role: 'Recruiter',
      email: 'david.kim@techcorp.com',
      password: 'password123',
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-700',
    },
  ];

  // Use database users if available, otherwise fallback
  const roleCredentials = databaseUsers.length > 0 ? databaseUsers : fallbackRoleCredentials;

  const handleQuickLogin = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    toast.info(`Credentials filled for quick login`);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(data.email, data.password, data.rememberMe);

      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        // Check if error is due to unverified email
        const errorMsg = result.message || 'Login failed. Please try again.';
        
        if (errorMsg.toLowerCase().includes('not verified') || errorMsg.toLowerCase().includes('verification')) {
          setError(
            <div className="space-y-2">
              <p>{errorMsg}</p>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => navigate('/verify-email', { state: { email: data.email } })}
              >
                Verify your email now →
              </Button>
            </div>
          );
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 dark:bg-card/90 backdrop-blur-sm transition-colors duration-300">
        <CardHeader className="space-y-1">
          {/* Back Button */}
          <div className="flex items-center mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              data-testid="back-to-home-button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your AlumUnity account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@alumni.edu"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setValue('rememberMe', checked)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-14 text-base sm:text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline">
              Sign up
            </Link>
          </div>

          {/* Quick Login Buttons for All Roles */}
          <div className="mt-6">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3 text-center">
              Quick Login as:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {roleCredentials && roleCredentials.length > 0 ? (
                roleCredentials.map((cred) => {
                  const IconComponent = cred.icon;
                  const role = typeof cred.role === 'string' ? cred.role : cred.role?.charAt(0).toUpperCase() + cred.role?.slice(1);
                  return (
                    <Button
                      key={cred.role}
                      type="button"
                      variant="outline"
                      className={`${cred.bgColor} border-0 transition-all duration-200 h-auto py-3 flex flex-col items-center justify-center`}
                      onClick={() => handleQuickLogin(cred.email, cred.password)}
                      disabled={loading || loadingUsers}
                      data-testid={`quick-login-${cred.role.toLowerCase()}`}
                      title={`${cred.name} (${cred.company || 'User'})`}
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cred.color} flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className={`text-xs font-semibold ${cred.textColor} text-center`}>
                          {role}
                        </div>
                        {cred.headline && (
                          <div className={`text-[10px] ${cred.textColor} opacity-75 text-center line-clamp-1`}>
                            {cred.headline}
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })
              ) : (
                // Fallback loading state
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20 animate-pulse"></div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              {loadingUsers ? 'Loading users...' : 'Click any role to auto-fill credentials'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
