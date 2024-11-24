import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination,
  Avatar,
  Chip,
  Paper,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { peopleService } from '../services/peopleService';

const PeopleTab = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    company: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    roles: [],
    locations: [],
    companies: []
  });
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [page, searchQuery, filters]);

  const fetchFilterOptions = async () => {
    try {
      const options = await peopleService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await peopleService.getPeople(
        page,
        ITEMS_PER_PAGE,
        searchQuery,
        filters
      );
      setPeople(response.people);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setSearchQuery(event.target.value);
      setPage(1);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(1);
  };

  const handleFollowToggle = async (personId, event) => {
    event.stopPropagation();
    try {
      const result = await peopleService.toggleFollow(personId);
      setPeople(prev =>
        prev.map(person =>
          person.id === personId
            ? {
                ...person,
                isFollowing: result.isFollowing,
                followers: result.followers
              }
            : person
        )
      );
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handlePersonClick = (personId) => {
    navigate(`/person/${personId}`);
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Search and Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search people..."
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={handleFilterChange('role')}
              >
                <MenuItem value="">All Roles</MenuItem>
                {filterOptions.roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                label="Location"
                onChange={handleFilterChange('location')}
              >
                <MenuItem value="">All Locations</MenuItem>
                {filterOptions.locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Company</InputLabel>
              <Select
                value={filters.company}
                label="Company"
                onChange={handleFilterChange('company')}
              >
                <MenuItem value="">All Companies</MenuItem>
                {filterOptions.companies.map((company) => (
                  <MenuItem key={company} value={company}>
                    {company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* People Grid */}
      <Grid container spacing={3}>
        {people.map((person) => (
          <Grid item xs={12} sm={6} md={4} key={person.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6
                }
              }}
              onClick={() => handlePersonClick(person.id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{ 
                      width: 60, 
                      height: 60,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem'
                    }}
                  >
                    {person.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">
                      {person.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {person.role}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {person.company}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {person.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {person.experience}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {person.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="body2" color="textSecondary">
                    {person.followers.toLocaleString()} followers
                  </Typography>
                  <Button
                    variant={person.isFollowing ? "outlined" : "contained"}
                    size="small"
                    onClick={(e) => handleFollowToggle(person.id, e)}
                  >
                    {person.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          size="large"
        />
      </Box>
    </Box>
  );
};

export default PeopleTab;