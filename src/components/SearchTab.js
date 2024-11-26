import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { jobService } from '../services/jobService';

const SearchTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    location: '',
    salary: '',
    type: ''
  });
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const ITEMS_PER_PAGE = 5;

  // Fetch locations and job types for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [locationsData, typesData] = await Promise.all([
          jobService.getLocations(),
          jobService.getJobTypes()
        ]);
        setLocations(locationsData);
        setJobTypes(typesData);
      } catch (err) {
        setError('Failed to load filter options');
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch jobs based on filters and pagination
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await jobService.getJobs(page, ITEMS_PER_PAGE, filters);
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
        
        if ((!selectedJob && response.jobs.length > 0) || 
            (selectedJob && !response.jobs.find(job => job.id === selectedJob.id))) {
          setSelectedJob(response.jobs[0]);
        }
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, filters, selectedJob]);

  const handleFilterChange = (field) => (event) => {
    const newFilters = {
      ...filters,
      [field]: event.target.value
    };
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' || event.type === 'click') {
      const newFilters = {
        ...filters,
        searchQuery: event.target.value
      };
      setFilters(newFilters);
      setPage(1);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Box */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search for jobs, companies, or keywords..."
          defaultValue={filters.searchQuery}
          onKeyPress={handleSearch}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        {/* Left side - Filters */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={filters.location}
                  label="Location"
                  onChange={handleFilterChange('location')}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Job Type"
                  onChange={handleFilterChange('type')}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {jobTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Minimum Salary"
                type="number"
                value={filters.salary}
                onChange={handleFilterChange('salary')}
                fullWidth
              />
            </Box>
          </Paper>
        </Grid>

        {/* Middle - Job listings */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <List sx={{ minHeight: '500px' }}>
                  {jobs.length === 0 ? (
                    <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                      No jobs found matching your criteria
                    </Typography>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id}>
                        <ListItem
                          button
                          selected={selectedJob?.id === job.id}
                          onClick={() => handleJobSelect(job)}
                        >
                          <ListItemText
                            primary={job.title}
                            secondary={
                              <>
                                <Typography variant="body2">{job.company}</Typography>
                                <Typography variant="body2">
                                  📍 {job.location} | 💰 {job.salary.start} - {job.salary.end}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </div>
                    ))
                  )}
                </List>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right side - Job details */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 2, minHeight: '600px' }}>
            <Typography variant="h6" gutterBottom>
              Job Details
            </Typography>
            {selectedJob ? (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {selectedJob.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {selectedJob.company}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    📍 {selectedJob.location} | 💰 {selectedJob.salary.start} - {selectedJob.salary.end}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    🕒 Posted: {selectedJob.posted} | 💼 {selectedJob.type}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {selectedJob.description}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Requirements:
                  </Typography>
                  <ul>
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Typography color="textSecondary" align="center">
                Select a job to view details
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchTab;