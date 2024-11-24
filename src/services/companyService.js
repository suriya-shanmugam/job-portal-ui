// Dummy company data
const dummyCompanies = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: `Tech Company ${index + 1}`,
  logo: null,
  industry: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education'][index % 5],
  size: ['1-50', '51-200', '201-500', '501-1000', '1000+'][index % 5],
  location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][index % 5],
  description: `A leading company in ${['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education'][index % 5]} sector, focused on innovation and growth.`,
  founded: 2000 + Math.floor(Math.random() * 23),
  website: `https://www.techcompany${index + 1}.com`,
  followers: Math.floor(Math.random() * 10000),
  isFollowing: Math.random() > 0.5,
  benefits: [
    'Health Insurance',
    'Remote Work',
    'Flexible Hours',
    'Professional Development',
    'Stock Options'
  ],
  openPositions: Math.floor(Math.random() * 20) + 1,
  jobs: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, jobIndex) => ({
    id: `${index}-${jobIndex}`,
    title: `${['Software Developer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer'][jobIndex % 5]} ${jobIndex + 1}`,
    type: ['Full-time', 'Part-time', 'Contract', 'Remote'][jobIndex % 4],
    location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][jobIndex % 5],
    salary: `$${Math.floor(Math.random() * 50 + 70)},000 - $${Math.floor(Math.random() * 50 + 100)},000`,
    posted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }))
}));

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const companyService = {
  // Get paginated companies with search and filters
  getCompanies: async (page = 1, limit = 10, search = '', filters = {}) => {
    await delay(500);
    
    let filteredCompanies = [...dummyCompanies];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = filteredCompanies.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower) ||
        company.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply industry filter
    if (filters.industry) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.industry === filters.industry
      );
    }

    // Apply location filter
    if (filters.location) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.location === filters.location
      );
    }

    // Apply size filter
    if (filters.size) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.size === filters.size
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
      totalCompanies: filteredCompanies.length
    };
  },

  // Get single company details
  getCompanyById: async (id) => {
    await delay(300);
    const company = dummyCompanies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    return company;
  },

  // Toggle follow company
  toggleFollow: async (id) => {
    await delay(200);
    const company = dummyCompanies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    
    company.isFollowing = !company.isFollowing;
    if (company.isFollowing) {
      company.followers += 1;
    } else {
      company.followers -= 1;
    }
    
    return {
      isFollowing: company.isFollowing,
      followers: company.followers
    };
  },

  // Get company jobs
  getCompanyJobs: async (companyId, page = 1, limit = 5) => {
    await delay(300);
    const company = dummyCompanies.find(c => c.id === companyId);
    if (!company) throw new Error('Company not found');

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = company.jobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      totalPages: Math.ceil(company.jobs.length / limit),
      currentPage: page,
      totalJobs: company.jobs.length
    };
  },

  // Get filter options
  getFilterOptions: async () => {
    await delay(200);
    return {
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education'],
      locations: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'],
      sizes: ['1-50', '51-200', '201-500', '501-1000', '1000+']
    };
  }
};