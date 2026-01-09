import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Clock, Eye, Users, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import ApplicationModal from '@/components/jobs/ApplicationModal';
import { jobService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        // Load job by ID (no prefix cleaning needed - database uses UUIDs)
        const response = await jobService.getJobById(jobId);
        
        // Consistent response handling
        if (!response.success || !response.data) {
          console.error('Job response:', response);
          toast.error('Job not found');
          navigate('/jobs');
          return;
        }
        
        const jobData = response.data;
        
        if (jobData && jobData.id) {
          setJob(jobData);
          
          // Check if user has applied (uses optimized caching)
          if (user) {
            try {
              const applied = await jobService.hasUserApplied(jobId, user.id);
              setHasApplied(applied);
            } catch (error) {
              console.error('Error checking application status:', error);
              // Continue even if this fails
            }
          }

          // Load similar jobs based on skills
          try {
            if (jobData.skills_required && jobData.skills_required.length > 0) {
              const filtered = await jobService.filterJobs({
                skills: jobData.skills_required.slice(0, 2),
              });
              setSimilarJobs(filtered.filter(j => j.id !== jobId).slice(0, 3));
            }
          } catch (error) {
            console.error('Error loading similar jobs:', error);
            // Continue even if this fails
          }
        } else {
          toast.error('Job not found');
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error loading job:', error);
        toast.error('Failed to load job details: ' + (error.message || 'Unknown error'));
        // Navigate back after a short delay to allow user to see the error
        setTimeout(() => navigate('/jobs'), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, user, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleApplyClick = () => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }

    if (user.role === 'recruiter' || user.role === 'admin') {
      toast.error('Recruiters and admins cannot apply for jobs');
      return;
    }

    setShowApplicationModal(true);
  };

  const handleApplicationModalClose = (submitted) => {
    setShowApplicationModal(false);
    if (submitted) {
      setHasApplied(true);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNavbar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-32 bg-muted rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'internship': 'bg-purple-100 text-purple-800',
      'contract': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300" data-testid="job-details-page">
      <MainNavbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/jobs')}
            className="mb-6 text-muted-foreground hover:text-foreground hover:bg-muted"
            data-testid="back-to-jobs-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card className="bg-card border-border shadow-md">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="job-title">{job.title}</h1>
                      <p className="text-xl text-primary font-medium" data-testid="job-company">
                        {job.company}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShare}
                      data-testid="share-job-btn"
                      className="border-border text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#7091E6]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#3D52A0]" />
                      <span>{job.experience_required}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#8697C4]" />
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <Badge className={`${getJobTypeColor(job.job_type)} border-none px-3 py-1`}>
                      {job.job_type}
                    </Badge>
                    {job.application_deadline && (
                      <Badge variant="outline" className="border-border text-muted-foreground px-3 py-1">
                        <Clock className="w-3 h-3 mr-1.5" />
                        Apply by {formatDate(job.application_deadline)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <Separator className="bg-border" />

                <CardContent className="pt-8">
                  <div className="space-y-8">
                    {/* Job Description */}
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Job Description</h2>
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="job-description">
                        {job.description}
                      </div>
                    </div>

                    {/* Skills Required */}
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">Required Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required?.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground border-border px-3 py-1" data-testid={`skill-badge-${index}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-foreground">Similar Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {similarJobs.map((similarJob) => (
                        <div
                          key={similarJob.id}
                          className="p-4 border border-border rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200"
                          onClick={() => navigate(`/jobs/${similarJob.id}`)}
                        >
                          <h3 className="font-semibold text-foreground mb-1">{similarJob.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {similarJob.company} • {similarJob.location}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {similarJob.skills_required?.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] bg-secondary/50 py-0 h-5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="bg-card border-border shadow-md overflow-hidden">
                <CardContent className="pt-8">
                  {hasApplied ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm font-bold text-foreground mb-2">
                        Application Submitted
                      </p>
                      <p className="text-xs text-muted-foreground mb-6">
                        You have already applied to this job. We'll notify you if there's an update.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full border-border text-foreground hover:bg-muted"
                        onClick={() => navigate('/jobs/my-applications')}
                      >
                        View My Applications
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg h-12 text-lg font-bold"
                        size="lg"
                        onClick={handleApplyClick}
                        data-testid="apply-now-btn"
                      >
                        Apply Now
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        By applying, you agree to our terms of service
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">Job Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4 text-primary" />
                      <span>Views</span>
                    </div>
                    <span className="font-bold text-foreground">{job.views_count || 0}</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-accent" />
                      <span>Applications</span>
                    </div>
                    <span className="font-bold text-foreground">{job.applications_count || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {job.company}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-primary text-xs hover:no-underline">
                    View Company Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={handleApplicationModalClose}
          job={job}
          userId={user?.id}
        />
      )}
    </div>
  );
};

export default JobDetails;