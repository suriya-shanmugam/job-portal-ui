import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Collapse,
  Divider
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { usePushNotificationService } from '../services/pushNotifyService'; // Import the hook
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const SignUp = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'Applicant',
    // Optional company details
    companyName: '',
    companyDescription: '',
    companyIndustry: '',
    companyLocation: '',
    companyWebsite: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { subscribeUser } = usePushNotificationService();

  useEffect(() => {
    const checkUserExists = async () => { 

      let token;
      if(user) token = await getAccessTokenSilently();
      localStorage.setItem('token', token);
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (user !== undefined && token !== undefined){
        console.log('User:', user);
        setFormData(prev => (
          {
            ...prev,
            email: user.email
          }
        ));
        try {
          console.log('Checking if user exists:', user.email);
          const response = await authService.checkIfUserExists(user.email);
          console.log('User exists:', response.userExists);
          if (response.userExists) {
            console.log('User already exists');
            let user = response.user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user.id);
            
            // Store companyId if user is a recruiter
            if (user.role === 'Recruiter' && user.companyId) {
              localStorage.setItem('companyId', user.companyId);
            }
            await subscribeUser(user.id,user.firstName,user.email);
            navigate('/jobs');
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
        }
      }
      setLoading(false);
    }
    checkUserExists();
  }, [user, getAccessTokenSilently, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Required fields for all users
    if (!formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log(formData)
      const result = await authService.signUp(formData);
      
      if (result.success) {
        let user = result.user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        localStorage.setItem('role', user.role);
        console.log('User role is: ', user.role);

        // Store companyId if user is a recruiter
        if (user.role === 'Recruiter' && user.companyId) {
          localStorage.setItem('companyId', user.companyId);
        }
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to sign up:', err);
      setError('Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
      try {
        // Trigger the subscribeUser function with the user's data
        const user = authService.getCurrentUser();
        
        /*let user = {};
        user.id="123";
        user.firstname="hello";
        user.email="test.com";*/
        console.log(user);
        await subscribeUser(user.id,user.firstName,user.email);
        console.log("subscribe triggered")
      } catch (error) {
        console.error("Subscription failed:", error);
      }
    }
  };
  if (loading) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create an Account
        </Typography>

        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel 
                  value="Applicant" 
                  control={<Radio />} 
                  label="Job Seeker" 
                />
                <FormControlLabel 
                  value="Recruiter" 
                  control={<Radio />} 
                  label="Recruiter" 
                />
              </RadioGroup>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Required Information
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />

            {formData.role === 'Recruiter' && (
              <Collapse in={true}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Company Details (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You can add or update company details later
                </Typography>

                <TextField
                  margin="normal"
                  fullWidth
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="companyDescription"
                  label="Company Description"
                  multiline
                  rows={3}
                  value={formData.companyDescription}
                  onChange={handleChange}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="companyIndustry"
                  label="Industry"
                  value={formData.companyIndustry}
                  onChange={handleChange}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="companyLocation"
                  label="Location"
                  value={formData.companyLocation}
                  onChange={handleChange}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  name="companyWebsite"
                  label="Website"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </Collapse>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;