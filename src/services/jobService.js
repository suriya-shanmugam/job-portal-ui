const keyMapping = {
  _id: "id",
  createdAt: "posted",
};

function formatJobsData(jobs) {
  const newFormat = jobs.map((job) => {
    const transFormeditem = {};

    for (const key in job) {
      if (key in keyMapping) {
        transFormeditem[keyMapping[key]] = job[key];
      } else if (key === "companyId") {
        let companyname = job.companyId.name;
        transFormeditem["company"] = companyname;
      } else if (key === "salary") {
        let min = job.salary.min;
        let max = job.salary.max;
        transFormeditem["salary"] = {
          start: min,
          end: max,
        };
      } else {
        transFormeditem[key] = job[key];
      }
    }

    return transFormeditem;
  });
  //console.log("NewFormat")
  //console.log(newFormat)
  return newFormat;
}

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Service methods
export const jobService = {
  // Get paginated jobs

  getJobs: async (page = 1, limit = 10, filters = {}) => {
    //await delay(500); // Simulate network delay

    try {
      const response = await fetch("http://localhost:3000/api/v1/jobs");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      //console.log(response);
      const data = await response.json();
      //console.log(data);
      const jobs = formatJobsData(data.data);
      console.log(jobs);

      let filteredJobs = [...jobs];
      //let filteredJobs = [...dummyJobs];

      // Apply search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
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
          const lowerBound = parseInt(
            job.salary.split("$")[1].replace(/,/g, "")
          );
          return lowerBound >= parseInt(filters.salary);
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
      console.log(error);
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
    //Unhandled
    await delay(300);
    return;
  },

  // Get job types for filters
  getJobTypes: async () => {
    await delay(200);
    return ["Full-time", "Part-time", "Contract", "Remote"];
  },

  // Get locations for filters
  getLocations: async () => {
    await delay(200);
    return ["New York", "San Francisco", "London", "Berlin", "Tokyo"];
  },
};

// Dummy data for jobs
/*const dummyJobs = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  title: `${
    [
      "Software Developer",
      "UX Designer",
      "Product Manager",
      "Data Scientist",
      "DevOps Engineer",
    ][index % 5]
  } ${index + 1}`,
  company: `Tech Company ${index + 1}`,
  location: `${
    ["New York", "San Francisco", "London", "Berlin", "Tokyo"][index % 5]
  }`,
  salary:{
    start : `$${Math.floor(Math.random() * 50 + 70)},000 `, 
    end : `$${Math.floor(Math.random() * 50 + 100)},000`
  },
  description: `We are looking for a talented professional to join our team. This role involves working with cutting-edge technologies and collaborating with cross-functional teams to deliver high-quality solutions.`,
  requirements: [
    "3+ years of relevant experience",
    "Strong communication skills",
    "Bachelor's degree in related field",
    "Experience with modern technologies",
  ],
  type: ["Full-time", "Part-time", "Contract", "Remote"][index % 4],
  posted: new Date(
    Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
  ).toLocaleDateString(),
})); */

//console.log(dummyJobs)
// company, salary,
