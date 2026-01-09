import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  UserCheck,
  Activity,
  Eye,
  MapPin,
  Award,
  Heart,
} from 'lucide-react';
import { adminService } from '@/services';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalPosts: 0,
    verifiedAlumni: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [platformActivity, setPlatformActivity] = useState([]);
  const [alumniData, setAlumniData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [mentorshipData, setMentorshipData] = useState(null);
  const [eventsData, setEventsData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all analytics in parallel
      const [
        dashboardResult,
        userGrowthResult,
        contributorsResult,
        activityResult,
        alumniResult,
        jobsResult,
        mentorshipResult,
        eventsResult,
        engagementResult
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUserGrowth('monthly'),
        adminService.getTopContributors(5),
        adminService.getPlatformActivity(30),
        adminService.getAlumniAnalytics(),
        adminService.getJobAnalytics(),
        adminService.getMentorshipAnalytics(),
        adminService.getEventAnalytics(),
        adminService.getEngagementMetrics()
      ]);

      // Set dashboard stats
      setAnalyticsData(dashboardResult || {
        totalUsers: 0,
        activeUsers: 0,
        totalJobs: 0,
        totalEvents: 0,
        totalPosts: 0,
        verifiedAlumni: 0,
      });

      // Set user growth data
      setUserGrowthData(userGrowthResult?.data || []);

      // Set top contributors
      setTopContributors(contributorsResult?.data || []);

      // Set platform activity
      setPlatformActivity(activityResult?.data || []);

      // Set alumni analytics
      setAlumniData(alumniResult);

      // Set jobs analytics
      setJobsData(jobsResult);

      // Set mentorship analytics
      setMentorshipData(mentorshipResult);

      // Set events analytics
      setEventsData(eventsResult);

      // Set engagement metrics
      setEngagementData(engagementResult);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const engagementMetrics = [
    {
      title: 'Total Users',
      value: analyticsData.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'text-[#3D52A0]',
      bgColor: 'bg-[#3D52A0]/10',
    },
    {
      title: 'Active Users',
      value: analyticsData.activeUsers || 0,
      change: '+8%',
      icon: Activity,
      color: 'text-[#7091E6]',
      bgColor: 'bg-[#7091E6]/10',
    },
    {
      title: 'Verified Alumni',
      value: analyticsData.verifiedAlumni || 0,
      change: '+15%',
      icon: UserCheck,
      color: 'text-[#8697C4]',
      bgColor: 'bg-[#8697C4]/10',
    },
    {
      title: 'Total Jobs',
      value: analyticsData.totalJobs || 0,
      change: '+20%',
      icon: Briefcase,
      color: 'text-[#3D52A0]',
      bgColor: 'bg-[#3D52A0]/10',
    },
    {
      title: 'Total Events',
      value: analyticsData.totalEvents || 0,
      change: '+5%',
      icon: Calendar,
      color: 'text-[#7091E6]',
      bgColor: 'bg-[#7091E6]/10',
    },
    {
      title: 'Forum Posts',
      value: analyticsData.forumPosts || analyticsData.totalPosts || 0,
      change: '+25%',
      icon: MessageSquare,
      color: 'text-[#8697C4]',
      bgColor: 'bg-[#8697C4]/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <LoadingSpinner message="Loading analytics..." />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <ErrorMessage message={error} onRetry={loadAllAnalytics} />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-lg p-6 text-white shadow-md">
              <h1 className="text-3xl font-bold">Analytics Dashboard 📊</h1>
              <p className="mt-2 opacity-90">Platform insights and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagementMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <Card key={index} data-testid={`metric-card-${index}`} className="dark:bg-card dark:border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.title}</p>
                          <div className="text-3xl font-bold mt-2 text-foreground">{metric.value}</div>
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">{metric.change} from last month</p>
                        </div>
                        <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                          <Icon className={`w-6 h-6 ${metric.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 dark:bg-gray-800 dark:border-gray-700">
                <TabsTrigger value="overview" data-testid="tab-overview" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" data-testid="tab-users" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Alumni
                </TabsTrigger>
                <TabsTrigger value="jobs" data-testid="tab-jobs" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="mentorship" data-testid="tab-mentorship" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Mentorship
                </TabsTrigger>
                <TabsTrigger value="events" data-testid="tab-events" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Events
                </TabsTrigger>
                <TabsTrigger value="engagement" data-testid="tab-engagement" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100 dark:text-gray-400">
                  Engagement
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* User Growth Chart */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">User Growth</CardTitle>
                    <CardDescription className="dark:text-gray-400">Monthly user registration trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-4">
                      {(userGrowthData && userGrowthData.length > 0) ? userGrowthData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:opacity-80 dark:from-blue-700 dark:to-blue-500"
                            style={{ height: `${(data.users / 100) * 100}%` }}
                          ></div>
                          <div className="text-sm font-medium mt-2 dark:text-gray-300">{data.month}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{data.users}</div>
                        </div>
                      )) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400">
                          No growth data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Platform Activity */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Platform Activity</CardTitle>
                      <CardDescription className="dark:text-gray-400">Recent activity breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(platformActivity && platformActivity.length > 0) ? platformActivity.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium dark:text-gray-200">{item.activity}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold dark:text-gray-100">{item.count}</p>
                              <p className="text-xs text-green-600 dark:text-green-400">{item.trend}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">No activity data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Contributors */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Top Contributors</CardTitle>
                      <CardDescription className="dark:text-gray-400">Most active users this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(topContributors && topContributors.length > 0) ? topContributors.map((contributor, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.email}`}
                              alt={contributor.name}
                              className="w-10 h-10 rounded-full bg-white"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium dark:text-gray-200">{contributor.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{contributor.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold dark:text-gray-100">{contributor.contributions}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">actions</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">No contributor data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Alumni Analytics Tab */}
              <TabsContent value="users" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alumni by Location */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Alumni by Location</CardTitle>
                      <CardDescription className="dark:text-gray-400">Geographic distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alumniData?.locationDistribution || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="location" type="category" width={100} stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Companies */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Top Companies</CardTitle>
                      <CardDescription className="dark:text-gray-400">Where our alumni work</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alumniData?.topCompanies || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="company" type="category" width={80} stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Skills */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Top Skills</CardTitle>
                      <CardDescription className="dark:text-gray-400">Most common skills among alumni</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(alumniData?.topSkills && alumniData.topSkills.length > 0) ? alumniData.topSkills.map((item, index) => {
                          const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
                          const maxCount = Math.max(...alumniData.topSkills.map(s => s.count));
                          return (
                            <div key={index} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium dark:text-gray-200">{item.skill}</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} alumni</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div className={`${colors[index % colors.length]} h-2 rounded-full`} style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">No skill data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Batch Distribution */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Batch Distribution</CardTitle>
                      <CardDescription className="dark:text-gray-400">Alumni by graduation year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alumniData?.batchDistribution || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Jobs Analytics Tab */}
              <TabsContent value="jobs" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{jobsData?.totalJobs || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Jobs Posted</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{jobsData?.totalApplications || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Applications</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {jobsData?.averageApplicationsPerJob || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Applications/Job</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{jobsData?.averageDaysToHire || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Days to Hire (Avg)</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Job Categories */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Jobs by Category</CardTitle>
                      <CardDescription className="dark:text-gray-400">Distribution of job types</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={jobsData?.jobsByType || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(jobsData?.jobsByType || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Jobs by Location */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Jobs by Location</CardTitle>
                      <CardDescription className="dark:text-gray-400">Geographic job distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={jobsData?.jobsByLocation || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" stroke="#9ca3af" />
                          <YAxis dataKey="location" type="category" width={100} stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="jobs" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Application Trends */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Application Trends</CardTitle>
                      <CardDescription className="dark:text-gray-400">Applications over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={jobsData?.applicationTrends || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Legend />
                          <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Skills Required */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Most Demanded Skills</CardTitle>
                      <CardDescription className="dark:text-gray-400">Skills required in job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={jobsData?.topSkillsRequired || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="skill" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Mentorship Analytics Tab */}
              <TabsContent value="mentorship" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{mentorshipData?.totalRequests || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Mentorships</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mentorshipData?.activeMentors || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Mentors</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{mentorshipData?.completedSessions || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sessions Completed</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mentorshipData?.averageRating || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Mentorship Requests Status */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Mentorship Requests</CardTitle>
                      <CardDescription className="dark:text-gray-400">Status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={mentorshipData?.requestsByStatus || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(mentorshipData?.requestsByStatus || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Sessions Over Time */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Sessions Over Time</CardTitle>
                      <CardDescription className="dark:text-gray-400">Monthly session trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={mentorshipData?.sessionsOverTime || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Area type="monotone" dataKey="sessions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Expertise Areas */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Top Expertise Areas</CardTitle>
                      <CardDescription className="dark:text-gray-400">Most popular mentorship topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mentorshipData?.topExpertiseAreas || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="area" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Mentor Ratings Distribution */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Mentor Ratings</CardTitle>
                      <CardDescription className="dark:text-gray-400">Rating distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={mentorshipData?.ratingDistribution || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" stroke="#9ca3af" />
                          <YAxis dataKey="stars" type="category" width={80} stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Events Analytics Tab */}
              <TabsContent value="events" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{eventsData?.totalEvents || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Events</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{eventsData?.totalRegistrations || 0}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Registrations</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{eventsData?.attendanceRate || 0}%</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Attendance Rate</p>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {eventsData?.averageAttendance || 0}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Attendance/Event</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Events by Type */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Events by Type</CardTitle>
                      <CardDescription className="dark:text-gray-400">Distribution of event categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={eventsData?.eventsByType || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(eventsData?.eventsByType || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Event Participation Trend */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Participation Trend</CardTitle>
                      <CardDescription className="dark:text-gray-400">Monthly event registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={eventsData?.participationTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Legend />
                          <Line type="monotone" dataKey="registrations" stroke="#ec4899" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Virtual vs In-Person */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Event Format</CardTitle>
                      <CardDescription className="dark:text-gray-400">Virtual vs In-person events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={eventsData?.eventsByFormat || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="format" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                          <Bar dataKey="count" fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Event Topics */}
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-gray-100">Popular Topics</CardTitle>
                      <CardDescription className="dark:text-gray-400">Most attended event topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(eventsData?.popularTopics && eventsData.popularTopics.length > 0) ? eventsData.popularTopics.map((item, index) => {
                          const maxCount = Math.max(...eventsData.popularTopics.map(t => t.count));
                          return (
                            <div key={index} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium dark:text-gray-200">{item.topic}</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.count} attendees</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center text-gray-500 dark:text-gray-400">No topic data available</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6 mt-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Engagement Metrics</CardTitle>
                    <CardDescription className="dark:text-gray-400">User engagement and activity levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium dark:text-gray-200">Daily Active Users</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{engagementData?.dailyActivePercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${engagementData?.dailyActivePercentage || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium dark:text-gray-200">Weekly Active Users</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{engagementData?.weeklyActivePercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                          <div className="bg-green-600 h-3 rounded-full" style={{ width: `${engagementData?.weeklyActivePercentage || 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium dark:text-gray-200">Monthly Active Users</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{engagementData?.monthlyActivePercentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                          <div className="bg-purple-600 h-3 rounded-full" style={{ width: `${engagementData?.monthlyActivePercentage || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminAnalytics;