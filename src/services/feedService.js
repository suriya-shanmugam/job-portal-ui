import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/applicants';

// Helper function to get applicant ID from localStorage or another source
const getApplicantId = () => {
  // TODO: Replace with actual implementation to get applicant ID
  return "67412939b92a60af533a2b1d"
  //return localStorage.getItem('applicantId') || '';
};

export const feedService = {
  // Get paginated feeds
  getFeeds: async (page = 1, limit = 5) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.get(`${API_BASE_URL}/${applicantId}/feeds`, {
        params: { page, limit }
      });

      const { data } = response.data;
      return {
        feeds: data.map(feed => ({
          id: feed._id,
          title: feed.title,
          content: feed.content,
          timestamp: feed.createdAt,
          author: {
            id: feed.userRef._id,
            name: feed.userRef.name,
            description: feed.userRef.description,
            industry: feed.userRef.industry,
            location: feed.userRef.location
          },
          likes: feed.likes.length,
          comments: feed.comments.map(comment => ({
            id: comment._id,
            content: comment.content,
            timestamp: comment.createdAt,
            author: {
              id: comment.userRef,
              name: comment.createdByType, // Using createdByType as name for now
              avatar: null
            }
          }))
        })),
        totalPages: Math.ceil(data.length / limit),
        currentPage: page,
        totalFeeds: data.length
      };
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  },

  // Create new post
  createPost: async (content, title) => {
    try {
      const applicantId = getApplicantId();
      const response = await axios.post(`${API_BASE_URL}/${applicantId}/feeds`, {
        title,
        content
      });

      const { data } = response.data;
      return {
        id: data._id,
        title: data.title,
        content: data.content,
        timestamp: data.createdAt,
        author: {
          id: data.userRef._id,
          name: data.userRef.name,
          avatar: null
        },
        likes: [],
        comments: []
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
      const response = await axios.post(`${API_BASE_URL}/${applicantId}/feeds/${postId}/like`);
      const { data } = response.data;
      return data.likes.length;
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