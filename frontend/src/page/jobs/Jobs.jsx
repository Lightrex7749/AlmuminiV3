import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/jobs/JobCard';
import JobSearchBar from '@/components/jobs/JobSearchBar';
import JobFilterSidebar from '@/components/jobs/JobFilterSidebar';
import JobSortDropdown from '@/components/jobs/JobSortDropdown';
import { jobService } from '@/services';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Check if user can post jobs (alumni or recruiter)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canPostJobs = ['alumni', 'recruiter'].includes(currentUser.role);

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    companies: searchParams.getAll('company') || [],
    locations: searchParams.getAll('location') || [],
    jobTypes: searchParams.getAll('type') || [],
    skills: searchParams.getAll('skill') || [],
    experienceLevels: searchParams.getAll('experience') || [],
  });

  // Results state
  const [results, setResults] = useState({
    data: [],
    totalPages: 0,
    totalResults: 0,
    currentPage: 1,
    hasMore: false,
  });

  // Load results
  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      let filtered = await jobService.filterJobs(filters);
      filtered = await jobService.sortJobs(filtered, sortBy);
      const paginated = await jobService.paginateResults(filtered, currentPage, pageSize);
      setResults(paginated);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadResults();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadResults]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    filters.companies?.forEach(c => params.append('company', c));
    filters.locations?.forEach(l => params.append('location', l));
    filters.jobTypes?.forEach(t => params.append('type', t));
    filters.skills?.forEach(s => params.append('skill', s));
    filters.experienceLevels?.forEach(e => params.append('experience', e));
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearchChange = (value) => {
    setFilters({ ...filters, search: value });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      companies: [],
      locations: [],
      jobTypes: [],
      skills: [],
      experienceLevels: [],
    });
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300" data-testid="jobs-page">
      <MainNavbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Job Opportunities</h1>
                  <p className="text-muted-foreground mt-1">
                    Discover exciting career opportunities from our alumni network
                  </p>
                </div>
              </div>
              {canPostJobs && (
                <Button 
                  onClick={() => navigate('/jobs/post')}
                  data-testid="post-job-button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              )}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <JobSearchBar
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden border-border text-foreground">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-card border-border">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <JobFilterSidebar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearAll={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <JobSortDropdown value={sortBy} onChange={handleSortChange} />
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden md:block w-72 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24 shadow-sm">
                <JobFilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Count */}
              <div className="mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-muted-foreground" data-testid="results-count">
                  {loading ? 'Loading jobs...' : `${results.totalResults} job${results.totalResults !== 1 ? 's' : ''} found`}
                </p>
              </div>

              {/* Job Grid */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                      <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                      <div className="h-24 bg-muted rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : results.data.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6" data-testid="jobs-grid">
                    {results.data.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {results.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50 text-muted-foreground' : 'cursor-pointer text-foreground hover:bg-muted'}
                            />
                          </PaginationItem>
                          
                          {[...Array(results.totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === results.totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(page)}
                                    isActive={page === currentPage}
                                    className={`cursor-pointer ${
                                      page === currentPage 
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <span className="px-4 text-muted-foreground">...</span>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePageChange(Math.min(results.totalPages, currentPage + 1))}
                              className={currentPage === results.totalPages ? 'pointer-events-none opacity-50 text-muted-foreground' : 'cursor-pointer text-foreground hover:bg-muted'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl" data-testid="no-jobs-message">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No jobs found
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                  <Button onClick={handleClearFilters} variant="outline" className="border-border text-foreground hover:bg-muted">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Manage Jobs Link */}
          {canPostJobs && (
            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/jobs/manage')}
                data-testid="manage-jobs-button"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Manage My Jobs
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
