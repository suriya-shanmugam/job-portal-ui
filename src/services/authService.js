import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const authService = {
  signIn: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password
      });

      const { user, token } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sign in'
      };
    }
  },

  signUp: async (userData) => {
    try {
      // Basic user data
      const payload = {
        email: userData.email,
        passwordHash: userData.password,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      // Add company details only if role is Recruiter and at least one company field is filled
      if (userData.role === 'Recruiter' && 
          (userData.companyName || userData.companyDescription || 
           userData.companyIndustry || userData.companyLocation || 
           userData.companyWebsite)) {
        payload.additionalData = {
          companyDetails: {
            name: userData.companyName || '',
            description: userData.companyDescription || '',
            industry: userData.companyIndustry || '',
            location: userData.companyLocation || '',
            website: userData.companyWebsite || ''
          }
        };
      }

      const response = await axios.post(`${API_BASE_URL}/users`, payload);
      const { user, token } = response.data;

      // Store token and user info immediately after successful signup
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sign up'
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