import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Pagination, 
  Card, 
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import { jobService } from '../services/jobService';

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
        const response = await jobService.getJobs(page, ITEMS_PER_PAGE);
        setJobs(response.jobs);
        setTotalPages(response.totalPages);
      } catch (err) {
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
        Available Jobs
      </Typography>

      <Stack spacing={2}>
        {jobs.map((job) => (
          <Card key={job.id} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {job.title}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {job.company}
              </Typography>
              <Typography variant="body2" paragraph>
                📍 {job.location} | 💰 {job.salary.start} - {job.salary.end}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                🕒 Posted: {job.posted} | 💼 {job.type}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {job.description}
              </Typography>
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
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handlePageChange}
          color="primary"
          size="large"
        />
      </Box>
    </Box>
  );
};

export default JobsTab;