import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

export const authService = {
  signIn: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, {
        email,
        password
      });

      const { user, token } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          companyId: user.companyId,
          companyName: user.companyName,
          companyDescription: user.companyDescription,
          companyIndustry: user.companyIndustry,
          companyLocation: user.companyLocation,
          companyWebsite: user.companyWebsite
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sign in'
      };
    }
  },

  signOut: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isRecruiter: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'Recruiter';
  }
};