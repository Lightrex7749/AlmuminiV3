import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Calendar, AlertCircle, TrendingUp, CheckCircle, UserCheck, Award, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import usePolling from '@/hooks/usePolling';
import MLDataStatusWidget from '@/components/admin/MLDataStatusWidget';
import { BlurFade, StaggerContainer, StaggerItem, BorderBeam, SpotlightCard } from '@/components/ui/aceternity';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [systemStats, setSystemStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stats, verifications] = await Promise.all([
        profileService.getSystemStats(),
        profileService.getPendingVerifications(),
      ]);

      setSystemStats(stats);
      setPendingVerifications(verifications?.profiles || verifications || []);

      // Mock recent activity (this should come from backend in future)
      const activity = [
        { id: 1, type: 'user', message: 'New user registered: maria.garcia@alumni.edu', time: '5 minutes ago' },
        { id: 2, type: 'job', message: 'New job posted: Senior Full-Stack Engineer', time: '1 hour ago' },
        { id: 3, type: 'event', message: 'Event created: Tech Career Fair 2025', time: '2 hours ago' },
        { id: 4, type: 'verification', message: 'Profile verification requested', time: '3 hours ago' },
        { id: 5, type: 'user', message: 'User login: david.kim@techcorp.com', time: '4 hours ago' },
      ];
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Poll dashboard data every 60 seconds
  usePolling(loadData, 60000);

  const stats = [
    {
      title: 'Total Users',
      value: systemStats?.totalUsers || 0,
      icon: Users,
      change: '+12% this month',
      changeType: 'positive',
    },
    {
      title: 'Verified Alumni',
      value: systemStats?.verifiedAlumni || 0,
      icon: UserCheck,
      change: `${systemStats?.totalUsers || 0} total users`,
      changeType: 'neutral',
    },
    {
      title: 'Active Jobs',
      value: systemStats?.activeJobs || 0,
      icon: Briefcase,
      change: 'Currently active',
      changeType: 'positive',
    },
    {
      title: 'Upcoming Events',
      value: systemStats?.upcomingEvents || 0,
      icon: Calendar,
      change: 'Scheduled',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <MainNavbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <BlurFade delay={0.1}>
            <div className="bg-gradient-to-r from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <BorderBeam size={250} duration={12} delay={9} />
              <h1 className="text-3xl font-bold">Admin Dashboard 🛡️</h1>
              <p className="mt-2 opacity-90">
                System overview and management controls
              </p>
            </div>
            </BlurFade>

            {/* Pending Verifications Alert */}
            {pendingVerifications.length > 0 && (
              <BlurFade delay={0.2}>
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/30 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <CardTitle className="text-yellow-900 dark:text-yellow-100">
                      {pendingVerifications.length} Pending Verification{pendingVerifications.length !== 1 ? 's' : ''}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Alumni profiles waiting for verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors duration-200">
                    <Link to="/admin/verifications">Review Verifications</Link>
                  </Button>
                </CardContent>
              </Card>
              </BlurFade>
            )}

            {/* Stats Grid */}
            <BlurFade delay={0.3}>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={index}>
                  <SpotlightCard className="h-full">
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-800/30 border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium dark:text-gray-100">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
                      <p className={`text-xs mt-1 ${
                        stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                        stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                  </SpotlightCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
            </BlurFade>

            {/* Quick Actions */}
            <BlurFade delay={0.4}>
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                <CardDescription className="dark:text-gray-400">Common administrative tasks - Full database management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Link to="/admin/users" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-users">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Users</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View, edit & delete users</div>
                  </Link>
                  <Link to="/admin/verifications" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-verifications">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Verifications</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approve/reject profiles</div>
                  </Link>
                  <Link to="/admin/moderation" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-moderation">
                    <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Content Moderation</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review flagged content</div>
                  </Link>
                  <Link to="/admin/jobs" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-jobs">
                    <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Jobs Management</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage all job postings</div>
                  </Link>
                  <Link to="/admin/events" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-events">
                    <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Events Management</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage all events</div>
                  </Link>
                  <Link to="/admin/mentorship" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-mentorship">
                    <Users className="h-8 w-8 text-teal-600 dark:text-teal-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Mentorship</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage mentorships</div>
                  </Link>
                  <Link to="/admin/badges" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-badges">
                    <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Badge Management</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create & manage badges</div>
                  </Link>
                  <Link to="/admin/knowledge-capsules" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-capsules">
                    <AlertCircle className="h-8 w-8 text-pink-600 dark:text-pink-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Knowledge Capsules</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage capsules</div>
                  </Link>
                  <Link to="/admin/email-queue" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-email">
                    <AlertCircle className="h-8 w-8 text-cyan-600 dark:text-cyan-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Queue</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor email delivery</div>
                  </Link>
                  <Link to="/admin/notifications" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-notifications">
                    <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send system notifications</div>
                  </Link>
                  <Link to="/admin/audit-logs" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-audit">
                    <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Audit Logs</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View admin actions</div>
                  </Link>
                  <Link to="/admin/file-uploads" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-files">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">File Uploads</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage uploaded files</div>
                  </Link>
                  <Link to="/admin/analytics" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-analytics">
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Analytics</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View platform stats</div>
                  </Link>
                  <Link to="/admin/settings" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 dark:border-gray-600 transition-all duration-200 hover:scale-[1.02] dark:bg-gray-800/50" data-testid="admin-link-settings">
                    <CheckCircle className="h-8 w-8 text-slate-600 dark:text-slate-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">System Settings</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure platform</div>
                  </Link>
                  <Link to="/admin/datasets/history" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-300 dark:border-blue-700" data-testid="admin-link-datasets">
                    <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Dataset Upload</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload & manage datasets</div>
                  </Link>
                  <Link to="/admin/ai/monitor" className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-red-500 transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-300 dark:border-purple-700" data-testid="admin-link-ai-monitor">
                    <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">AI System Monitor</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monitor AI health & metrics</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            </BlurFade>

            <BlurFade delay={0.5}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Verifications */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="dark:text-white">Pending Verifications</CardTitle>
                  <CardDescription className="dark:text-gray-400">Alumni profiles awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingVerifications.length > 0 ? (
                    <div className="space-y-3">
                      {pendingVerifications.slice(0, 5).map(profile => {
                        return (
                          <div key={profile.id || profile.user_id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                            <div className="flex items-center gap-3">
                              <img
                                src={profile.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_email || profile.email || 'user'}`}
                                alt={profile.name || profile.profile_name}
                                className="h-10 w-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                              />
                              <div>
                                <p className="font-medium text-sm dark:text-gray-100">{profile.name || profile.profile_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.user_email || profile.email}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-green-600 dark:text-green-400 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30">Approve</Button>
                              <Button size="sm" variant="outline" className="text-red-600 dark:text-red-400 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Reject</Button>
                            </div>
                          </div>
                        );
                      })}
                      <Button asChild variant="outline" className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" size="sm">
                        <Link to="/admin/verifications">View All</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50 dark:text-green-400" />
                      <p className="text-sm dark:text-gray-300">No pending verifications</p>
                      <p className="text-xs mt-1 dark:text-gray-500">All profiles are verified</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </SpotlightCard>

              {/* Recent Activity */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                  <CardDescription className="dark:text-gray-400">Latest platform actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'user' ? 'bg-blue-600 dark:bg-blue-400' :
                          activity.type === 'job' ? 'bg-green-600 dark:bg-green-400' :
                          activity.type === 'event' ? 'bg-purple-600 dark:bg-purple-400' :
                          'bg-yellow-600 dark:bg-yellow-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </SpotlightCard>

              {/* ML Data Status Widget - NEW */}
              <SpotlightCard>
              <div className="h-full">
              <MLDataStatusWidget 
                onUploadClick={() => navigate('/admin/career-data-upload')}
              />
              </div>
              </SpotlightCard>
            </div>
            </BlurFade>

            <BlurFade delay={0.6}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="dark:text-white">User Growth Over Time</CardTitle>
                  <CardDescription className="dark:text-gray-400">Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[
                      { month: 'Jul', users: 20 },
                      { month: 'Aug', users: 35 },
                      { month: 'Sep', users: 48 },
                      { month: 'Oct', users: 62 },
                      { month: 'Nov', users: 78 },
                      { month: 'Dec', users: systemStats?.totalUsers || 95 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </SpotlightCard>

              {/* Users by Role Pie Chart */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="dark:text-white">Users by Role</CardTitle>
                  <CardDescription className="dark:text-gray-400">Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Students', value: Math.round(systemStats?.totalUsers * 0.35) || 0, color: '#10b981' },
                          { name: 'Alumni', value: Math.round(systemStats?.totalUsers * 0.45) || 0, color: '#3b82f6' },
                          { name: 'Recruiters', value: Math.round(systemStats?.totalUsers * 0.15) || 0, color: '#8b5cf6' },
                          { name: 'Admins', value: Math.round(systemStats?.totalUsers * 0.05) || 0, color: '#ef4444' },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Students', value: Math.round(systemStats?.totalUsers * 0.35) || 0, color: '#10b981' },
                          { name: 'Alumni', value: Math.round(systemStats?.totalUsers * 0.45) || 0, color: '#3b82f6' },
                          { name: 'Recruiters', value: Math.round(systemStats?.totalUsers * 0.15) || 0, color: '#8b5cf6' },
                          { name: 'Admins', value: Math.round(systemStats?.totalUsers * 0.05) || 0, color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </SpotlightCard>

              {/* Job Postings Trend */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="dark:text-white">Job Postings Trend</CardTitle>
                  <CardDescription className="dark:text-gray-400">Monthly job postings activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { month: 'Jul', jobs: 5 },
                      { month: 'Aug', jobs: 8 },
                      { month: 'Sep', jobs: 12 },
                      { month: 'Oct', jobs: 15 },
                      { month: 'Nov', jobs: 18 },
                      { month: 'Dec', jobs: systemStats?.activeJobs || 22 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="jobs" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </SpotlightCard>

              {/* Event Participation */}
              <SpotlightCard>
              <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="dark:text-white">Event Participation</CardTitle>
                  <CardDescription className="dark:text-gray-400">Event registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={[
                      { month: 'Jul', registrations: 45 },
                      { month: 'Aug', registrations: 62 },
                      { month: 'Sep', registrations: 78 },
                      { month: 'Oct', registrations: 95 },
                      { month: 'Nov', registrations: 112 },
                      { month: 'Dec', registrations: 145 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="registrations" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </SpotlightCard>
            </div>
            </BlurFade>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;