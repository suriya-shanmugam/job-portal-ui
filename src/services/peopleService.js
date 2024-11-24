// Dummy people data
const dummyPeople = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  avatar: null,
  role: ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer'][index % 5],
  company: `Tech Company ${Math.floor(index / 3) + 1}`,
  location: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'][index % 5],
  experience: `${Math.floor(Math.random() * 15) + 1} years`,
  skills: [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'AWS',
    'UI/UX',
    'Product Management',
    'Agile',
    'DevOps'
  ].slice(0, Math.floor(Math.random() * 5) + 3),
  education: {
    school: `University ${Math.floor(index / 5) + 1}`,
    degree: ['Computer Science', 'Business Administration', 'Design', 'Data Science'][index % 4],
    year: 2010 + Math.floor(Math.random() * 13)
  },
  followers: Math.floor(Math.random() * 1000),
  isFollowing: Math.random() > 0.5,
  bio: `Experienced professional with a passion for technology and innovation. ${Math.floor(Math.random() * 15) + 1} years of industry experience.`,
  connections: Math.floor(Math.random() * 500),
  isRecruiter: Math.random() > 0.8, // 20% chance of being a recruiter
  companyId: Math.floor(index / 3) + 1 // Link to company for recruiters
}));

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const peopleService = {
  // Get paginated people with search and filters
  getPeople: async (page = 1, limit = 10, search = '', filters = {}) => {
    await delay(500);
    
    let filteredPeople = [...dummyPeople];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPeople = filteredPeople.filter(person => 
        person.name.toLowerCase().includes(searchLower) ||
        person.role.toLowerCase().includes(searchLower) ||
        person.company.toLowerCase().includes(searchLower) ||
        person.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (filters.role) {
      filteredPeople = filteredPeople.filter(person => 
        person.role === filters.role
      );
    }

    // Apply location filter
    if (filters.location) {
      filteredPeople = filteredPeople.filter(person => 
        person.location === filters.location
      );
    }

    // Apply company filter
    if (filters.company) {
      filteredPeople = filteredPeople.filter(person => 
        person.company === filters.company
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPeople = filteredPeople.slice(startIndex, endIndex);

    return {
      people: paginatedPeople,
      totalPages: Math.ceil(filteredPeople.length / limit),
      currentPage: page,
      totalPeople: filteredPeople.length
    };
  },

  // Get single person details
  getPersonById: async (id) => {
    await delay(300);
    const person = dummyPeople.find(p => p.id === id);
    if (!person) throw new Error('Person not found');
    return person;
  },

  // Toggle follow person
  toggleFollow: async (id) => {
    await delay(200);
    const person = dummyPeople.find(p => p.id === id);
    if (!person) throw new Error('Person not found');
    
    person.isFollowing = !person.isFollowing;
    if (person.isFollowing) {
      person.followers += 1;
    } else {
      person.followers -= 1;
    }
    
    return {
      isFollowing: person.isFollowing,
      followers: person.followers
    };
  },

  // Get filter options
  getFilterOptions: async () => {
    await delay(200);
    return {
      roles: ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer'],
      locations: ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo'],
      companies: Array.from(new Set(dummyPeople.map(p => p.company)))
    };
  },

  // Check if current user is a recruiter
  isRecruiter: async () => {
    await delay(100);
    // Simulate current user being a recruiter (for demo purposes)
    return true;
  },

  // Get recruiter's company ID
  getRecruiterCompanyId: async () => {
    await delay(100);
    // Simulate getting recruiter's company ID (for demo purposes)
    return 1;
  }
};