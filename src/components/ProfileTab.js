import { useState } from 'react';
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
  Tabs,
  Tab,
  IconButton,
  Grid,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ProfileTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);

  // Dummy profile data
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    currentRole: 'Senior Software Engineer',
    company: 'Tech Solutions Inc.',
    experience: '5 years',
    education: [
      {
        school: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        year: '2019'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    bio: 'Experienced software engineer passionate about creating efficient and scalable solutions.'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field) => (event) => {
    setProfile({
      ...profile,
      [field]: event.target.value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }

      setDocument(file);
      setError(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            {profile.fullName.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 3, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1">
                {profile.fullName}
              </Typography>
              <IconButton 
                onClick={() => setEditMode(!editMode)}
                sx={{ ml: 2 }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" color="textSecondary">
              {profile.currentRole} at {profile.company}
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
                  {profile.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {profile.experience} of experience
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {profile.education[0].degree}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Profile Details" />
          <Tab label="Resume & Documents" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            {editMode ? (
              <>
                <TextField
                  label="Full Name"
                  value={profile.fullName}
                  onChange={handleInputChange('fullName')}
                  fullWidth
                />
                <TextField
                  label="Current Role"
                  value={profile.currentRole}
                  onChange={handleInputChange('currentRole')}
                  fullWidth
                />
                <TextField
                  label="Company"
                  value={profile.company}
                  onChange={handleInputChange('company')}
                  fullWidth
                />
                <TextField
                  label="School"
                  value={profile.education[0].school}
                  onChange={handleInputChange('education')}
                  fullWidth
                />
                <TextField
                  label="Bio"
                  value={profile.bio}
                  onChange={handleInputChange('bio')}
                  multiline
                  rows={4}
                  fullWidth
                />
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
                      Professional Summary
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {profile.bio}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Skills
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.skills.map((skill, index) => (
                        <Chip key={index} label={skill} />
                      ))}
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Education
                    </Typography>
                    {profile.education.map((edu, index) => (
                      <Box key={index}>
                        <Typography variant="subtitle1">
                          {edu.school}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {edu.degree} • {edu.year}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fafafa',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  {document ? document.name : 'Upload Resume'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Drag and drop or click to upload (PDF, DOC, DOCX)
                </Typography>
              </Box>

              {document && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Resume:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{document.name}</Typography>
                    <Button size="small" onClick={() => setDocument(null)}>
                      Remove
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProfileTab;