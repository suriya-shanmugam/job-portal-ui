import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const peopleService = {
  // Get paginated people with search and filters
  getPeople: async (page = 1, limit = 10, search = '', filters = {}) => {
    try {
      const currentUserId = authService.getUserId();
      const response = await axios.get(`${API_BASE_URL}/applicants/${currentUserId}/allapplicants`);
      
      let filteredPeople = [...response.data];
      
      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPeople = filteredPeople.filter(person => 
          person.userId.firstName.toLowerCase().includes(searchLower) ||
          person.userId.lastName.toLowerCase().includes(searchLower) ||
          person.userId.role.toLowerCase().includes(searchLower) ||
          (person.skills && person.skills.some(skill => skill.toLowerCase().includes(searchLower)))
        );
      }

      // Apply role filter
      if (filters.role) {
        filteredPeople = filteredPeople.filter(person => 
          person.userId.role === filters.role
        );
      }

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPeople = filteredPeople.slice(startIndex, endIndex);

      return {
        people: paginatedPeople.map(person => ({
          id: person._id,
          name: `${person.userId.firstName} ${person.userId.lastName}`,
          role: person.userId.role,
          skills: person.skills || [],
          isFollowing: person.isFollowing,
          followers: person.followingApplicants ? person.followingApplicants.length : 0
        })),
        totalPages: Math.ceil(filteredPeople.length / limit),
        currentPage: page,
        totalPeople: filteredPeople.length
      };
    } catch (error) {
      console.error('Failed to fetch people:', error);
      throw error;
    }
  },

  // Get single person details
  getPersonById: async (id) => {
    try {
      const currentUserId = authService.getUserId();
      const response = await axios.get(`${API_BASE_URL}/applicants/${currentUserId}/allapplicants`);
      const person = response.data.find(p => p._id === id);
      
      if (!person) throw new Error('Person not found');
      
      return {
        id: person._id,
        name: `${person.userId.firstName} ${person.userId.lastName}`,
        role: person.userId.role,
        skills: person.skills || [],
        isFollowing: person.isFollowing,
        followers: person.followingApplicants ? person.followingApplicants.length : 0,
        connections: person.followingCompanies ? person.followingCompanies.length : 0,
        bio: `${person.userId.firstName} ${person.userId.lastName} is a ${person.userId.role}`,
        education: {
          school: 'Not Available',
          degree: 'Not Available',
          year: 'Not Available'
        }
      };
    } catch (error) {
      console.error('Failed to fetch person details:', error);
      throw error;
    }
  },

  // Toggle follow person
  toggleFollow: async (id, isCurrentlyFollowing) => {
    try {
      const currentUserId = authService.getUserId();
      let response;
      
      if (isCurrentlyFollowing) {
        // Unfollow
        response = await axios.post(`${API_BASE_URL}/applicants/${currentUserId}/unfollow/${id}`);
      } else {
        // Follow
        response = await axios.post(`${API_BASE_URL}/applicants/${currentUserId}/follow/${id}`);
      }
      
      // Update following status based on the action taken
      return {
        isFollowing: !isCurrentlyFollowing,
        followers: response.data.applicant.followingApplicants ? response.data.applicant.followingApplicants.length : 0
      };
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      throw error;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const currentUserId = authService.getUserId();
      const response = await axios.get(`${API_BASE_URL}/applicants/${currentUserId}/allapplicants`);
      
      const roles = [...new Set(response.data.map(p => p.userId.role))];
      
      return {
        roles,
        locations: [],
        companies: []
      };
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      throw error;
    }
  }
};