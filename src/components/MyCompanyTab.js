import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
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
  Divider,
  Card,
  CardContent,
  Pagination,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  Article as BlogIcon
} from '@mui/icons-material';
import { companyService } from '../services/companyService';
import { authService } from '../services/authService';
import { blogService } from '../services/blogService';

const MyCompanyTab = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [blogsPage, setBlogsPage] = useState(1);
  const [totalJobPages, setTotalJobPages] = useState(0);
  const [totalBlogPages, setTotalBlogPages] = useState(0);
  const [jobDialog, setJobDialog] = useState(false);
  const [blogDialog, setBlogDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    type: 'Full-time',
    location: '',
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    description: '',
    requirements: [],
    department: ''
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    tags: []
  });

  const ITEMS_PER_PAGE = 5;

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = authService.getCompanyId();
      if (!companyId) {
        throw new Error('No company ID found');
      }
      const data = await companyService.getCompanyById(companyId);
      setCompany(data);
    } catch (error) {
      console.error('Failed to fetch company details:', error);
      setError('Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyJobs = useCallback(async () => {
    if (!company) return;
    try {
      const response = await companyService.getCompanyJobs(company.id, jobsPage, ITEMS_PER_PAGE);
      if (response.status === 'success' && response.data) {
        const formattedJobs = response.data.map(job => ({
          id: job._id,
          title: job.title,
          type: job.type,
          location: job.location,
          department: job.department,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements,
          posted: new Date(job.createdAt).toLocaleDateString(),
          applicationsCount: job.applicationsCount
        }));
        setJobs(formattedJobs);
        setTotalJobPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch company jobs:', error);
    }
  }, [company, jobsPage]);

  const fetchCompanyBlogs = useCallback(async () => {
    if (!company) return;
    try {
      const response = await blogService.getCompanyBlogs(company.id, blogsPage, ITEMS_PER_PAGE);
      if (response.status === 'success' && response.data) {
        setBlogs(response.data);
        setTotalBlogPages(Math.ceil(response.total / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Failed to fetch company blogs:', error);
    }
  }, [company, blogsPage]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    if (company) {
      if (activeTab === 0) {
        fetchCompanyJobs();
      } else {
        fetchCompanyBlogs();
      }
    }
  }, [company, activeTab, fetchCompanyJobs, fetchCompanyBlogs]);

  const handleJobFormChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'requirements') {
      setJobForm(prev => ({
        ...prev,
        [field]: value.split(',').map(req => req.trim()).filter(req => req)
      }));
    } else if (field === 'salary.min' || field === 'salary.max') {
      const [parent, child] = field.split('.');
      setJobForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseInt(value) || 0
        }
      }));
    } else {
      setJobForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBlogFormChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'tags') {
      setBlogForm(prev => ({
        ...prev,
        [field]: value.split(',').map(tag => tag.trim()).filter(tag => tag)
      }));
    } else {
      setBlogForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleOpenJobDialog = (job = null) => {
    if (job) {
      setJobForm({
        title: job.title,
        type: job.type,
        location: job.location,
        salary: job.salary || { min: 0, max: 0, currency: 'USD' },
        description: job.description || '',
        requirements: job.requirements || [],
        department: job.department || ''
      });
      setEditingJob(job);
    } else {
      setJobForm({
        title: '',
        type: 'Full-time',
        location: '',
        salary: { min: 0, max: 0, currency: 'USD' },
        description: '',
        requirements: [],
        department: ''
      });
      setEditingJob(null);
    }
    setJobDialog(true);
  };

  const handleOpenBlogDialog = (blog = null) => {
    if (blog) {
      setBlogForm({
        title: blog.title,
        content: blog.content,
        tags: blog.tags || []
      });
      setEditingBlog(blog);
    } else {
      setBlogForm({
        title: '',
        content: '',
        tags: []
      });
      setEditingBlog(null);
    }
    setBlogDialog(true);
  };

  const handleCloseJobDialog = () => {
    setJobDialog(false);
    setEditingJob(null);
  };

  const handleCloseBlogDialog = () => {
    setBlogDialog(false);
    setEditingBlog(null);
  };

  const handleSaveJob = async () => {
    try {
      const companyId = authService.getCompanyId();
      const userId = authService.getUserId();

      if (!companyId || !userId) {
        throw new Error('Authentication information missing');
      }

      const jobData = {
        ...jobForm,
        postedBy: userId
      };

      await companyService.createJob(companyId, jobData);
      handleCloseJobDialog();
      fetchCompanyJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
      setError('Failed to save job. Please try again.');
    }
  };

  const handleSaveBlog = async () => {
    try {
      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, blogForm);
      } else {
        await blogService.createBlog(blogForm);
      }
      handleCloseBlogDialog();
      fetchCompanyBlogs();
    } catch (error) {
      console.error('Failed to save blog:', error);
      setError('Failed to save blog. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      console.log('Deleting job:', jobId);
      fetchCompanyJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await blogService.deleteBlog(blogId);
      fetchCompanyBlogs();
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  const handleJobPageChange = (event, value) => {
    setJobsPage(value);
  };

  const handleBlogPageChange = (event, value) => {
    setBlogsPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" gutterBottom>
                Company Stats
              </Typography>
              <Typography variant="body1">
                {company.followers.toLocaleString()} followers
              </Typography>
              <Typography variant="body1">
                {company.openPositions} open positions
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Job Listings" />
          <Tab label="Blog Posts" />
        </Tabs>
      </Box>

      {/* Job Management */}
      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Job Listings
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenJobDialog()}
            >
              Post New Job
            </Button>
          </Box>

          <List>
            {jobs.map((job) => (
              <div key={job.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                          {job.title}
                        </Typography>
                        <Box>
                          <IconButton onClick={() => handleOpenJobDialog(job)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" paragraph>
                          {job.type} • {job.location}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Posted: {job.posted}
                        </Typography>
                      </Box>
                    }
                  />
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
                onChange={handleJobPageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Blog Management */}
      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Blog Posts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenBlogDialog()}
            >
              Create New Blog
            </Button>
          </Box>

          <List>
            {blogs.map((blog) => (
              <div key={blog._id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                          {blog.title}
                        </Typography>
                        <Box>
                          <IconButton onClick={() => handleOpenBlogDialog(blog)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteBlog(blog._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" paragraph>
                          {blog.content.substring(0, 200)}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {blog.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                        </Box>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Posted: {new Date(blog.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>

          {totalBlogPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalBlogPages}
                page={blogsPage}
                onChange={handleBlogPageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}

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
              label="Department"
              value={jobForm.department}
              onChange={handleJobFormChange('department')}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Minimum Salary"
                type="number"
                value={jobForm.salary.min}
                onChange={handleJobFormChange('salary.min')}
                fullWidth
                required
              />
              <TextField
                label="Maximum Salary"
                type="number"
                value={jobForm.salary.max}
                onChange={handleJobFormChange('salary.max')}
                fullWidth
                required
              />
            </Box>
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
              label="Requirements (comma-separated)"
              value={jobForm.requirements.join(', ')}
              onChange={handleJobFormChange('requirements')}
              multiline
              rows={4}
              fullWidth
              required
              helperText="Enter requirements separated by commas"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveJob}
            disabled={!jobForm.title || !jobForm.location || !jobForm.salary.min || !jobForm.salary.max}
          >
            {editingJob ? 'Save Changes' : 'Post Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Blog Dialog */}
      <Dialog open={blogDialog} onClose={handleCloseBlogDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Blog Title"
              value={blogForm.title}
              onChange={handleBlogFormChange('title')}
              fullWidth
              required
            />
            <TextField
              label="Blog Content"
              value={blogForm.content}
              onChange={handleBlogFormChange('content')}
              multiline
              rows={6}
              fullWidth
              required
            />
            <TextField
              label="Tags (comma-separated)"
              value={blogForm.tags.join(', ')}
              onChange={handleBlogFormChange('tags')}
              fullWidth
              helperText="Enter tags separated by commas (e.g., career, job, developer)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBlogDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveBlog}
            disabled={!blogForm.title || !blogForm.content}
          >
            {editingBlog ? 'Save Changes' : 'Create Blog'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCompanyTab;