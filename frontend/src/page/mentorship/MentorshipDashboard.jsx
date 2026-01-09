import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle2, Calendar, MessageSquare, Plus, Settings } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SessionCard from '@/components/mentorship/SessionCard';
import RequestCard from '@/components/mentorship/RequestCard';
import ScheduleSessionModal from '@/components/mentorship/ScheduleSessionModal';
import FeedbackModal from '@/components/mentorship/FeedbackModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mentorshipService } from '@/services';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
    <p className="text-muted-foreground font-medium">Loading mentorship dashboard...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-background px-4">
    <div className="text-destructive mb-6 bg-destructive/10 p-4 rounded-full">
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2 text-center">Unable to Load Dashboard</h3>
    <p className="text-muted-foreground mb-8 text-center max-w-md leading-relaxed">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
        Try Again
      </Button>
    )}
  </div>
);

const MentorshipDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isMentor, setIsMentor] = useState(false);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [activeMentees, setActiveMentees] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user);
    if (user.id) {
      initializeData(user.id);
    }
  }, []);

  const initializeData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is also a mentor
      const mentorResult = await mentorshipService.getMentorByUserId(userId);
      setIsMentor(mentorResult.success && mentorResult.data);

      await loadData(userId);
    } catch (err) {
      console.error('Error initializing dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (userId) => {
    try {
      console.log('Loading mentorship data for user:', userId);
      
      // Student data
      const mentorshipsResult = await mentorshipService.getActiveMentorships(userId);
      console.log('Active Mentorships Response:', mentorshipsResult);
      if (mentorshipsResult.success) {
        console.log('Active Mentorships Data:', mentorshipsResult.data);
        setActiveMentorships(mentorshipsResult.data || []);
      } else {
        console.warn('Failed to load active mentorships:', mentorshipsResult.message);
      }

      const stuRequestsResult = await mentorshipService.getStudentRequests(userId);
      console.log('Student Requests Response:', stuRequestsResult);
      if (stuRequestsResult.success) {
        console.log('Student Requests Data:', stuRequestsResult.data);
        setStudentRequests(stuRequestsResult.data || []);
      } else {
        console.warn('Failed to load student requests:', stuRequestsResult.message);
      }

      // Mentor data
      const menteesResult = await mentorshipService.getActiveMentees(userId);
      console.log('Active Mentees Response:', menteesResult);
      if (menteesResult.success) {
        console.log('Active Mentees Data:', menteesResult.data);
        setActiveMentees(menteesResult.data || []);
      } else {
        console.warn('Failed to load active mentees:', menteesResult.message);
      }

      const menRequestsResult = await mentorshipService.getMentorRequests(userId);
      console.log('Mentor Requests Response:', menRequestsResult);
      if (menRequestsResult.success) {
        console.log('Mentor Requests Data:', menRequestsResult.data);
        setMentorRequests(menRequestsResult.data || []);
      } else {
        console.warn('Failed to load mentor requests:', menRequestsResult.message);
      }

      // Sessions
      const upcomingResult = await mentorshipService.getUpcomingSessions(userId);
      console.log('Upcoming Sessions Response:', upcomingResult);
      if (upcomingResult.success) {
        console.log('Upcoming Sessions Data:', upcomingResult.data);
        setUpcomingSessions(upcomingResult.data || []);
      } else {
        console.warn('Failed to load upcoming sessions:', upcomingResult.message);
      }

      const pastResult = await mentorshipService.getPastSessions(userId);
      console.log('Past Sessions Response:', pastResult);
      if (pastResult.success) {
        console.log('Past Sessions Data:', pastResult.data);
        setPastSessions(pastResult.data || []);
      } else {
        console.warn('Failed to load past sessions:', pastResult.message);
      }

      // Log total data count for debugging
      const totalDataCount = (mentorshipsResult.data?.length || 0) + 
                            (stuRequestsResult.data?.length || 0) + 
                            (menteesResult.data?.length || 0) + 
                            (menRequestsResult.data?.length || 0);
      
      console.log('Total Mentorship Data Count:', totalDataCount);
      
      if (totalDataCount === 0) {
        console.warn('⚠️ No mentorship data found for user:', userId);
        console.log('💡 Sample user IDs with data:', [
          '880e8400-e29b-41d4-a716-446655440003 (student)',
          '660e8400-e29b-41d4-a716-446655440001 (mentor)'
        ]);
      }
    } catch (err) {
      console.error('Error loading mentorship data:', err);
      toast.error('Some data could not be loaded');
    }
  };

  const handleAcceptRequest = async (request) => {
    const result = await mentorshipService.acceptMentorshipRequest(request.id);
    if (result.success) {
      toast.success('Mentorship request accepted!');
      loadData(userData.id);
    } else {
      toast.error(result.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (request) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    const result = await mentorshipService.rejectMentorshipRequest(request.id, reason || '');
    if (result.success) {
      toast.success('Mentorship request rejected');
      loadData(userData.id);
    } else {
      toast.error(result.error || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (request) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      const result = await mentorshipService.cancelMentorshipRequest(request.id);
      if (result.success) {
        toast.success('Mentorship request cancelled');
        loadData(userData.id);
      } else {
        toast.error(result.error || 'Failed to cancel request');
      }
    }
  };

  const handleScheduleSession = (mentorship) => {
    setSelectedMentorship(mentorship);
    setShowScheduleModal(true);
  };

  const handleViewSessionDetails = (session) => {
    navigate(`/mentorship/sessions/${session.id}`);
  };

  const handleJoinMeeting = (session) => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    } else {
      toast.error('No meeting link available');
    }
  };

  const handleProvideFeedback = (session) => {
    setSelectedSession(session);
    setShowFeedbackModal(true);
  };

  const handleViewProfile = (profile) => {
    navigate(`/profile/${profile.user_id}`);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorMessage message={error} onRetry={() => initializeData(userData.id)} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="mentorship-dashboard">
        {/* Development Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-6 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-wider text-xs">
              <Settings className="h-4 w-4" />
              <span>Developer Debug Tools</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">User ID:</span>
                <p className="text-foreground font-mono text-[10px] break-all bg-background p-1.5 rounded border border-border">{userData?.id || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">Relationships:</span>
                <div className="flex gap-3 mt-1">
                  <Badge variant="outline" className="bg-background">{activeMentorships.length} Mentors</Badge>
                  <Badge variant="outline" className="bg-background">{activeMentees.length} Mentees</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">Requests:</span>
                <div className="flex gap-3 mt-1">
                  <Badge variant="outline" className="bg-background">{studentRequests.length} Sent</Badge>
                  <Badge variant="outline" className="bg-background">{mentorRequests.length} Recv</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">Sessions:</span>
                <div className="flex gap-3 mt-1">
                  <Badge variant="outline" className="bg-background">{upcomingSessions.length} Up</Badge>
                  <Badge variant="outline" className="bg-background">{pastSessions.length} Past</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
                Mentorship Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Empower your journey through meaningful guidance and connection
              </p>
            </div>
          </div>
        </div>

        {/* Role Tabs */}
        <Tabs defaultValue={isMentor ? 'mentor' : 'student'} className="space-y-8">
          <TabsList className="bg-card border border-border p-1 h-12 w-full max-w-md">
            <TabsTrigger value="student" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="student-tab">
              <Users className="h-4 w-4 mr-2" />
              As Mentee
            </TabsTrigger>
            {isMentor && (
              <TabsTrigger value="mentor" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="mentor-tab">
                <Users className="h-4 w-4 mr-2" />
                As Mentor
              </TabsTrigger>
            )}
          </TabsList>

          {/* Student/Mentee View */}
          <TabsContent value="student" className="space-y-10 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Mentors</p>
                      <p className="text-4xl font-bold text-foreground mt-2">{activeMentorships.length}</p>
                    </div>
                    <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Requests</p>
                      <p className="text-4xl font-bold text-foreground mt-2">
                        {studentRequests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                      <Clock className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</p>
                      <p className="text-4xl font-bold text-foreground mt-2">
                        {upcomingSessions.length + pastSessions.length}
                      </p>
                    </div>
                    <div className="h-14 w-14 bg-green-600/10 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Upcoming Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onViewDetails={handleViewSessionDetails}
                      onJoinMeeting={handleJoinMeeting}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Mentorships */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Active Mentorships
              </h2>
              {activeMentorships.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {activeMentorships.map((mentorship) => (
                    <Card key={mentorship.id} className="bg-card border-border shadow-sm overflow-hidden group hover:border-primary/50 transition-all">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch">
                          <div className="p-6 flex items-center gap-6 flex-1">
                            <Avatar className="h-20 w-24 rounded-2xl border-2 border-border group-hover:border-primary/30 transition-colors">
                              <AvatarImage src={mentorship.mentor?.profile?.photo_url} alt={mentorship.mentor?.profile?.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {getInitials(mentorship.mentor?.profile?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0">
                                  <h3 className="font-bold text-xl text-foreground truncate">
                                    {mentorship.mentor?.profile?.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {mentorship.mentor?.profile?.headline}
                                  </p>
                                </div>
                                <Badge className="bg-green-600/10 text-green-600 border-green-600/20 px-3 py-1">
                                  Active
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-4">
                                {mentorship.mentor?.expertise_areas?.slice(0, 3).map((area, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground border-border uppercase tracking-widest px-2">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/30 p-6 md:w-64 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProfile(mentorship.mentor?.profile)}
                              className="w-full border-border text-foreground hover:bg-muted"
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleScheduleSession(mentorship)}
                              data-testid={`schedule-session-${mentorship.id}`}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Session
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border border-dashed">
                  <CardContent className="p-20 text-center">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Ready to grow?</h3>
                    <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
                      {studentRequests.length === 0 
                        ? 'Connect with an experienced alumni mentor to get personalized guidance for your career journey.' 
                        : 'Your mentorship requests are pending approval. We will notify you once a mentor accepts!'}
                    </p>
                    <Button onClick={() => navigate('/mentorship/find')} data-testid="find-mentors-btn" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-lg font-bold">
                      Find a Mentor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pending Requests */}
            {studentRequests.filter(r => r.status === 'pending').length > 0 && (
              <div className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Sent Requests</h2>
                <div className="grid grid-cols-1 gap-4">
                  {studentRequests
                    .filter(r => r.status === 'pending')
                    .map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        userProfile={request.mentorProfile}
                        isStudentView={true}
                        onCancel={handleCancelRequest}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
              <div className="pt-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Recent Past Sessions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastSessions.slice(0, 4).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onViewDetails={handleViewSessionDetails}
                      onProvideFeedback={session.status === 'completed' && !session.feedback ? handleProvideFeedback : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Mentor View */}
          {isMentor && (
            <TabsContent value="mentor" className="space-y-10 animate-in fade-in duration-500">
              {/* Quick Action Banner */}
              <Card className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] text-white shadow-lg border-none overflow-hidden">
                <CardContent className="p-8 relative">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-[-20deg] translate-x-1/2"></div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold">Mentor Profile Settings</h3>
                      <p className="text-blue-50 mt-2 max-w-lg">
                        Keep your expertise, availability, and mentorship preferences updated to attract the right mentees.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/mentorship/manage')} data-testid="manage-profile-btn" className="bg-white text-primary hover:bg-blue-50 px-8 h-12 font-bold shadow-xl">
                      <Settings className="h-5 w-5 mr-2" />
                      Manage Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Mentees</p>
                        <p className="text-4xl font-bold text-foreground mt-2">{activeMentees.length}</p>
                      </div>
                      <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Users className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Requests Received</p>
                        <p className="text-4xl font-bold text-foreground mt-2">
                          {mentorRequests.filter(r => r.status === 'pending').length}
                        </p>
                      </div>
                      <div className="h-14 w-14 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <MessageSquare className="h-7 w-7 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</p>
                        <p className="text-4xl font-bold text-foreground mt-2">{upcomingSessions.length + pastSessions.length}</p>
                      </div>
                      <div className="h-14 w-14 bg-[#8697C4]/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="h-7 w-7 text-[#8697C4]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Mentorship Requests */}
              {mentorRequests.filter(r => r.status === 'pending').length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-accent" />
                    Incoming Requests
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {mentorRequests
                      .filter(r => r.status === 'pending')
                      .map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          userProfile={request.studentProfile}
                          isStudentView={false}
                          onAccept={handleAcceptRequest}
                          onReject={handleRejectRequest}
                          onViewProfile={handleViewProfile}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Active Mentees */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Your Active Mentees
                </h2>
                {activeMentees.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {activeMentees.map((mentee) => (
                      <Card key={mentee.id} className="bg-card border-border shadow-sm group hover:border-primary/50 transition-all overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row items-stretch">
                            <div className="p-6 flex items-start gap-6 flex-1">
                              <Avatar className="h-20 w-24 rounded-2xl border-2 border-border group-hover:border-primary/30 transition-colors">
                                <AvatarImage src={mentee.student?.profile?.photo_url} alt={mentee.student?.profile?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                  {getInitials(mentee.student?.profile?.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 space-y-2">
                                <h3 className="font-bold text-xl text-foreground truncate">
                                  {mentee.student?.profile?.name || mentee.student?.email}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {mentee.student?.profile?.headline || 'Student'}
                                </p>
                                <div className="bg-muted/50 p-4 rounded-xl border border-border mt-4">
                                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Mentee Goals</p>
                                  <p className="text-sm text-foreground italic leading-relaxed">
                                    "{mentee.goals}"
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-muted/30 p-6 md:w-64 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewProfile(mentee.student?.profile)}
                                className="w-full border-border text-foreground hover:bg-muted"
                              >
                                View Profile
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleScheduleSession(mentee)}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Session
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-card border-border border-dashed">
                    <CardContent className="p-20 text-center">
                      <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">No active mentees yet</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed mb-4">
                        {mentorRequests.filter(r => r.status === 'pending').length > 0
                          ? 'Review and accept the incoming mentorship requests to start sharing your expertise.'
                          : 'Your journey as a mentor is about to begin. Students will send you requests based on your profile expertise areas.'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Mentor Sessions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onViewDetails={handleViewSessionDetails}
                        onJoinMeeting={handleJoinMeeting}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      {showScheduleModal && selectedMentorship && (
        <ScheduleSessionModal
          mentorshipRequest={selectedMentorship}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedMentorship(null);
          }}
          onSuccess={() => {
            loadData(userData.id);
          }}
        />
      )}

      {showFeedbackModal && selectedSession && (
        <FeedbackModal
          session={selectedSession}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            loadData(userData.id);
          }}
        />
      )}
    </MainLayout>
  );
};

export default MentorshipDashboard;
