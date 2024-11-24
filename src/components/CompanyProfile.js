import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Link,
  Pagination
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { companyService } from '../services/companyService';
import { peopleService } from '../services/peopleService';

const CompanyProfile = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsPage, setJobsPage] = useState(1);
  const [totalJobPages, setTotalJobPages] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [jobDialog, setJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    type: 'Full-time',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });
  const JOBS_PER_PAGE = 5;

  const checkRecruiterStatus = useCallback(async () => {
    try {
      const recruiterStatus = await peopleService.isRecruiter();
      const recruiterCompanyId = await peopleService.getRecruiterCompanyId();
      setIsRecruiter(recruiterStatus && recruiterCompanyId === Number(id));
    } catch (error) {
      console.error('Failed to check recruiter status:', error);
    }
  }, [id]);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyById(Number(id));
      setCompany(data);
    } catch (error) {
      setError('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCompanyJobs = useCallback(async () => {
    try {
      const response = await companyService.getCompanyJobs(Number(id), jobsPage, JOBS_PER_PAGE);
      setJobs(response.jobs);
      setTotalJobPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch company jobs:', error);
    }
  }, [id, jobsPage]);

  useEffect(() => {
    checkRecruiterStatus();
    fetchCompanyDetails();
  }, [checkRecruiterStatus, fetchCompanyDetails]);

  useEffect(() => {
    if (company) {
      fetchCompanyJobs();
    }
  }, [company, fetchCompanyJobs]);

  const handleFollowToggle = async () => {
    try {
      const result = await companyService.toggleFollow(Number(id));
      setCompany(prev => ({
        ...prev,
        isFollowing: result.isFollowing,
        followers: result.followers
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleJobFormChange = (field) => (event) => {
    setJobForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleOpenJobDialog = (job = null) => {
    if (job) {
      setJobForm({
        title: job.title,
        type: job.type,
        location: job.location,
        salary: job.salary,
        description: 'Job description here...',
        requirements: 'Job requirements here...'
      });
      setEditingJob(job);
    } else {
      setJobForm({
        title: '',
        type: 'Full-time',
        location: '',
        salary: '',
        description: '',
        requirements: ''
      });
      setEditingJob(null);
    }
    setJobDialog(true);
  };

  const handleCloseJobDialog = () => {
    setJobDialog(false);
    setEditingJob(null);
  };

  const handleSaveJob = async () => {
    try {
      // In a real app, this would call an API to save the job
      console.log('Saving job:', jobForm);
      handleCloseJobDialog();
      fetchCompanyJobs(); // Refresh jobs list
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setJobsPage(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Company not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Company Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {company.name.charAt(0)}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" gutterBottom>
                  {company.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {company.industry}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{company.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{company.size} employees</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>Founded {company.founded}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WebsiteIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Link href={company.website} target="_blank" rel="noopener">
                {company.website}
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {!isRecruiter && (
              <Button
                variant={company.isFollowing ? "outlined" : "contained"}
                size="large"
                onClick={handleFollowToggle}
                sx={{ mb: 2 }}
              >
                {company.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            <Typography variant="subtitle1">
              {company.followers.toLocaleString()} followers
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Company Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About {company.name}
            </Typography>
            <Typography paragraph>
              {company.description}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Benefits & Perks
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {company.benefits.map((benefit, index) => (
                <Chip key={index} label={benefit} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Job Listings */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Open Positions ({company.openPositions})
              </Typography>
              {isRecruiter && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenJobDialog()}
                >
                  Post New Job
                </Button>
              )}
            </Box>

            <List>
              {jobs.map((job) => (
                <div key={job.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" component="div">
                            {job.title}
                          </Typography>
                          {isRecruiter && (
                            <Box>
                              <IconButton onClick={() => handleOpenJobDialog(job)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" paragraph>
                            {job.type} • {job.location}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            {job.salary}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Posted: {job.posted}
                          </Typography>
                        </Box>
                      }
                    />
                    {!isRecruiter && <Button variant="outlined">Apply</Button>}
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>

            {totalJobPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalJobPages}
                  page={jobsPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Job Dialog */}
      <Dialog open={jobDialog} onClose={handleCloseJobDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingJob ? 'Edit Job' : 'Post New Job'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Job Title"
              value={jobForm.title}
              onChange={handleJobFormChange('title')}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={jobForm.type}
                onChange={handleJobFormChange('type')}
                label="Job Type"
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              value={jobForm.location}
              onChange={handleJobFormChange('location')}
              fullWidth
              required
            />
            <TextField
              label="Salary Range"
              value={jobForm.salary}
              onChange={handleJobFormChange('salary')}
              fullWidth
              required
            />
            <TextField
              label="Job Description"
              value={jobForm.description}
              onChange={handleJobFormChange('description')}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Requirements"
              value={jobForm.requirements}
              onChange={handleJobFormChange('requirements')}
              multiline
              rows={4}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveJob}
            disabled={!jobForm.title || !jobForm.location || !jobForm.salary}
          >
            {editingJob ? 'Save Changes' : 'Post Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyProfile;