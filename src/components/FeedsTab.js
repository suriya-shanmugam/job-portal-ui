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
  Pagination,
  CircularProgress,
  Collapse,
  Divider,
  Stack
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [newPost, setNewPost] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchFeeds();
  }, [page]);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const response = await feedService.getFeeds(page, ITEMS_PER_PAGE);
      setFeeds(response.feeds);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    try {
      setSubmitting(true);
      await feedService.createPost(newPost);
      setNewPost('');
      // Refresh feeds
      setPage(1);
      fetchFeeds();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await feedService.toggleLike(postId);
      fetchFeeds();
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

  if (loading && page === 1) {
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
          multiline
          rows={3}
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleCreatePost}
          disabled={submitting || !newPost.trim()}
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
                <Avatar sx={{ mr: 2 }}>{post.author.name[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {post.author.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(post.timestamp)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Typography variant="body2">
                  {post.likes} likes
                </Typography>
                •
                <Typography variant="body2">
                  {post.comments.length} comments
                </Typography>
              </Box>
            </CardContent>

            <CardActions>
              <Button
                startIcon={<ThumbUpIcon />}
                onClick={() => handleLike(post.id)}
                color="primary"
              >
                Like
              </Button>
              <Button
                startIcon={<CommentIcon />}
                onClick={() => toggleComments(post.id)}
                color="primary"
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

                {/* Comments List */}
                <Stack spacing={2}>
                  {post.comments.map((comment) => (
                    <Box key={comment.id}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {comment.author.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                            <Typography variant="subtitle2">
                              {comment.author.name}
                            </Typography>
                            <Typography variant="body2">
                              {comment.content}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Card>
        ))}
      </Stack>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default FeedsTab;