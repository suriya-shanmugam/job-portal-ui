import { useState, useEffect } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  Container,
  Button
} from '@mui/material';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import JobsTab from './components/JobsTab';
import SearchTab from './components/SearchTab';
import ProfileTab from './components/ProfileTab';
import FeedsTab from './components/FeedsTab';
import CompaniesTab from './components/CompaniesTab';
import CompanyProfile from './components/CompanyProfile';
import PeopleTab from './components/PeopleTab';
import PersonProfile from './components/PersonProfile';
import MyCompanyTab from './components/MyCompanyTab';
import NotificationPanel from './components/NotificationPanel';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ChatAssistant from './components/ChatAssistant';
import { authService } from './services/authService';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsRecruiter(currentUser.role === 'Recruiter');
      
      // Redirect to appropriate initial route based on role
      if (location.pathname === '/') {
        navigate(currentUser.role === 'Recruiter' ? '/people' : '/feeds');
      }
    }
  }, []);

  const handleSignOut = () => {
    authService.signOut();
    navigate('/signin');
  };

  // Get tabs based on user role
  const getTabs = () => {
    if (isRecruiter) {
      return [
        { label: 'People', path: '/people' },
        { label: 'Company', path: '/companies' },
        { label: 'MyCompany', path: '/mycompany' }
      ];
    }
    return [
      { label: 'Feeds', path: '/feeds' },
      { label: 'Companies', path: '/companies' },
      { label: 'Jobs', path: '/jobs' },
      { label: 'People', path: '/people' },
      { label: 'Profile', path: '/profile' }
    ];
  };

  const tabs = getTabs();

  // Update current tab based on location
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    navigate(tabs[newValue].path);
  };

  // Set initial tab based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabs.findIndex(tab => tab.path === currentPath);
    if (tabIndex !== -1) {
      setCurrentTab(tabIndex);
    }
  }, [location.pathname, tabs]);

  if (location.pathname === '/signin' || location.pathname === '/signup') {
    return location.pathname === '/signin' ? <SignIn /> : <SignUp />;
  }

  return (
    <div className="App">
      <AppBar position="static" color="default">
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Job Portal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user && (
                <Typography variant="body1">
                  Welcome, {user.firstName} {user.lastName}
                </Typography>
              )}
              {/* <NotificationPanel /> */}
              <Button color="inherit" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab key={tab.label} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {isRecruiter ? <Navigate to="/people" /> : <Navigate to="/feeds" />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobsTab />
                </ProtectedRoute>
              }
            />
            {!isRecruiter && (
              <Route
                path="/feeds"
                element={
                  <ProtectedRoute>
                    <FeedsTab />
                  </ProtectedRoute>
                }
              />
            )}
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/:id"
              element={
                <ProtectedRoute>
                  <CompanyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/people"
              element={
                <ProtectedRoute>
                  <PeopleTab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/person/:id"
              element={
                <ProtectedRoute>
                  <PersonProfile />
                </ProtectedRoute>
              }
            />
            {!isRecruiter && (
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileTab />
                  </ProtectedRoute>
                }
              />
            )}
            {isRecruiter && (
              <Route
                path="/mycompany"
                element={
                  <ProtectedRoute>
                    <MyCompanyTab />
                  </ProtectedRoute>
                }
              />
            )}
          </Routes>
        </Box>
      </Box>

      {/* Chat Assistant - Only show when user is authenticated */}
      {user && <ChatAssistant />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;