import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ChatBubbleOutline as CommentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { feedService } from '../services/feedService';

const FeedsTab = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async (cursor = null) => {
    try {
      setLoading(cursor === null);
      setLoadingMore(cursor !== null);
      const response = await feedService.getFeeds(cursor, ITEMS_PER_PAGE);
      
      if (cursor === null) {
        setFeeds(response.feeds);
      } else {
        setFeeds(prev => [...prev, ...response.feeds]);
      }
      
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchFeeds(nextCursor);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    try {
      setSubmitting(true);
      await feedService.createPost(newPostTitle, newPostContent);
      setNewPostTitle('');
      setNewPostContent('');
      // Refresh feeds
      fetchFeeds();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await feedService.toggleLike(postId);
      // Update the likes count and liked status in the local state
      setFeeds(prev => prev.map(feed => {
        if (feed.id === postId) {
          return {
            ...feed,
            likes: response.likesCount,
            likedByUser: response.likedByUser
          };
        }
        return feed;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    try {
      setSubmitting(true);
      await feedService.addComment(postId, comment);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchFeeds();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Create Post */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create Post
        </Typography>
        <TextField
          fullWidth
          placeholder="Post Title"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleCreatePost}
          disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
          endIcon={<SendIcon />}
        >
          Post
        </Button>
      </Paper>

      {/* Feed List */}
      <Stack spacing={2}>
        {feeds.map((post) => (
          <Card key={post.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {post.author.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {post.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(post.timestamp)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {post.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>

              {/* Tags */}
              <Box sx={{ mb: 2 }}>
                {post.tags && post.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Typography variant="body2">
                  {post.likes} likes
                </Typography>
                •
                <Typography variant="body2">
                  {post.comments} comments
                </Typography>
              </Box>
            </CardContent>

            <CardActions>
              <Button
                startIcon={<ThumbUpIcon />}
                onClick={() => handleLike(post.id)}
                color={post.likedByUser ? "primary" : "inherit"}
                sx={{ 
                  color: post.likedByUser ? 'primary.main' : 'inherit',
                  '&:hover': {
                    color: post.likedByUser ? 'primary.dark' : 'inherit'
                  }
                }}
              >
                Like
              </Button>
              <Button
                startIcon={<CommentIcon />}
                onClick={() => toggleComments(post.id)}
                color="inherit"
              >
                Comment
              </Button>
            </CardActions>

            <Collapse in={expandedComments[post.id]} timeout="auto">
              <Divider />
              <Box sx={{ p: 2 }}>
                {/* Comment Input */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({
                      ...prev,
                      [post.id]: e.target.value
                    }))}
                  />
                  <IconButton
                    onClick={() => handleComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </Collapse>
          </Card>
        ))}
      </Stack>

      {/* Load More Button */}
      {nextCursor && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FeedsTab;