import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { jobService } from '@/services';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Eye, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import usePolling from '@/hooks/usePolling';
import { BlurFade, StaggerContainer, StaggerItem, BorderBeam, SpotlightCard } from '@/components/ui/aceternity';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      // Load jobs posted by this recruiter
      const jobsResponse = await jobService.getMyJobs(user.id);
      if (!jobsResponse.success) {
        throw new Error(jobsResponse.error || 'Failed to load jobs');
      }
      const jobs = jobsResponse.data || [];
      setPostedJobs(jobs);

      // Load all applications for recruiter's jobs
      const appsResponse = await jobService.getAllRecruiterApplications(user.id);
      if (!appsResponse.success) {
        throw new Error(appsResponse.error || 'Failed to load applications');
      }
      setAllApplications(appsResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Poll dashboard data every 60 seconds
  usePolling(loadData, 60000);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <BlurFade delay={0.1}>
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">Error Loading Dashboard</h3>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const activeJobs = postedJobs.filter(j => j.status === 'active');
  const totalApplications = allApplications.length;
  const totalViews = postedJobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
  const recentApplications = allApplications.slice(0, 5);

  const stats = [
    {
      title: 'Active Jobs',
      value: activeJobs.length,
      icon: Briefcase,
      change: `${postedJobs.length} total`,
      changeType: 'neutral',
    },
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: FileText,
      change: `${recentApplications.length} new`,
      changeType: 'positive',
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: Eye,
      change: '+15% this week',
      changeType: 'positive',
    },
    {
      title: 'Avg. Applications',
      value: postedJobs.length > 0 ? Math.round(totalApplications / postedJobs.length) : 0,
      icon: TrendingUp,
      change: 'per job',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <MainNavbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-emerald-900 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <BorderBeam size={250} duration={12} delay={9} />
                <h1 className="text-3xl font-bold">Welcome back, Recruiter! 💼</h1>
                <p className="mt-2 opacity-90">
                  Manage your job postings and connect with talented candidates.
                </p>
              </div>
            </BlurFade>

            {/* Stats Grid */}
            <BlurFade delay={0.2}>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <StaggerItem key={index}>
                      <SpotlightCard className="h-full">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-green-200/50 dark:border-green-700/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium dark:text-gray-200">
                              {stat.title}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
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
            <BlurFade delay={0.3}>
              <SpotlightCard>
                <Card className="dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                    <CardDescription className="dark:text-gray-400">Manage your recruitment activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link to="/jobs/post" className="p-4 border dark:border-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-600 transition-all duration-300 group">
                        <Briefcase className="h-8 w-8 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Post New Job</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Create a new job posting</div>
                      </Link>
                      <Link to="/directory" className="p-4 border dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 group">
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Browse Alumni</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Find qualified candidates</div>
                      </Link>
                      <Link to="/jobs/all-applications" className="p-4 border dark:border-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 dark:hover:border-purple-600 transition-all duration-300 group" data-testid="view-all-applications-card">
                        <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">View All Applications</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage all job applications</div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Posted Jobs */}
                <SpotlightCard>
                  <Card className="dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-lg transition-all duration-300 h-full">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Your Posted Jobs</CardTitle>
                      <CardDescription className="dark:text-gray-400">Manage your active job postings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                      ) : postedJobs.length > 0 ? (
                        <div className="space-y-3">
                          {postedJobs.slice(0, 5).map(job => {
                            const jobApplications = allApplications.filter(app => app.job_id === job.id);
                            return (
                              <div key={job.id} className="p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm dark:text-white">{job.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.company}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                      <span>👁️ {job.views_count || 0} views</span>
                                      <span>📄 {jobApplications.length} applications</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                    {job.status}
                                  </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-500 transition-colors duration-300"
                                    onClick={() => navigate(`/jobs/${job.id}/applications`)}
                                    data-testid={`view-applications-btn-${job.id}`}
                                  >
                                    View Applications
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-500 transition-colors duration-300"
                                    onClick={() => navigate(`/jobs/edit/${job.id}`)}
                                    data-testid={`edit-job-btn-${job.id}`}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          <Button asChild variant="outline" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-500 transition-colors duration-300" size="sm">
                            <Link to="/jobs/manage">View All Jobs</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No jobs posted yet</p>
                          <Button asChild size="sm" className="mt-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                            <Link to="/jobs/post">Post Your First Job</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SpotlightCard>

                {/* Recent Applications */}
                <SpotlightCard>
                  <Card className="dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-lg transition-all duration-300 h-full">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Recent Applications</CardTitle>
                      <CardDescription className="dark:text-gray-400">Latest applications to your jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-400"></div>
                          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                      ) : recentApplications.length > 0 ? (
                        <div className="space-y-3">
                          {recentApplications.map(app => {
                            const job = postedJobs.find(j => j.id === app.job_id);
                            return (
                              <div key={app.id} className="flex items-start justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
                                <div className="flex-1">
                                  <p className="font-medium text-sm dark:text-white">Application for {job?.title || 'Job'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Applicant ID: {app.applicant_id}</p>
                                  <div className="mt-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                      app.status === 'shortlisted' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                    }`}>
                                      {app.status}
                                    </span>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:border-green-500 transition-colors duration-300"
                                  onClick={() => navigate(`/jobs/${app.job_id}/applications`)}
                                  data-testid={`review-application-btn-${app.id}`}
                                >
                                  Review
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No applications yet</p>
                          <p className="text-xs mt-1">Applications will appear here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </div>
            </BlurFade>

            {/* Job Performance */}
            <BlurFade delay={0.5}>
              <SpotlightCard>
                <Card className="dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Job Performance Analytics</CardTitle>
                    <CardDescription className="dark:text-gray-400">Overview of your recruitment metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border dark:border-gray-700 rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeJobs.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Jobs</div>
                      </div>
                      <div className="text-center p-4 border dark:border-gray-700 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalApplications}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Applications</div>
                      </div>
                      <div className="text-center p-4 border dark:border-gray-700 rounded-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {totalViews > 0 && activeJobs.length > 0 ? Math.round((totalApplications / totalViews) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Application Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BlurFade>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;