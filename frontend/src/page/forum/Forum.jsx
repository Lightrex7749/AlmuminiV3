import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, TrendingUp, Clock, Filter, MessageSquare } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/forum/PostCard';
import CreatePostModal from '@/components/forum/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { forumService } from '@/services';
import { toast } from 'sonner';

const Forum = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [allTags, setAllTags] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPosts();
    loadTags();
  }, [sortBy, selectedTag, searchTerm]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const filters = {
        sort: sortBy,
        search: searchTerm
      };
      
      if (selectedTag) {
        filters.tags = selectedTag;
      }

      const response = await forumService.getPosts(filters);
      
      if (response.success) {
        setPosts(response.data);
      } else {
        toast.error('Failed to load posts');
      }
    } catch (error) {
      toast.error('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await forumService.getAllTags();
      if (response.success) {
        setAllTags(response.data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag('');
      searchParams.delete('tag');
    } else {
      setSelectedTag(tag);
      searchParams.set('tag', tag);
    }
    setSearchParams(searchParams);
  };

  const handlePostCreated = () => {
    loadPosts();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="forum-page">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Community Forum</h1>
                <p className="text-muted-foreground mt-1">
                  Share knowledge, ask questions, and connect with the community
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              data-testid="create-post-button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search discussions, questions, and topics..."
              className="pl-10 bg-card border-border"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              data-testid="search-posts-input"
            />
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mb-8 p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by tag</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className={`cursor-pointer px-3 py-1 transition-all ${
                    selectedTag === tag 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
              {selectedTag && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => handleTagClick(selectedTag)}
                >
                  Clear filter
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Sort Tabs */}
        <Tabs value={sortBy} onValueChange={setSortBy} className="mb-8">
          <TabsList className="bg-card border border-border p-1 h-11">
            <TabsTrigger value="recent" data-testid="recent-tab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="popular" data-testid="popular-tab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6 space-y-6 animate-in fade-in duration-500">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-8">
                  {searchTerm || selectedTag
                    ? 'Try adjusting your filters to find what you are looking for'
                    : 'Be the first to start a discussion in our community!'}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Create First Post
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="mt-6 space-y-6 animate-in fade-in duration-500">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-border border-dashed rounded-2xl">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No popular posts yet</h3>
                <p className="text-muted-foreground">
                  Start engaging with posts to see popular content rise to the top here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Manage Posts Link */}
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/forum/manage')}
            data-testid="manage-posts-button"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Manage My Posts
          </Button>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onPostCreated={handlePostCreated}
        />
      </div>
    </MainLayout>
  );
};

export default Forum;
