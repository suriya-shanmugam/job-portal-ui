// Dummy data for feeds
const dummyFeeds = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  author: {
    id: Math.floor(Math.random() * 100),
    name: `User ${Math.floor(Math.random() * 100)}`,
    avatar: null
  },
  content: `This is a sample post ${index + 1} about job opportunities and career growth. #careers #jobs`,
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
  likes: Math.floor(Math.random() * 50),
  comments: Array.from({ length: Math.floor(Math.random() * 5) }, (_, commentIndex) => ({
    id: `${index}-${commentIndex}`,
    author: {
      id: Math.floor(Math.random() * 100),
      name: `Commenter ${Math.floor(Math.random() * 100)}`,
      avatar: null
    },
    content: `This is a sample comment ${commentIndex + 1} on post ${index + 1}`,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
    likes: Math.floor(Math.random() * 10)
  }))
}));

// Dummy notifications
const dummyNotifications = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  type: ['like', 'comment', 'mention', 'job'][Math.floor(Math.random() * 4)],
  content: `Notification ${index + 1} about some activity`,
  from: {
    id: Math.floor(Math.random() * 100),
    name: `User ${Math.floor(Math.random() * 100)}`
  },
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
  read: Math.random() > 0.5
}));

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const feedService = {
  // Get paginated feeds
  getFeeds: async (page = 1, limit = 5) => {
    await delay(500);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeeds = dummyFeeds.slice(startIndex, endIndex);

    return {
      feeds: paginatedFeeds,
      totalPages: Math.ceil(dummyFeeds.length / limit),
      currentPage: page,
      totalFeeds: dummyFeeds.length
    };
  },

  // Create new post
  createPost: async (content) => {
    await delay(300);
    const newPost = {
      id: dummyFeeds.length + 1,
      author: {
        id: 1, // Current user
        name: 'Current User',
        avatar: null
      },
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    dummyFeeds.unshift(newPost);
    return newPost;
  },

  // Add comment to post
  addComment: async (postId, content) => {
    await delay(200);
    const post = dummyFeeds.find(f => f.id === postId);
    if (!post) throw new Error('Post not found');

    const newComment = {
      id: `${postId}-${post.comments.length + 1}`,
      author: {
        id: 1, // Current user
        name: 'Current User',
        avatar: null
      },
      content,
      timestamp: new Date().toISOString(),
      likes: 0
    };
    post.comments.push(newComment);
    return newComment;
  },

  // Toggle like on post
  toggleLike: async (postId) => {
    await delay(100);
    const post = dummyFeeds.find(f => f.id === postId);
    if (!post) throw new Error('Post not found');
    post.likes += 1; // In real app, this would toggle
    return post.likes;
  }
};

export const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 10) => {
    await delay(300);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = dummyNotifications.slice(startIndex, endIndex);

    return {
      notifications: paginatedNotifications,
      totalPages: Math.ceil(dummyNotifications.length / limit),
      currentPage: page,
      totalNotifications: dummyNotifications.length,
      unreadCount: dummyNotifications.filter(n => !n.read).length
    };
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    await delay(100);
    const notification = dummyNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return notification;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    await delay(200);
    dummyNotifications.forEach(n => n.read = true);
    return true;
  }
};