const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
// Service methods
export const jobService = {
  // Get paginated jobs
  getJobs: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const result = await response.json();
      
      // Check if the response has the expected structure
      if (result.status !== "success" || !Array.isArray(result.data)) {
        throw new Error("Invalid response format");
      }

      const jobs = result.data;
      let filteredJobs = [...jobs];

      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.companyId.name.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query)
        );
      }

      // Apply location filter
      if (filters.location) {
        filteredJobs = filteredJobs.filter((job) =>
          job.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Apply salary filter
      if (filters.salary) {
        filteredJobs = filteredJobs.filter((job) => {
          return job.salary.min >= parseInt(filters.salary);
        });
      }

      // Apply job type filter
      if (filters.type) {
        filteredJobs = filteredJobs.filter(
          (job) => job.type.toLowerCase() === filters.type.toLowerCase()
        );
      }

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      return {
        jobs: paginatedJobs,
        totalPages: Math.ceil(filteredJobs.length / limit),
        currentPage: page,
        totalJobs: filteredJobs.length,
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        jobs: [],
        totalPages: 0,
        currentPage: page,
        totalJobs: 0,
      };
    }
  },

  // Get single job details
  getJobById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      if (result.status !== "success" || !result.data) {
        throw new Error("Invalid response format");
      }
      return result.data;
    } catch (error) {
      console.error("Error fetching job details:", error);
      return null;
    }
  },

  // Analyze job skills for an applicant
  analyzeJob: async (jobId, applicantId) => {
    try {
      const response = await fetch(
        `${API_URL}/jobs/${jobId}/analyze?applicantId=${applicantId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      if (result.status !== "success" || !result.data) {
        throw new Error("Invalid response format");
      }
      return JSON.parse(result.data)[0]; // Parse the stringified data and get first element
    } catch (error) {
      console.error("Error analyzing job:", error);
      return null;
    }
  },

  // Get job types for filters
  getJobTypes: async () => {
    return ["Full-time", "Part-time", "Contract", "Remote"];
  },

  // Get locations for filters
  getLocations: async () => {
    return ["New York", "San Francisco", "London", "Berlin", "Tokyo"];
  },
};