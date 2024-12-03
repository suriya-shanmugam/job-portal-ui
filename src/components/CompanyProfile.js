import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Link,
  Pagination,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { companyService } from "../services/companyService";
import { peopleService } from "../services/peopleService";

const CompanyProfile = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsPage, setJobsPage] = useState(1);
  const [totalJobPages, setTotalJobPages] = useState(0);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [jobDialog, setJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: "",
    type: "Full-time",
    location: "",
    salary: "",
    description: "",
    requirements: "",
  });
  const JOBS_PER_PAGE = 5;

  const checkRecruiterStatus = useCallback(async () => {
    try {
      const recruiterStatus = await peopleService.isRecruiter();
      const recruiterCompanyId = await peopleService.getRecruiterCompanyId();
      setIsRecruiter(recruiterStatus && recruiterCompanyId === Number(id));
    } catch (error) {
      console.error("Failed to check recruiter status:", error);
    }
  }, [id]);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Hey!");
      console.log(id);
      const data = await companyService.getCompanyById(id);
      setCompany(data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch company details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCompanyJobs = useCallback(async () => {
    try {
      const response = await companyService.getCompanyJobs(
        id,
        jobsPage,
        JOBS_PER_PAGE
      );
      setJobs(response.jobs);
      setTotalJobPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    }
  }, [id, jobsPage]);

  useEffect(() => {
    //checkRecruiterStatus();
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    if (company) {
      fetchCompanyJobs();
    }
  }, [company, fetchCompanyJobs]);

  const handleFollowToggle = async () => {
    try {
      const result = await companyService.toggleFollow(Number(id));
      setCompany((prev) => ({
        ...prev,
        isFollowing: result.isFollowing,
        followers: result.followers,
      }));
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  const handleJobFormChange = (field) => (event) => {
    setJobForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleOpenJobDialog = (job = null) => {
    if (job) {
      setJobForm({
        title: job.title,
        type: job.type,
        location: job.location,
        salary: job.salary,
        description: "Job description here...",
        requirements: "Job requirements here...",
      });
      setEditingJob(job);
    } else {
      setJobForm({
        title: "",
        type: "Full-time",
        location: "",
        salary: "",
        description: "",
        requirements: "",
      });
      setEditingJob(null);
    }
    setJobDialog(true);
  };

  const handleCloseJobDialog = () => {
    setJobDialog(false);
    setEditingJob(null);
  };

  const handleSaveJob = async () => {
    try {
      // In a real app, this would call an API to save the job
      console.log("Saving job:", jobForm);
      handleCloseJobDialog();
      fetchCompanyJobs(); // Refresh jobs list
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handlePageChange = (event, value) => {
    setJobsPage(value);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !company) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || "Company not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Company Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {company.name.charAt(0)}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" gutterBottom>
                  {company.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {company.industry}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography>{company.location}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography>{company.size} employees</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography>Founded {company.founded}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <WebsiteIcon sx={{ mr: 1, color: "text.secondary" }} />
              <Link href={company.website} target="_blank" rel="noopener">
                {company.website}
              </Link>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            {!isRecruiter && (
              <Button
                variant={company.isFollowing ? "outlined" : "contained"}
                size="large"
                onClick={handleFollowToggle}
                sx={{ mb: 2 }}
              >
                {company.isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            <Typography variant="subtitle1">
              {company.followers.toLocaleString()} followers
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyProfile;
