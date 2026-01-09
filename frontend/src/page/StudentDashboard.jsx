import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, leaderboardService, mentorshipService, eventService, jobService } from '@/services';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { BlurFade, StaggerContainer, StaggerItem, BorderBeam, SpotlightCard } from '@/components/ui/aceternity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Calendar, MessageSquare, Award, TrendingUp, Eye, FileText, UserCheck, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePolling from '@/hooks/usePolling';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [engagementScore, setEngagementScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestGoals, setRequestGoals] = useState('');

  const loadData = async () => {
    try {
      const [profileData, appsData, mentorRequests, scoreData, eventsData, mentorsData] = await Promise.all([
        profileService.getProfileByUserId(user.id),
        profileService.getJobApplicationsByUser(user.id),
        profileService.getMentorshipRequestsByStudent(user.id),
        leaderboardService.getMyScore(user.id),
        eventService.getAllEvents({ is_upcoming: true }),
        mentorshipService.getMentors(),
      ]);

      setProfile(profileData?.data || profileData);
      setApplications(appsData || []);
      
      // Handle mentorship requests - could be array or object with data property
      const requests = Array.isArray(mentorRequests) ? mentorRequests : (mentorRequests?.data || []);
      setMentorshipRequests(requests);
      
      if (scoreData.success) setEngagementScore(scoreData.data);
      
      // Get upcoming events
      const events = eventsData?.data?.slice(0, 3) || [];
      setUpcomingEvents(events);

      // Get recommended mentors - handle both array and object responses
      let mentors = [];
      if (Array.isArray(mentorsData)) {
        mentors = mentorsData.slice(0, 3);
      } else if (Array.isArray(mentorsData?.data)) {
        mentors = mentorsData.data.slice(0, 3);
      }
      setRecommendedMentors(mentors);
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

  const handleConnectClick = (mentor) => {
    setSelectedMentor(mentor);
    setConnectDialogOpen(true);
    setRequestMessage('');
    setRequestGoals('');
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim() || !requestGoals.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await mentorshipService.createMentorshipRequest({
        student_id: user.id,
        mentor_id: selectedMentor.user_id,
        request_message: requestMessage,
        goals: requestGoals,
        preferred_topics: [],
      });

      if (result.success) {
        toast.success('Mentorship request sent successfully!');
        setConnectDialogOpen(false);
        setRequestMessage('');
        setRequestGoals('');
        // Reload mentorship requests
        const mentorRequests = await profileService.getMentorshipRequestsByStudent(user.id);
        setMentorshipRequests(mentorRequests);
      } else {
        toast.error('Failed to send request');
      }
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      toast.error('An error occurred');
    }
  };

  const handleViewMentorProfile = (mentorUserId) => {
    navigate(`/mentorship/mentor/${mentorUserId}`);
  };

  const profileCompletion = profile?.profile_completion_percentage || 0;
  const recentApplications = applications.slice(0, 3);
  const upcomingSessions = (Array.isArray(mentorshipRequests) ? mentorshipRequests : [])
    .filter(r => r.status === 'accepted')
    .slice(0, 2);

    return (
      <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
        <MainNavbar />
        
        <div className="flex flex-1">
          <Sidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <BlurFade delay={0.1}>
                <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-xl p-6 text-white relative overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <h1 className="text-3xl font-bold">Welcome back, Student! 👋</h1>
                      <p className="mt-2 opacity-90 text-blue-50">
                                              Ready to advance your career? Check out your personalized recommendations below.
                                            </p>
                                          </div>
                                          {engagementScore && engagementScore.total_score > 0 && (
                                            <Badge 
                                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-lg px-4 py-2 cursor-pointer flex items-center gap-2 transition-all duration-200 hover:scale-105"
                                              onClick={() => navigate('/leaderboard')}
                                              data-testid="engagement-points-badge"
                                            >
                                              <Trophy className="h-5 w-5" />
                                              {engagementScore.total_score} pts
                                            </Badge>
                                          )}
                                        </div>
                                        <BorderBeam size={250} duration={12} delay={9} />
                                      </div>
                                    </BlurFade>            {/* Profile Completion */}
            <BlurFade delay={0.2}>
              <SpotlightCard>
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-foreground">
                      <span>Profile Completion</span>
                      <span className="text-2xl font-bold text-primary">{profileCompletion}%</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Complete your profile to unlock all features and get better recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={profileCompletion} className="h-3 bg-muted" />
                    {profileCompletion < 100 && (
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="hover:scale-105 transition-transform duration-200">
                          <Link to="/profile">Complete Profile</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BlurFade>

            {/* Quick Actions */}
            <BlurFade delay={0.3}>
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription className="text-muted-foreground">Get started with these common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <StaggerContainer>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <StaggerItem>
                        <Link to="/mentorship/find" className="block p-4 border border-border rounded-xl bg-background/50 hover:bg-muted/50 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-sm" data-testid="find-mentor-btn">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <div className="text-sm font-medium text-foreground">Find a Mentor</div>
                          <div className="text-xs text-muted-foreground mt-1">Connect with experienced alumni</div>
                        </Link>
                      </StaggerItem>
                      <StaggerItem>
                        <Link to="/mentorship/dashboard" className="block p-4 border border-border rounded-xl bg-background/50 hover:bg-muted/50 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-sm" data-testid="my-mentorship-btn">
                          <UserCheck className="h-8 w-8 text-primary mb-2" />
                          <div className="text-sm font-medium text-foreground">My Mentorship</div>
                          <div className="text-xs text-muted-foreground mt-1">View sessions and requests</div>
                        </Link>
                      </StaggerItem>
                      <StaggerItem>
                        <Link to="/jobs" className="block p-4 border border-border rounded-xl bg-background/50 hover:bg-muted/50 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-sm" data-testid="browse-jobs-btn">
                          <Briefcase className="h-8 w-8 text-primary mb-2" />
                          <div className="text-sm font-medium text-foreground">Browse Jobs</div>
                          <div className="text-xs text-muted-foreground mt-1">Find your next opportunity</div>
                        </Link>
                      </StaggerItem>
                      <StaggerItem>
                        <Link to="/jobs/my-applications" className="block p-4 border border-border rounded-xl bg-background/50 hover:bg-muted/50 hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-sm" data-testid="my-applications-btn">
                          <FileText className="h-8 w-8 text-primary mb-2" />
                          <div className="text-sm font-medium text-foreground">My Applications</div>
                          <div className="text-xs text-muted-foreground mt-1">Track your applications</div>
                        </Link>
                      </StaggerItem>
                    </div>
                  </StaggerContainer>
                </CardContent>
              </Card>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <SpotlightCard>
                  <Card className="h-full bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-foreground">Recent Applications</CardTitle>
                      <CardDescription className="text-muted-foreground">Track your job application status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentApplications.length > 0 ? (
                        <div className="space-y-3">
                          {recentApplications.map(app => {
                            return (
                              <div 
                                key={app.id} 
                                className="flex items-start justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
                                onClick={() => navigate(`/jobs/${app.job_id}`)}
                                data-testid={`application-${app.id}`}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-foreground">{app.job_title || 'Job Title'}</p>
                                  <p className="text-xs text-muted-foreground">{app.job_company || app.company || 'Company'}</p>
                                  <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                      app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {app.status}
                                    </span>
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" data-testid={`view-application-${app.id}`}>
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            );
                          })}
                          <Button asChild variant="outline" className="w-full" size="sm" data-testid="view-all-applications-btn">
                            <Link to="/jobs/my-applications">View All Applications</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No applications yet</p>
                          <Button asChild size="sm" className="mt-3">
                            <Link to="/jobs">Browse Jobs</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SpotlightCard>

                {/* Recommended Mentors */}
                <SpotlightCard>
                  <Card className="h-full bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-foreground">Recommended Mentors</CardTitle>
                      <CardDescription className="text-muted-foreground">Connect with alumni in your field</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recommendedMentors.map(mentor => {
                          const hasRequested = mentorshipRequests.some(r => r.mentor_id === mentor.user_id && r.status === 'pending');
                          const isConnected = mentorshipRequests.some(r => r.mentor_id === mentor.user_id && r.status === 'accepted');
                          
                          return (
                            <div key={mentor.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all duration-200">
                              <div className="flex items-center gap-3">
                                <img
                                  src={mentor.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.email || mentor.user_email || 'mentor'}`}
                                  alt={mentor.name}
                                  className="h-10 w-10 rounded-full ring-2 ring-border"
                                />
                                <div>
                                  <p className="font-medium text-sm text-foreground">{mentor.name}</p>
                                  <p className="text-xs text-muted-foreground">{mentor.current_role}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewMentorProfile(mentor.user_id)}
                                  data-testid={`view-profile-${mentor.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleConnectClick(mentor)}
                                  disabled={hasRequested || isConnected}
                                  data-testid={`connect-btn-${mentor.id}`}
                                >
                                  {isConnected ? 'Connected' : hasRequested ? 'Requested' : 'Connect'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        <Button asChild variant="outline" className="w-full" size="sm">
                          <Link to="/mentorship/find">View All Mentors</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </div>
            </BlurFade>

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <BlurFade delay={0.5}>
                <SpotlightCard>
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-foreground">Upcoming Mentorship Sessions</CardTitle>
                      <CardDescription className="text-muted-foreground">Your scheduled sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {upcomingSessions.map(session => {
                          return (
                            <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-primary" />
                                <div>
                                  <p className="font-medium text-sm text-foreground">Session with {session.mentor_name || 'Mentor'}</p>
                                  <p className="text-xs text-muted-foreground">Status: {session.status}</p>
                                </div>
                              </div>
                              <Button size="sm" asChild>
                                <Link to="/mentorship/dashboard">View Details</Link>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </BlurFade>
            )}
          </div>
        </main>
      </div>
      
      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Request Mentorship</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send a mentorship request to {selectedMentor?.name || 'Mentor'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">Message *</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd like this person as a mentor..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals" className="text-foreground">Your Goals *</Label>
              <Textarea
                id="goals"
                placeholder="What do you hope to achieve with this mentorship?"
                value={requestGoals}
                onChange={(e) => setRequestGoals(e.target.value)}
                rows={3}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
