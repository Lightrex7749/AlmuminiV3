import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, leaderboardService, eventService } from '@/services';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, Briefcase, Calendar, TrendingUp, Award, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePolling from '@/hooks/usePolling';
import { BlurFade, StaggerContainer, StaggerItem, BorderBeam, SpotlightCard } from '@/components/ui/aceternity';
import { AnimatedTabs } from '@/components/ui/animated-tabs';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [engagementScore, setEngagementScore] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profileData, mentorData, mentorRequests, jobsData, scoreData, eventsData] = await Promise.all([
        profileService.getProfileByUserId(user.id),
        profileService.getMentorProfile(user.id),
        profileService.getMentorshipRequestsByMentor(user.id),
        profileService.getJobsByPoster(user.id),
        leaderboardService.getMyScore(user.id),
        eventService.getUpcomingEvents(),
      ]);

      if (profileData?.success) setProfile(profileData.data);
      if (mentorData?.success) setMentorProfile(mentorData.data);
      
      setMentorshipRequests(Array.isArray(mentorRequests) ? mentorRequests : []);
      setPostedJobs(Array.isArray(jobsData) ? jobsData : []);
      
      if (scoreData?.success) setEngagementScore(scoreData.data);
      
      // Get upcoming events
      if (eventsData?.success) {
        const events = (eventsData.data || []).slice(0, 3);
        setUpcomingEvents(events);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Some dashboard data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Poll dashboard data every 60 seconds
  usePolling(loadData, 60000);

  const pendingRequests = mentorshipRequests.filter(r => r.status === 'pending');
  const activeJobs = postedJobs.filter(j => j.status === 'active');

  const stats = [
    {
      title: 'Profile Views',
      value: '1,234',
      icon: Eye,
      change: '+12% this month',
      changeType: 'positive',
    },
    {
      title: 'Connections',
      value: profile?.profile_completion_percentage || 0,
      icon: Users,
      change: 'Profile completion',
      changeType: 'neutral',
    },
    {
      title: 'Posted Jobs',
      value: postedJobs.length,
      icon: Briefcase,
      change: `${activeJobs.length} active`,
      changeType: 'positive',
    },
    {
      title: 'Engagement Score',
      value: engagementScore?.total_score || 0,
      icon: Award,
      change: `Rank #${engagementScore?.rank_position || '-'}`,
      changeType: 'positive',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300">
      <MainNavbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <BlurFade delay={0.1}>
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-white overflow-hidden shadow-2xl dark:shadow-purple-900/20">
              {/* Animated background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🎓</span>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">Welcome back, {profile?.name || 'Alumni'}!</h1>
                      <p className="text-purple-100 mt-1 text-sm flex items-center gap-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">Alumni</span>
                        Making an impact
                      </p>
                    </div>
                  </div>
                  <p className="text-purple-50 text-lg max-w-2xl">
                    Thank you for giving back to the community. Your contributions make a difference!
                  </p>
                </div>
                {engagementScore && engagementScore.total_score > 0 && (
                  <Badge 
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 text-lg px-5 py-3 cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate('/leaderboard')}
                    data-testid="engagement-points-badge"
                  >
                    <Trophy className="h-5 w-5" />
                    <span className="font-bold">{engagementScore.total_score}</span>
                    <span className="text-sm">points</span>
                  </Badge>
                )}
              </div>
            </div>
            </BlurFade>

            {/* Stats Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={index}>
                  <SpotlightCard className="h-full bg-white dark:bg-card border-none shadow-md dark:shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className={`text-xs mt-1 ${
                        stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                        stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                        'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </SpotlightCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Quick Actions with Animated Tabs */}
            <Card className="border-none shadow-md dark:bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-muted-foreground">Manage your contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatedTabs
                  tabs={[
                    {
                      title: "Post Job",
                      value: "jobs",
                      content: (
                        <div className="p-6 border dark:border-purple-900/30 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                          <Briefcase className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Post a Job Opening</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Help students and fellow alumni find great opportunities. Share job openings from your company.
                          </p>
                          <Link to="/jobs/post">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
                              Post a Job
                            </Button>
                          </Link>
                        </div>
                      )
                    },
                    {
                      title: "Create Event",
                      value: "events",
                      content: (
                        <div className="p-6 border dark:border-blue-900/30 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                          <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Organize an Event</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Host workshops, webinars, or networking events. Share your knowledge and experience with the community.
                          </p>
                          <Link to="/events/create">
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none">
                              Create Event
                            </Button>
                          </Link>
                        </div>
                      )
                    },
                    {
                      title: "Mentorship",
                      value: "mentorship",
                      content: (
                        <div className="p-6 border dark:border-green-900/30 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                          <Users className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Become a Mentor</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Guide students and recent graduates. Share your expertise and help shape the next generation of professionals.
                          </p>
                          <Link to="/mentorship/dashboard">
                            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none">
                              View Mentorship
                            </Button>
                          </Link>
                        </div>
                      )
                    },
                    {
                      title: "Analytics",
                      value: "analytics",
                      content: (
                        <div className="p-6 border dark:border-orange-900/30 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                          <TrendingUp className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Impact</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Track your engagement, contributions, and see how you're making a difference in the community.
                          </p>
                          <Link to="/leaderboard">
                            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-none">
                              View Leaderboard
                            </Button>
                          </Link>
                        </div>
                      )
                    }
                  ]}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentorship Requests */}
              <Card className="border-none shadow-md dark:bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Mentorship Requests</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mentorshipRequests.length > 0 ? (
                    <div className="space-y-3">
                      {mentorshipRequests.slice(0, 3).map(request => (
                          <div key={request.id} className="flex items-start justify-between p-3 border dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/50">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">{request.student_name || request.student_email || 'Student'}</p>
                              <p className="text-xs text-muted-foreground mt-1">{request.request_message?.substring(0, 60)}...</p>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                  request.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      <Button asChild variant="outline" className="w-full dark:border-gray-700 dark:text-gray-300" size="sm">
                        <Link to="/mentorship/dashboard">View All Requests</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No mentorship requests yet</p>
                      <p className="text-xs mt-1">Enable mentorship in your profile settings</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Posted Jobs Performance */}
              <Card className="border-none shadow-md dark:bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Posted Jobs</CardTitle>
                  <CardDescription className="text-muted-foreground">Performance of your job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  {postedJobs.length > 0 ? (
                    <div className="space-y-3">
                      {postedJobs.slice(0, 3).map(job => (
                        <div key={job.id} className="flex items-start justify-between p-3 border dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/50">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.company}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>👁️ {job.views_count} views</span>
                              <span>📄 {job.applications_count} applications</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full dark:border-gray-700 dark:text-gray-300" size="sm">
                        <Link to="/jobs/manage">Manage Jobs</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No jobs posted yet</p>
                      <Button asChild size="sm" className="mt-3">
                        <Link to="/jobs/post">Post a Job</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="border-none shadow-md dark:bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Upcoming Events</CardTitle>
                <CardDescription className="text-muted-foreground">Events you might be interested in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-sm text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.start_date).toLocaleDateString()} • {event.is_virtual ? 'Virtual' : event.location}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-300">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AlumniDashboard;