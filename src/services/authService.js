import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
//const API_BASE_URL = 'http://localhost:3000/api/v1';

export const authService = {
  signIn: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password
      });

      const { user, token } = response.data;
      
      // Store token, user info, and user ID
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);
      
      // Store companyId if user is a recruiter
      if (user.role === 'Recruiter' && user.companyId) {
        localStorage.setItem('companyId', user.companyId);
      }
      
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

      const response = await axios.post(`${API_URL}/users`, payload);
      const { user} = response.data;

      // Store companyId if user is a recruiter
      if (user.role === 'Recruiter' && user.companyId) {
        localStorage.setItem('companyId', user.companyId);
      }

      return {
        success: true,
        user,
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
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId'); // Remove companyId on sign out
  },

  checkIfUserExists: async (email) => {
    try {
      const response = await axios.get(`${API_URL}/users/user/${email}`);
      return {
        success: true,
        userExists: response.data.userExists,
        user: response.data.user
      };
    } catch (error) {
      console.error('Check user existence error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check user existence'
      };
    }
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

  getUserId: () => {
    return localStorage.getItem('userId');
  },

  getCompanyId: () => {
    return localStorage.getItem('companyId');
  },

  isRecruiter: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'Recruiter';
  }
};