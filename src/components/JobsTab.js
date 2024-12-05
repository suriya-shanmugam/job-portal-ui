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
  Button,
  Modal,
  Chip
} from '@mui/material';
import { jobService } from '../services/jobService';
import { authService } from '../services/authService';
import LaunchIcon from '@mui/icons-material/Launch';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '80vh',
  overflow: 'auto'
};

const JobsTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzingJobs, setAnalyzingJobs] = useState(new Set());
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

  const handleAnalyze = async (jobId) => {
    try {
      if (!authService.isAuthenticated()) {
        setError('Please sign in to analyze job matches');
        return;
      }

      const userId = authService.getUserId();
      if (!userId) {
        setError('User ID not found. Please sign in again.');
        return;
      }

      setAnalyzingJobs(prev => new Set([...prev, jobId]));
      const analysis = await jobService.analyzeJob(jobId, userId);
      if (analysis) {
        setAnalysisData(analysis);
        setModalOpen(true);
      } else {
        throw new Error('Failed to get analysis data');
      }
    } catch (err) {
      console.error('Error analyzing job:', err);
      setError('Failed to analyze job. Please try again later.');
    } finally {
      setAnalyzingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnalysisData(null);
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
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => handleAnalyze(job._id)}
                  disabled={analyzingJobs.has(job._id) || !authService.isAuthenticated()}
                >
                  {analyzingJobs.has(job._id) ? 'Analyzing...' : 'Analyze'}
                </Button>
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

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="analysis-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="analysis-modal-title" variant="h6" component="h2" gutterBottom>
            Skills Analysis Report
          </Typography>
          {analysisData && (
            <Box>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Hard Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {analysisData.HardSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color={analysisData.MatchedSkills.includes(skill) ? "success" : "default"}
                    variant={analysisData.MatchedSkills.includes(skill) ? "filled" : "outlined"}
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Soft Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {analysisData.SoftSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color={analysisData.MatchedSkills.includes(skill) ? "success" : "default"}
                    variant={analysisData.MatchedSkills.includes(skill) ? "filled" : "outlined"}
                  />
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Matched skills are highlighted in green
                </Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseModal}>Close</Button>
          </Box>
        </Box>
      </Modal>

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