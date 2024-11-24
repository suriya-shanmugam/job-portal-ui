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
  IconButton,
  Paper,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService';

const CompaniesTab = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    size: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    industries: [],
    locations: [],
    sizes: []
  });
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [page, searchQuery, filters]);

  const fetchFilterOptions = async () => {
    try {
      const options = await companyService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyService.getCompanies(
        page,
        ITEMS_PER_PAGE,
        searchQuery,
        filters
      );
      setCompanies(response.companies);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
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

  const handleFollowToggle = async (companyId) => {
    try {
      const result = await companyService.toggleFollow(companyId);
      setCompanies(prev =>
        prev.map(company =>
          company.id === companyId
            ? {
                ...company,
                isFollowing: result.isFollowing,
                followers: result.followers
              }
            : company
        )
      );
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
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
              placeholder="Search companies..."
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
              <InputLabel>Industry</InputLabel>
              <Select
                value={filters.industry}
                label="Industry"
                onChange={handleFilterChange('industry')}
              >
                <MenuItem value="">All Industries</MenuItem>
                {filterOptions.industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
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
              <InputLabel>Company Size</InputLabel>
              <Select
                value={filters.size}
                label="Company Size"
                onChange={handleFilterChange('size')}
              >
                <MenuItem value="">All Sizes</MenuItem>
                {filterOptions.sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Companies Grid */}
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
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
            >
              <CardContent sx={{ flex: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCompanyClick(company.id)}
                >
                  <Avatar
                    sx={{ 
                      width: 60, 
                      height: 60,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem'
                    }}
                  >
                    {company.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {company.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {company.industry}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {company.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {company.size} employees
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {company.openPositions} open positions
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    {company.followers.toLocaleString()} followers
                  </Typography>
                  <Button
                    variant={company.isFollowing ? "outlined" : "contained"}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(company.id);
                    }}
                  >
                    {company.isFollowing ? 'Following' : 'Follow'}
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

export default CompaniesTab;