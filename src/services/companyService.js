import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const keyMapping = {
  _id: "id",
};

function formatCompanyData(companies) {
  return companies.map((company) => {
    const transformedItem = {};

    // Map _id to id and copy other fields
    for (const key in company) {
      if (key in keyMapping) {
        transformedItem[keyMapping[key]] = company[key];
      } else {
        transformedItem[key] = company[key];
      }
    }

    // Add default values for missing fields
    transformedItem["logo"] = null;
    transformedItem["openPositions"] = 0;
    transformedItem["jobs"] = [];

    return transformedItem;
  });
}

export const companyService = {
  // Get paginated companies with search and filters
  getCompanies: async (page = 1, limit = 10, search = "", filters = {}) => {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await api.get(`/applicants/${userId}/companies`);
      const companies = response.data.data;
      const formattedCompanies = formatCompanyData(companies);
      let filteredCompanies = [...formattedCompanies];

      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        filteredCompanies = filteredCompanies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchLower) ||
            company.industry.toLowerCase().includes(searchLower) ||
            company.location.toLowerCase().includes(searchLower)
        );
      }

      // Apply filters
      if (filters.industry) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.industry === filters.industry
        );
      }

      if (filters.location) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.location === filters.location
        );
      }

      if (filters.size) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.size === filters.size
        );
      }

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

      return {
        companies: paginatedCompanies,
        totalPages: Math.ceil(filteredCompanies.length / limit),
        currentPage: page,
        totalCompanies: filteredCompanies.length,
      };
    } catch (err) {
      console.error('Error fetching companies:', err);
      throw err;
    }
  },

  // Get single company details
  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/companies/${id}`);
      const company = response.data;
      
      // Transform the response to match the expected format
      return {
        id: company._id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        location: company.location,
        website: company.website,
        followers: company.followers || 0,
        openPositions: 0,
        jobs: [],
        logo: null,
        size: company.size || 'N/A',
        founded: company.founded || 'N/A',
        isFollowing: company.isFollowing || false
      };
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  // Create new job
  createJob: async (companyId, jobData) => {
    try {
      const response = await api.post(`/companies/${companyId}/job`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  // Follow company
  followCompany: async (companyId) => {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await api.post(`/companies/${companyId}/follow`, {
        applicantId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error following company:', error);
      throw error;
    }
  },

  // Unfollow company
  unfollowCompany: async (companyId) => {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await api.post(`/companies/${companyId}/unfollow`, {
        applicantId: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error unfollowing company:', error);
      throw error;
    }
  },

  // Toggle follow company
  toggleFollow: async (id) => {
    try {
      const company = await companyService.getCompanyById(id);
      if (!company) throw new Error("Company not found");

      if (company.isFollowing) {
        await companyService.unfollowCompany(id);
      } else {
        await companyService.followCompany(id);
      }

      company.isFollowing = !company.isFollowing;
      if (company.isFollowing) {
        company.followers += 1;
      } else {
        company.followers -= 1;
      }

      return {
        isFollowing: company.isFollowing,
        followers: company.followers,
      };
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  },

  // Get company jobs
  getCompanyJobs: async (companyId, page = 1, limit = 5) => {
    try {
      const response = await api.get(`/companies/${companyId}/jobs`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      throw error;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    return {
      industries: [
        "Technology",
        "Finance",
        "Healthcare",
        "E-commerce",
        "Education",
      ],
      locations: ["New York", "San Francisco", "London", "Berlin", "Tokyo"],
      sizes: ["1-50", "51-200", "201-500", "501-1000", "1000+"],
    };
  },
};