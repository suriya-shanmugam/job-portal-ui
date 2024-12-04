import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api/v1/applicants';
const BLOG_API_BASE_URL = 'http://localhost:3000/api/v1/blogs';
const CONVO_API_BASE_URL = 'http://localhost:3000/api/v1/conversations';

// Helper function to get applicant ID from localStorage or another source
const getApplicantId = () => {
  const applicantId = authService.getUserId();
  return applicantId;
};

export const feedService = {
  // Get paginated feeds
  getFeeds: async (cursor = null, limit = 5) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.get(`${API_BASE_URL}/${applicantId}/feeds`, {
        params: { cursor, limit }
      });

      const { data } = response.data;
      return {
        feeds: data.blogs.map(feed => ({
          id: feed._id,
          title: feed.title,
          content: feed.content,
          timestamp: feed.createdAt,
          author: {
            id: feed.authorId._id,
            name: feed.authorId.name,
            type: feed.authorType
          },
          tags: feed.tags,
          likes: feed.likesCount,
          comments: feed.commentsCount,
          likedByUser: feed.likedByUser
        })),
        nextCursor: data.nextCursor
      };
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  },

  // Create new post
  createPost: async (title, content, tags = ["career", "job", "developer"]) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.post(BLOG_API_BASE_URL, {
        title,
        content,
        authorType: "Applicant",
        authorId: applicantId,
        tags
      });

      const { data } = response.data;
      return {
        id: data._id,
        title: data.title,
        content: data.content,
        timestamp: data.createdAt,
        author: {
          id: data.authorId._id,
          name: data.authorId.name,
          type: data.authorType
        },
        tags: data.tags,
        likes: data.likesCount,
        comments: data.commentsCount,
        likedByUser: data.likedByUser
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Add comment to post
  addComment: async (postId, content) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.post(`${API_BASE_URL}/${applicantId}/feeds/${postId}/comments`, {
        content
      });

      const { data } = response.data;
      return {
        id: data._id,
        content: data.content,
        timestamp: data.createdAt,
        author: {
          id: data.userRef,
          name: data.createdByType,
          avatar: null
        }
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Toggle like on post
  toggleLike: async (postId) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.post(`${CONVO_API_BASE_URL}/${postId}/like`);
      const { data } = response.data;
      return {
        likesCount: data.likes.length,
        likedByUser: data.likedByUser
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};

export const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.get(`${API_BASE_URL}/${applicantId}/notifications`, {
        params: { page, limit }
      });

      const { data } = response.data;
      return {
        notifications: data.map(notification => ({
          id: notification._id,
          type: notification.type,
          content: notification.content,
          from: {
            id: notification.from._id,
            name: notification.from.name
          },
          timestamp: notification.createdAt,
          read: notification.read
        })),
        totalPages: Math.ceil(data.length / limit),
        currentPage: page,
        totalNotifications: data.length,
        unreadCount: data.filter(n => !n.read).length
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.patch(`${API_BASE_URL}/${applicantId}/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.patch(`${API_BASE_URL}/${applicantId}/notifications/read-all`);
      return response.data.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
};