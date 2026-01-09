import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import MentorCard from '@/components/mentorship/MentorCard';
import RequestMentorshipModal from '@/components/mentorship/RequestMentorshipModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { mentorshipService } from '@/services';
import { toast } from 'sonner';

const FindMentors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    expertise: [],
    minRating: 0,
    availableOnly: false,
  });
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [expertiseAreas, setExpertiseAreas] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [paginatedResults, setPaginatedResults] = useState({ data: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpertiseAreas();
  }, []);

  useEffect(() => {
    loadMentors();
  }, [searchQuery, filters, sortBy, currentPage]);

  const loadExpertiseAreas = async () => {
    try {
      const response = await mentorshipService.getUniqueExpertiseAreas();
      if (response.success) {
        setExpertiseAreas(response.data);
      }
    } catch (error) {
      console.error('Error loading expertise areas:', error);
    }
  };

  const loadMentors = async () => {
    setLoading(true);
    try {
      const response = await mentorshipService.filterMentors({
        ...filters,
        search: searchQuery,
        sortBy,
        page: currentPage,
        pageSize: 12
      });
      
      if (response.success) {
        setFilteredMentors(response.data.mentors || []);
        setPaginatedResults({
          data: response.data.mentors || [],
          totalPages: response.data.totalPages || 1
        });
      } else {
        toast.error('Failed to load mentors');
      }
    } catch (error) {
      toast.error('Error loading mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleExpertiseToggle = (expertise) => {
    setFilters(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise],
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      expertise: [],
      minRating: 0,
      availableOnly: false,
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleRequestMentorship = (mentor) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
  };

  const hasActiveFilters = filters.expertise.length > 0 || filters.minRating > 0 || filters.availableOnly || searchQuery;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Find Mentors
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with experienced alumni who can guide your career journey
          </p>
        </div>

        {/* Search and Sort */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, expertise, or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-card border-border"
                data-testid="search-input"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
              data-testid="sort-select"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="availability">Most Available</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="filter-toggle-btn"
              className={showFilters ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-muted'}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {filters.expertise.length + (filters.minRating > 0 ? 1 : 0) + (filters.availableOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-card border border-border rounded-xl shadow-sm" data-testid="filter-panel">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  data-testid="clear-filters-btn"
                  className="text-primary hover:bg-primary/5"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Expertise Filter */}
            <div className="mb-6">
              <Label className="mb-3 block text-foreground font-medium">Expertise Areas</Label>
              <div className="flex flex-wrap gap-2">
                {expertiseAreas.map((expertise) => (
                  <Badge
                    key={expertise}
                    variant={filters.expertise.includes(expertise) ? 'default' : 'outline'}
                    className={`cursor-pointer px-3 py-1 ${
                      filters.expertise.includes(expertise) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                    onClick={() => handleExpertiseToggle(expertise)}
                    data-testid={`expertise-filter-${expertise.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {expertise}
                    {filters.expertise.includes(expertise) && (
                      <X className="ml-1.5 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rating Filter */}
              <div>
                <Label className="mb-3 block text-foreground font-medium">Minimum Rating</Label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.minRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, minRating: rating }));
                        setCurrentPage(1);
                      }}
                      className={filters.minRating === rating ? 'bg-primary' : 'border-border text-foreground'}
                      data-testid={`rating-filter-${rating}`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="flex flex-col justify-end pb-1">
                <Label className="flex items-center gap-3 cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, availableOnly: e.target.checked }));
                      setCurrentPage(1);
                    }}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    data-testid="available-only-checkbox"
                  />
                  <span className="font-medium">Show only available mentors</span>
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-8 flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-lg border border-border/50">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Active:</span>
            {filters.expertise.map((exp) => (
              <Badge key={exp} variant="secondary" className="gap-1.5 bg-secondary text-secondary-foreground border-border">
                {exp}
                <button
                  onClick={() => handleExpertiseToggle(exp)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {filters.minRating > 0 && (
              <Badge variant="secondary" className="gap-1.5 bg-secondary text-secondary-foreground border-border">
                {filters.minRating}+ Rating
                <button
                  onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.availableOnly && (
              <Badge variant="secondary" className="gap-1.5 bg-secondary text-secondary-foreground border-border">
                Available Only
                <button
                  onClick={() => setFilters(prev => ({ ...prev, availableOnly: false }))}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-sm font-medium text-muted-foreground" data-testid="results-count">
            Showing {paginatedResults.data.length} of {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Mentor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : paginatedResults.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResults.data.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onRequestMentorship={handleRequestMentorship}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl" data-testid="no-results">
            <p className="text-muted-foreground text-lg mb-2">No mentors found matching your criteria</p>
            <p className="text-muted-foreground text-sm mb-8">
              Try adjusting your search or clearing filters
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline" className="border-border text-foreground hover:bg-muted">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {paginatedResults.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              data-testid="prev-page-btn"
              className="border-border text-foreground"
            >
              Previous
            </Button>
            {Array.from({ length: paginatedResults.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
                data-testid={`page-${page}-btn`}
                className={currentPage === page ? 'bg-primary text-primary-foreground' : 'border-border text-foreground'}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(paginatedResults.totalPages, prev + 1))}
              disabled={currentPage === paginatedResults.totalPages}
              data-testid="next-page-btn"
              className="border-border text-foreground"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Request Mentorship Modal */}
      {showRequestModal && selectedMentor && (
        <RequestMentorshipModal
          mentor={selectedMentor}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedMentor(null);
          }}
          onSuccess={() => {
            // Optionally refresh data or show success message
          }}
        />
      )}
    </MainLayout>
  );
};

export default FindMentors;