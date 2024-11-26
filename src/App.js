import { useState, useEffect } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography,
  Container
} from '@mui/material';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation
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
import { peopleService } from './services/peopleService';
import './App.css';

function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    checkRecruiterStatus();
  }, []);

  const checkRecruiterStatus = async () => {
    try {
      const recruiterStatus = await peopleService.isRecruiter();
      setIsRecruiter(recruiterStatus);
    } catch (error) {
      console.error('Failed to check recruiter status:', error);
    }
  };

  // Update current tab based on location
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/search');
        break;
      case 2:
        navigate('/feeds');
        break;
      case 3:
        navigate('/companies');
        break;
      case 4:
        navigate('/people');
        break;
      case 5:
        navigate('/profile');
        break;
      case 6:
        navigate('/mycompany');
        break;
      default:
        navigate('/');
    }
  };

  // Set initial tab based on current route
  useEffect(() => {
    switch (location.pathname) {
      case '/search':
        setCurrentTab(1);
        break;
      case '/feeds':
        setCurrentTab(2);
        break;
      case '/companies':
        setCurrentTab(3);
        break;
      case '/people':
        setCurrentTab(4);
        break;
      case '/profile':
        setCurrentTab(5);
        break;
      case '/mycompany':
        setCurrentTab(6);
        break;
      default:
        if (location.pathname.startsWith('/company/')) {
          setCurrentTab(3);
        } else if (location.pathname.startsWith('/person/')) {
          setCurrentTab(4);
        } else {
          setCurrentTab(0);
        }
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <AppBar position="static" color="default">
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Job Portal
            </Typography>
            <NotificationPanel />
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
            <Tab label="Jobs" />
            <Tab label="Search" />
            <Tab label="Feeds" />
            <Tab label="Companies" />
            <Tab label="People" />
            <Tab label="Profile" />
            {isRecruiter && <Tab label="My Company" />}
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/" element={<JobsTab />} />
            <Route path="/search" element={<SearchTab />} />
            <Route path="/feeds" element={<FeedsTab />} />
            <Route path="/companies" element={<CompaniesTab />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="/people" element={<PeopleTab />} />
            <Route path="/person/:id" element={<PersonProfile />} />
            <Route path="/profile" element={<ProfileTab />} />
            {isRecruiter && <Route path="/mycompany" element={<MyCompanyTab />} />}
          </Routes>
        </Box>
      </Box>
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