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
import Authentication from './components/Authentication';
import { ProtectedRoute } from './components/AuthenticationGuard';
import { authService } from './services/authService';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';


function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [user, setUser] = useState(null);
  const { logout } = useAuth0();

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
    logout({
      logoutParams: {
          returnTo: 'http://localhost:3001/',
      },
    });
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
  } else if (location.pathname === '/') {
    return <Authentication />;
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
            <Route
              path="/"
              element={
                <Authentication/>
              }
            />
            <Route path="/signup" element={<ProtectedRoute component={SignUp}/>} />
            <Route
              path="/home"
              element={
                <>
                  {isRecruiter ? <ProtectedRoute component={PeopleTab}/> : <ProtectedRoute component={FeedsTab}/>}
                </>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute component={JobsTab}/>
              }
            />
            {!isRecruiter && (
              <Route
                path="/feeds"
                element={
                  <ProtectedRoute component={FeedsTab}/>
                }
              />
            )}
            <Route
              path="/companies"
              element={
                <ProtectedRoute component={CompaniesTab}/>
              }
            />
            <Route
              path="/company/:id"
              element={
                <ProtectedRoute component={CompanyProfile}/>
              }
            />
            <Route
              path="/people"
              element={
                <ProtectedRoute component={PeopleTab}/>
              }
            />
            <Route
              path="/person/:id"
              element={
                <ProtectedRoute component={PersonProfile}/>
              }
            />
            {!isRecruiter && (
              <Route
                path="/profile"
                element={
                  <ProtectedRoute component={ProfileTab}/>
                }
              />
            )}
            {isRecruiter && (
              <Route
                path="/mycompany"
                element={
                  <ProtectedRoute component={MyCompanyTab}/>
                }
              />
            )}
          </Routes>
        </Box>
      </Box>
    </div>
  );
}

function App() {
  return (
    <MainContent />
  );
}

export default App;