import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, Briefcase, TrendingUp } from 'lucide-react';
import { adminService } from '@/services';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { toast } from 'sonner';

const AdminJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAllJobs();
      setJobs(result.data || []);
      setFilteredJobs(result.data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    // Filter jobs
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((j) => j.status === statusFilter);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, statusFilter, jobs]);

  const handleViewJob = async (jobId) => {
    try {
      const result = await adminService.getJobDetails(jobId);
      setSelectedJob(result.data);
      setShowJobModal(true);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Unable to load job details. Please try again.');
    }
  };

  const handleChangeStatus = async (jobId, newStatus) => {
    try {
      await adminService.updateJob(jobId, { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      toast.success(`Job status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Unable to update job status. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await adminService.deleteJob(jobId);
        setJobs(jobs.filter((j) => j.id !== jobId));
        toast.success('Job deleted successfully');
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error('Unable to delete job. Please try again.');
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Jobs', value: jobs.length, color: 'text-blue-600', icon: Briefcase },
    { label: 'Active', value: jobs.filter((j) => j.status === 'active').length, color: 'text-green-600', icon: CheckCircle },
    { label: 'Closed', value: jobs.filter((j) => j.status === 'closed').length, color: 'text-red-600', icon: XCircle },
    { label: 'Total Applications', value: jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0), color: 'text-purple-600', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <LoadingSpinner message="Loading jobs..." />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <ErrorMessage message={error} onRetry={loadJobs} />
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
              <h1 className="text-3xl font-bold">Job Management 💼</h1>
              <p className="mt-2 opacity-90">Manage all job postings on the platform</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                        <Icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Jobs List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">All Job Postings</CardTitle>
                <CardDescription className="text-muted-foreground">View and manage all jobs posted on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by title or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="job-search-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['all', 'active', 'closed', 'draft'].map((status) => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className="capitalize"
                          data-testid={`filter-${status}-btn`}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Jobs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 font-medium text-foreground">Job Title</th>
                        <th className="pb-3 font-medium text-foreground">Company</th>
                        <th className="pb-3 font-medium text-foreground">Type</th>
                        <th className="pb-3 font-medium text-foreground">Status</th>
                        <th className="pb-3 font-medium text-foreground">Applications</th>
                        <th className="pb-3 font-medium text-foreground">Posted</th>
                        <th className="pb-3 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`job-row-${job.id}`}>
                          <td className="py-4">
                            <div>
                              <p className="font-medium text-foreground">{job.title}</p>
                              <p className="text-xs text-muted-foreground">{job.location}</p>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-foreground">{job.company}</td>
                          <td className="py-4">
                            <Badge variant="outline" className="capitalize border-border text-foreground">
                              {job.job_type}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge className={`capitalize ${getStatusBadgeColor(job.status)}`}>
                              {job.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-foreground">{job.applications_count || 0}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`job-actions-${job.id}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewJob(job.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {job.status === 'active' && (
                                  <DropdownMenuItem onClick={() => handleChangeStatus(job.id, 'closed')}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Close Job
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'closed' && (
                                  <DropdownMenuItem onClick={() => handleChangeStatus(job.id, 'active')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Reopen Job
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Job
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredJobs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No jobs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">Job Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">Complete job posting information</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedJob.title}</h3>
                  <p className="text-muted-foreground">{selectedJob.company}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusBadgeColor(selectedJob.status)}>
                      {selectedJob.status}
                    </Badge>
                    <Badge variant="outline" className="border-border text-foreground">{selectedJob.job_type}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-sm mt-1 text-foreground">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-sm mt-1 text-foreground">{selectedJob.experience_required}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                  <p className="text-sm mt-1 text-foreground">{selectedJob.salary_range || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                  <p className="text-sm mt-1 text-foreground">
                    {selectedJob.application_deadline
                      ? new Date(selectedJob.application_deadline).toLocaleDateString()
                      : 'No deadline'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-foreground">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills_required.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-border text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Views</p>
                  <p className="text-lg font-bold text-foreground">{selectedJob.views_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-lg font-bold text-foreground">{selectedJob.applications_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Posted By</p>
                  <p className="text-sm text-foreground">{selectedJob.posted_by_email || 'Unknown'}</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowJobModal(false)}>
                  Close
                </Button>
                {selectedJob.status === 'active' && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      handleChangeStatus(selectedJob.id, 'closed');
                      setShowJobModal(false);
                    }}
                  >
                    Close Job
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobs;