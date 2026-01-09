import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Share2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/forum/PostCard';
import CommentThread from '@/components/forum/CommentThread';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { forumService } from '@/services';
import { toast } from 'sonner';

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthor = post && currentUser.id === post.author_id;

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      // Fetch post and comments separately
      const [postResponse, commentsResponse] = await Promise.all([
        forumService.getPostById(postId),
        forumService.getComments(postId)
      ]);
      
      if (postResponse.success) {
        setPost(postResponse.data);
        if (commentsResponse.success) {
          setComments(commentsResponse.data);
        } else {
          setComments([]);
        }
      } else {
        toast.error('Post not found');
        navigate('/forum');
      }
    } catch (error) {
      toast.error('Error loading post');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await forumService.createComment(postId, {
        content: commentContent.trim(),
        parent_comment_id: null
      });

      if (response.success) {
        toast.success('Comment posted successfully');
        setCommentContent('');
        loadPost(); // Reload to get updated comments
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      const response = await forumService.createComment(postId, {
        content: content.trim(),
        parent_comment_id: parentCommentId
      });

      if (response.success) {
        loadPost(); // Reload to get updated comments
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await forumService.deleteComment(commentId);
      
      if (response.success) {
        loadPost(); // Reload to update
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await forumService.deletePost(postId);
      
      if (response.success) {
        toast.success('Post deleted successfully');
        navigate('/forum');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Forum Post',
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl bg-background">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="post-details-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/forum')}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forum
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare} className="border-border text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4" />
            </Button>
            {isAuthor && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive border-border hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Post */}
        <div className="mb-10">
          <PostCard post={post} showFullContent />
        </div>

        {/* Comments Section */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Comments ({post.comments_count || 0})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <Textarea
                placeholder="Share your thoughts or ask a question..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="mb-3 bg-background border-border focus:ring-primary h-32"
                data-testid="comment-textarea"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !commentContent.trim()}
                  data-testid="submit-comment-button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>

            <Separator className="mb-8 bg-border" />

            {/* Comments Thread */}
            <CommentThread
              comments={comments}
              onReply={handleReply}
              onDelete={handleDeleteComment}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Post</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete this post? This action cannot be undone and all comments will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default PostDetails;
