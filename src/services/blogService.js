import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const blogService = {
  // Create a new blog post
  createBlog: async (blogData) => {
    try {
      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          ...blogData,
          authorId: authService.getCompanyId(),
          authorType: 'Company'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blog post');
      }

      return data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Get blogs by company ID
  getCompanyBlogs: async (companyId, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${API_URL}/blogs?authorId=${companyId}&authorType=Company&page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch blogs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching company blogs:', error);
      throw error;
    }
  },

  // Delete a blog post
  deleteBlog: async (blogId) => {
    try {
      const response = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete blog post');
      }

      return data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Update a blog post
  updateBlog: async (blogId, blogData) => {
    try {
      const response = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(blogData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update blog post');
      }

      return data;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }
};