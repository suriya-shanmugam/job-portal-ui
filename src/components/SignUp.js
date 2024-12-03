import { useState } from 'react';
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

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
  const [loading, setLoading] = useState(false);
  const { subscribeUser } = usePushNotificationService();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Required fields for all users
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      const result = await authService.signUp(formData);
      
      if (result.success) {
        // Token and user info are already stored by authService
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
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
        subscribeUser(user.id,user.firstName,user.email);
        console.log("subscribe triggered")
      } catch (error) {
        console.error("Subscription failed:", error);
      }
    }
  };

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
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

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

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/signin" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  Already have an account? Sign In
                </Typography>
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;