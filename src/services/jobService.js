// Dummy data for jobs
const dummyJobs = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  title: `${['Software Developer', 'UX Designer', 'Product Manager', 'Data Scientist', 'DevOps Engineer'][index % 5]} ${index + 1}`,
  company: `Tech Company ${index + 1}`,
  location: `${['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][index % 5]}`,
  salary: `$${Math.floor(Math.random() * 50 + 70)},000 - $${Math.floor(Math.random() * 50 + 100)},000`,
  description: `We are looking for a talented professional to join our team. This role involves working with cutting-edge technologies and collaborating with cross-functional teams to deliver high-quality solutions.`,
  requirements: [
    '3+ years of relevant experience',
    'Strong communication skills',
    'Bachelor\'s degree in related field',
    'Experience with modern technologies'
  ],
  type: ['Full-time', 'Part-time', 'Contract', 'Remote'][index % 4],
  posted: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toLocaleDateString()
}));

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Service methods
export const jobService = {
  // Get paginated jobs
  getJobs: async (page = 1, limit = 10, filters = {}) => {
    await delay(500); // Simulate network delay
    
    let filteredJobs = [...dummyJobs];
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply salary filter
    if (filters.salary) {
      filteredJobs = filteredJobs.filter(job => {
        const lowerBound = parseInt(job.salary.split('$')[1].replace(/,/g, ''));
        return lowerBound >= parseInt(filters.salary);
      });
    }

    // Apply job type filter
    if (filters.type) {
      filteredJobs = filteredJobs.filter(job => 
        job.type.toLowerCase() === filters.type.toLowerCase()
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
      totalJobs: filteredJobs.length
    };
  },

  // Get single job details
  getJobById: async (id) => {
    await delay(300);
    return dummyJobs.find(job => job.id === id) || null;
  },

  // Get job types for filters
  getJobTypes: async () => {
    await delay(200);
    return ['Full-time', 'Part-time', 'Contract', 'Remote'];
  },

  // Get locations for filters
  getLocations: async () => {
    await delay(200);
    return ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'];
  }
};