import { authService } from './authService';

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

      const response = await fetch(`http://localhost:3000/api/v1/applicants/${userId}/companies`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responsejson = await response.json();
      const companies = responsejson.data;
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

      // Apply industry filter
      if (filters.industry) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.industry === filters.industry
        );
      }

      // Apply location filter
      if (filters.location) {
        filteredCompanies = filteredCompanies.filter(
          (company) => company.location === filters.location
        );
      }

      // Apply size filter
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
      return {
        companies: [],
        totalPages: 0,
        currentPage: 0,
        totalCompanies: 0,
      };
    }
  },

  // Get single company details
  getCompanyById: async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/companies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      
      const company = await response.json();
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
        founded: company.founded || 'N/A'
      };
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  // Create new job
  createJob: async (companyId, jobData) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/companies/${companyId}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error("Failed to create job");
      }

      return await response.json();
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

    const response = await fetch(`http://localhost:3000/api/v1/companies/${companyId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicantId: userId
      })
    });

    if (!response.ok) {
      throw new Error("Failed to follow company");
    }

    return await response.json();
  },

  // Unfollow company
  unfollowCompany: async (companyId) => {
    const userId = authService.getUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`http://localhost:3000/api/v1/companies/${companyId}/unfollow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicantId: userId
      })
    });

    if (!response.ok) {
      throw new Error("Failed to unfollow company");
    }

    return await response.json();
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
      const response = await fetch(`http://localhost:3000/api/v1/companies/${companyId}/jobs?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch company jobs");
      }

      return await response.json();
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