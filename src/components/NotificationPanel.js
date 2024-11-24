import { useState, useEffect } from 'react';
import {
  Popover,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Work as WorkIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { notificationService } from '../services/feedService';

const NotificationPanel = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page);
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      setUnreadCount(response.unreadCount);
      setHasMore(page < response.totalPages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <ThumbUpIcon color="primary" />;
      case 'comment':
        return <CommentIcon color="primary" />;
      case 'job':
        return <WorkIcon color="primary" />;
      case 'mention':
        return <PersonIcon color="primary" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: '80vh',
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        <List sx={{ py: 0 }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.paper' }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.content}
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(notification.timestamp)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {hasMore && !loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button onClick={handleLoadMore} size="small">
              Load More
            </Button>
          </Box>
        )}

        {notifications.length === 0 && !loading && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationPanel;