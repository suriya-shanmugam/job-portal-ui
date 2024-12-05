import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Pagination, 
  Card, 
  CardContent,
  Stack,
  Alert,
  Button
} from '@mui/material';
import { jobService } from '../services/jobService';
import LaunchIcon from '@mui/icons-material/Launch';

const JobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching jobs...');
        const response = await jobService.getJobs(page, ITEMS_PER_PAGE);
        console.log('Jobs response:', response);
        
        if (response.jobs) {
          setJobs(response.jobs);
          setTotalPages(response.totalPages);
          console.log('Jobs set:', response.jobs);
        } else {
          throw new Error('No jobs data in response');
        }
      } catch (err) {
        console.error('Error in fetchJobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleJobApply = (jobLink) => {
    if (!jobLink) {
      console.error('No job link provided');
      return;
    }
    window.open(jobLink, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Available Jobs ({jobs.length})
      </Typography>

      <Stack spacing={2}>
        {jobs.map((job) => (
          <Card key={job._id} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {job.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {job.companyId?.name || 'Company Name Not Available'}
              </Typography>
              <Typography variant="body2" paragraph>
                📍 {job.location} | 💰 {job.salary?.min || 0} - {job.salary?.max || 0} {job.salary?.currency || 'USD'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                🕒 Posted: {new Date(job.createdAt).toLocaleDateString()} | 💼 {job.type}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {job.description}
              </Typography>
              {job.requirements && job.requirements.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Requirements:</strong>
                  </Typography>
                  <ul style={{ margin: '8px 0' }}>
                    {job.requirements.map((req, index) => (
                      <li key={index}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<LaunchIcon />}
                  onClick={() => handleJobApply(job.jobLink)}
                  disabled={!job.jobLink}
                >
                  Apply Now
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {jobs.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {jobs.length === 0 && !loading && !error && (
        <Box p={3} textAlign="center">
          <Typography variant="body1" color="textSecondary">
            No jobs available at the moment.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobsTab;