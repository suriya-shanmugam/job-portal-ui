import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Grid,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import { peopleService } from '../services/peopleService';

const ProfileTab = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await peopleService.getCurrentProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to fetch profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, isNestedArray = false, index = null) => (event) => {
    if (isNestedArray && index !== null) {
      const newArray = [...profile[field]];
      newArray[index] = { ...newArray[index], [event.target.name]: event.target.value };
      setProfile({ ...profile, [field]: newArray });
    } else {
      setProfile({ ...profile, [field]: event.target.value });
    }
  };

  const handleSkillsChange = (event) => {
    const skills = event.target.value.split(',').map(skill => skill.trim());
    setProfile({ ...profile, skills });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = {
        phone: profile.phone,
        address: profile.address,
        skills: profile.skills,
        professionalExperience: profile.professionalExperience,
        professionalSummary: profile.professionalSummary,
        education: profile.education,
        experience: profile.experience
      };

      await peopleService.updateProfile(updatedProfile);
      setSuccess(true);
      setEditMode(false);
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Profile Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2.5rem'
            }}
          >
            {profile.name ? profile.name.charAt(0) : profile.userId.firstName.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 3, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1">
                {profile.name || `${profile.userId.firstName} ${profile.userId.lastName}`}
              </Typography>
              <IconButton 
                onClick={() => setEditMode(!editMode)}
                sx={{ ml: 2 }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" color="textSecondary">
              {profile.professionalSummary}
            </Typography>
          </Box>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Basic Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {profile.userId.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {profile.professionalExperience} years of experience
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {profile.education?.[0]?.collegeName || 'No education listed'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Details */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stack spacing={3}>
          {editMode ? (
            <>
              <TextField
                label="Phone"
                value={profile.phone || ''}
                onChange={handleInputChange('phone')}
                fullWidth
              />
              <TextField
                label="Address"
                value={profile.address || ''}
                onChange={handleInputChange('address')}
                fullWidth
              />
              <TextField
                label="Professional Experience (years)"
                type="number"
                value={profile.professionalExperience || ''}
                onChange={handleInputChange('professionalExperience')}
                fullWidth
              />
              <TextField
                label="Professional Summary"
                value={profile.professionalSummary || ''}
                onChange={handleInputChange('professionalSummary')}
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                label="Skills (comma-separated)"
                value={profile.skills?.join(', ') || ''}
                onChange={handleSkillsChange}
                fullWidth
                helperText="Enter skills separated by commas"
              />
              
              <Typography variant="h6" gutterBottom>Education</Typography>
              {profile.education?.map((edu, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="College Name"
                    name="collegeName"
                    value={edu.collegeName || ''}
                    onChange={handleInputChange('education', true, index)}
                    fullWidth
                  />
                  <TextField
                    label="From Year"
                    name="fromYear"
                    type="number"
                    value={edu.fromYear || ''}
                    onChange={handleInputChange('education', true, index)}
                  />
                  <TextField
                    label="To Year"
                    name="toYear"
                    type="number"
                    value={edu.toYear || ''}
                    onChange={handleInputChange('education', true, index)}
                  />
                </Box>
              ))}

              <Typography variant="h6" gutterBottom>Experience</Typography>
              {profile.experience?.map((exp, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Company Name"
                    name="companyName"
                    value={exp.companyName || ''}
                    onChange={handleInputChange('experience', true, index)}
                    fullWidth
                  />
                  <TextField
                    label="From Year"
                    name="fromYear"
                    type="number"
                    value={exp.fromYear || ''}
                    onChange={handleInputChange('experience', true, index)}
                  />
                  <TextField
                    label="To Year"
                    name="toYear"
                    type="number"
                    value={exp.toYear || ''}
                    onChange={handleInputChange('experience', true, index)}
                    placeholder="Leave empty if current"
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Phone: {profile.phone || 'Not provided'}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Address: {profile.address || 'Not provided'}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Professional Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {profile.professionalSummary || 'No summary provided'}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.skills?.map((skill, index) => (
                      <Chip key={index} label={skill} />
                    ))}
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Education
                  </Typography>
                  {profile.education?.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {edu.collegeName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {edu.fromYear} - {edu.toYear}
                      </Typography>
                    </Box>
                  ))}

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Experience
                  </Typography>
                  {profile.experience?.map((exp, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {exp.companyName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {exp.fromYear} - {exp.toYear || 'Present'}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfileTab;