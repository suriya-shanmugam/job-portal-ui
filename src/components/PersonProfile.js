import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { peopleService } from '../services/peopleService';

const PersonProfile = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPersonDetails();
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      const data = await peopleService.getPersonById(id);
      setPerson(data);
    } catch (error) {
      setError('Failed to fetch person details');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const result = await peopleService.toggleFollow(Number(id));
      setPerson(prev => ({
        ...prev,
        isFollowing: result.isFollowing,
        followers: result.followers
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !person) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error || 'Person not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem'
                }}
              >
                {person.name.charAt(0)}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" gutterBottom>
                  {person.name}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {person.role}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{person.company}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{person.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{person.experience}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button
              variant={person.isFollowing ? "outlined" : "contained"}
              size="large"
              onClick={handleFollowToggle}
              sx={{ mb: 2 }}
            >
              {person.isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Typography variant="subtitle1">
              {person.followers.toLocaleString()} followers • {person.connections.toLocaleString()} connections
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - About & Skills */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography paragraph>
              {person.bio}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {person.skills.map((skill, index) => (
                <Chip key={index} label={skill} />
              ))}
            </Box>
          </Paper>

          {/* Experience */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Experience
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle1">
                  {person.role}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {person.company}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {person.experience}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Education */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Education
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="subtitle1">
                  {person.education.school}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {person.education.degree}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Graduated {person.education.year}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Contact & Additional Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Link href={`mailto:${person.name.toLowerCase().replace(' ', '.')}@example.com`}>
                  {person.name.toLowerCase().replace(' ', '.')}@example.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkedInIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Link href="#" target="_blank">
                  LinkedIn Profile
                </Link>
              </Box>
            </Box>
          </Paper>

          {person.isRecruiter && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recruiter Information
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Recruiter at {person.company}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.location.href = `/company/${person.companyId}`}
              >
                View Company Profile
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonProfile;