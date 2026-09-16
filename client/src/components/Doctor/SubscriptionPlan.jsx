// SubscriptionPlan.jsx - Professional Redesign
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  Divider,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Radio,
  FormControlLabel,
  RadioGroup,
  CircularProgress,
  TextField,
  Zoom,
  Fade,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  CheckCircle,
  Verified,
  WorkspacePremium,
  Star,
  Lock,
  AccountBalanceWallet,
  CreditCard,
  ArrowBack,
  ArrowForward,
  Payment,
  Schedule,
  Bolt,
  Shield,
  QrCode2,
  EventAvailable,
  Update,
  ReceiptLong,
  TrendingUp,
  AccessTime,
  CalendarMonth,
  Security,
  CloudDone,
  Speed,
  Support,
  Close,
  Check,
  Add,
  Remove,
} from "@mui/icons-material";
import { useAuth } from "../../store/auth";
import { API_URL } from "../../config";

const SubscriptionPlan = () => {
  const { authorizationtoken } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [trialActive, setTrialActive] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState(null);
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/doctorform/plans`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        let fetchedPlans = Array.isArray(data) ? data : [];

        // Dynamically inject 6-Month Plan if not provided by backend
        const hasHalfYearly = fetchedPlans.some(p => p.billingCycle === "Half-Yearly" || p.durationDays === 180);
        if (!hasHalfYearly && fetchedPlans.length > 0) {
          fetchedPlans.splice(1, 0, {
            name: "Pro",
            price: (fetchedPlans[0]?.price || 999) * 5,
            billingCycle: "Half-Yearly",
            durationDays: 180,
            features: ["All Monthly Features", "Priority Search Ranking", "Premium Support"],
            popular: true
          });
        }
        setPlans(fetchedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/doctorform/subscription/mine`,
        {
          method: "GET",
          headers: { Authorization: authorizationtoken },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription || data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/doctorform/subscription/status`,
        {
          method: "GET",
          headers: { Authorization: authorizationtoken },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.status || "None");
        setTrialActive(!!data.trialActive);
        setTrialStartDate(data.trialStartDate || null);
        setTrialEndsAt(data.trialEndsAt || null);
        if (data.subscription) setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  // Trial Activation
  const handleActivateTrial = async () => {
    setTrialLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/doctorform/subscription/trial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationtoken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setMessageType("success");
        setMessage(data.msg || "Free trial activated!");
        await fetchSubscriptionStatus();
      } else {
        setMessageType("error");
        setMessage(data.msg || "Failed to activate trial.");
      }
    } catch (error) {
      console.error("Trial error:", error);
      setMessageType("error");
      setMessage("Failed to activate trial.");
    } finally {
      setTrialLoading(false);
    }
  };

  // Payment Processing
  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/doctorform/subscription/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationtoken,
        },
        body: JSON.stringify({
          plan: selectedPlan.name,
          paymentMethod: paymentMethod
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentReference(data.subscription.paymentReference);
        setCurrentSubscription(data.subscription);
        setSubscriptionStatus(data.subscription.status);
        setMessageType("success");
        setMessage("Subscription activated successfully!");
        setPaymentDone(true);
        setActiveStep(2);
        fetchMySubscription();
      } else {
        throw new Error(data.msg || "Payment failed on server");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessageType("error");
      setMessage(error.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
    fetchSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visiblePlans = Array.isArray(plans) ? plans : [];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleContinueToPayment = () => {
    if (!selectedPlan) return;
    setPaymentOpen(true);
    setActiveStep(0);
    setPaymentDone(false);
    setPaymentReference("");
    setPaymentMethod("UPI");
    setPaymentDetails({
      upiId: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
    });
  };

  const handleValidateStep1 = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    }
  };

  const steps = ["Choose Payment Method", "Review & Pay", "Confirmed"];

  const planIcon = (index) => {
    const icons = [
      <Verified key="m" sx={{ fontSize: 48 }} />,
      <Bolt key="hy" sx={{ fontSize: 48 }} />,
      <WorkspacePremium key="y" sx={{ fontSize: 48 }} />,
    ];
    return icons[index] || <Star sx={{ fontSize: 48 }} />;
  };

  const planColors = ["#1976d2", "#f57c00", "#7b1fa2"];

  const isCurrentPlan = (plan) =>
    currentSubscription &&
    currentSubscription.plan === plan.name &&
    currentSubscription.status === "Active";

  const isSelected = (plan) => selectedPlan?.name === plan.name;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!currentSubscription?.expiryDate) return 0;
    const expiry = new Date(currentSubscription.expiryDate);
    const now = new Date();
    const diff = expiry - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          mb: 4,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -20, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} spacing={3}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)" }}>
              <WorkspacePremium sx={{ fontSize: 48 }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" fontWeight={800} sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                Subscription Plans
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                Choose the perfect plan to boost your practice and reach more patients
              </Typography>
            </Box>
            {currentSubscription?.status === "Active" && (
              <Chip
                label="ACTIVE"
                color="success"
                icon={<Verified />}
                sx={{ fontWeight: 800, fontSize: "1rem", px: 2, py: 2 }}
              />
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Active Subscription Dashboard */}
      {currentSubscription?.status === "Active" && (
        <Fade in timeout={500}>
          <Paper
            elevation={4}
            sx={{
              mb: 5,
              borderRadius: 4,
              overflow: "hidden",
              border: "2px solid #0d47a1",
              background: "linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%)",
            }}
          >
            <Box sx={{ bgcolor: "#0d47a1", color: "white", p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <WorkspacePremium sx={{ fontSize: 32, color: "#ffd54f" }} />
                  <Typography variant="h5" fontWeight={800}>
                    Active Subscription
                  </Typography>
                </Stack>
                <Chip
                  label={`${getDaysRemaining()} days remaining`}
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Star color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Current Plan
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="text.primary">
                        {currentSubscription.plan}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <EventAvailable color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Activated On
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {formatDate(currentSubscription.startDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Update color="error" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="error.main" fontWeight={700} textTransform="uppercase">
                        Valid Until
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="error.main">
                        {formatDate(currentSubscription.expiryDate)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <ReceiptLong color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Reference No.
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ wordBreak: 'break-all' }}>
                        {currentSubscription.paymentReference || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, bgcolor: "white", p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                  Subscription Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    currentSubscription.startDate && currentSubscription.expiryDate
                      ? ((new Date() - new Date(currentSubscription.startDate)) /
                          (new Date(currentSubscription.expiryDate) - new Date(currentSubscription.startDate))) * 100
                      : 50
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Trial Status Banner */}
      {trialActive && (
        <Alert
          severity="info"
          sx={{ mb: 4, borderRadius: 3, border: '1px solid #90caf9', bgcolor: '#f4f9ff' }}
          icon={<AccessTime />}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                14-Day Free Trial Active
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Started: {formatDate(trialStartDate)} • Ends: {formatDate(trialEndsAt)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => navigate("/subscription")}
              sx={{ ml: { sm: "auto" } }}
            >
              Upgrade Now
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Trial Expired Alert */}
      {subscriptionStatus === "TrialExpired" && (
        <Alert
          severity="warning"
          sx={{ mb: 4, borderRadius: 3, border: '1px solid #ffcc80', bgcolor: '#fff8e1' }}
          icon={<Schedule />}
        >
          <Typography variant="subtitle1" fontWeight={800}>
            Your Free Trial Has Ended
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscribe now to continue accessing premium features and receiving patient bookings.
          </Typography>
        </Alert>
      )}

      {/* No Subscription Alert */}
      {!trialActive && subscriptionStatus !== "Active" && subscriptionStatus !== "Trial" && subscriptionStatus !== "TrialExpired" && (
        <Alert
          severity="info"
          sx={{
            mb: 4,
            borderRadius: 3,
            border: '1px solid #90caf9',
            bgcolor: '#f4f9ff',
            "& .MuiAlert-action": { alignSelf: "center" }
          }}
          icon={<Bolt />}
          action={
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={handleActivateTrial}
              disabled={trialLoading}
              sx={{ fontWeight: 800, px: 3, py: 1, borderRadius: 2 }}
            >
              {trialLoading ? "Activating..." : "Start Free Trial"}
            </Button>
          }
        >
          <Typography variant="subtitle1" fontWeight={800}>
            Try Premium Features Free!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get 14 days of full access to all premium features before you decide.
          </Typography>
        </Alert>
      )}

      {/* Success/Error Message */}
      {message && (
        <Alert severity={messageType} sx={{ mb: 4, borderRadius: 3 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Plan Selection Section */}
      <Typography variant="h4" fontWeight={800} align="center" sx={{ mb: 1, color: '#0d47a1' }}>
        Choose Your Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Select a plan that fits your practice needs
      </Typography>

      {/* Plan Cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        {visiblePlans.map((plan, index) => {
          const color = planColors[index] || "#1976d2";
          const isCurrent = isCurrentPlan(plan);
          const isPopular = plan.popular || plan.billingCycle === "Yearly";
          const selected = isSelected(plan);

          return (
            <Grid item xs={12} md={4} sm={6} key={`${plan.name}-${plan.billingCycle}`}>
              <Zoom in timeout={300}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    boxShadow: selected
                      ? "0 16px 40px rgba(13,71,161,0.28)"
                      : isCurrent
                        ? "0 12px 32px rgba(13,71,161,0.25)"
                        : "0 8px 24px rgba(13,71,161,0.08)",
                    border: selected
                      ? `3px solid ${color}`
                      : isCurrent
                        ? `2px solid ${color}`
                        : isPopular
                          ? "2px solid #7b1fa2"
                          : "1px solid #e3f2fd",
                    transition: "all 0.3s ease",
                    "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 48px rgba(13,71,161,0.2)" },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {/* Popular Banner */}
                  {isPopular && !isCurrent && !selected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: -40,
                        bgcolor: '#7b1fa2',
                        color: 'white',
                        transform: 'rotate(45deg)',
                        px: 5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        zIndex: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      POPULAR
                    </Box>
                  )}

                  {/* Selected Indicator */}
                  {selected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 1,
                      }}
                    >
                      <Avatar sx={{ bgcolor: color, width: 32, height: 32 }}>
                        <Check sx={{ fontSize: 20 }} />
                      </Avatar>
                    </Box>
                  )}

                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Box sx={{ color, display: "flex", justifyContent: "center", mb: 2 }}>
                        {planIcon(index)}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#333' }}>
                        {plan.name}
                      </Typography>
                      <Chip
                        icon={<Schedule sx={{ fontSize: 14 }} />}
                        label={plan.billingCycle || "Monthly"}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1, fontWeight: 600, borderColor: color, color }}
                      />
                    </Box>

                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h2" sx={{ fontWeight: 800, color }}>
                        ₹{plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {plan.billingCycle === "Yearly"
                          ? "per year"
                          : plan.billingCycle === "Half-Yearly"
                            ? "for 6 months"
                            : `for ${plan.durationDays || 30} days`}
                      </Typography>
                      {(plan.billingCycle === "Yearly" || plan.billingCycle === "Half-Yearly") && (
                        <Chip
                          label={`Save ₹${((plans.find((p) => p.billingCycle === "Monthly")?.price || 0) * (plan.billingCycle === "Yearly" ? 12 : 6) - plan.price).toLocaleString()}`}
                          color="success"
                          size="small"
                          sx={{ mt: 1, fontWeight: 700 }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={2}>
                      {(plan.features || []).map((feature, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ fontSize: 20, color: "success.main", mt: 0.2 }} />
                          <Typography variant="body2" fontWeight={500} color="text.primary">
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={isCurrent ? "outlined" : selected ? "contained" : "outlined"}
                      color={isPopular && !isCurrent ? "secondary" : "primary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 800,
                        fontSize: '1rem',
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        }
                      }}
                    >
                      {isCurrent ? "Extend Plan" : selected ? "Selected ✓" : "Choose Plan"}
                    </Button>
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <Fade in timeout={400}>
          <Paper
            elevation={4}
            sx={{
              mt: 6,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: "2px solid #0d47a1",
              bgcolor: "#f8fbff",
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', bgcolor: 'rgba(13, 71, 161, 0.05)' }} />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                    {planIcon(visiblePlans.indexOf(selectedPlan))}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="#0d47a1">
                      {selectedPlan.name} Plan
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      {selectedPlan.billingCycle} Subscription
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      ₹{selectedPlan.price}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleContinueToPayment}
                  size="large"
                  startIcon={<Payment />}
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    px: 5,
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    boxShadow: "0 8px 24px rgba(13,71,161,0.25)",
                    textTransform: 'none',
                  }}
                >
                  Proceed to Pay
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Shield sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  100% Secure Payment • Instant Activation
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Features Comparison Section */}
      <Paper
        elevation={0}
        sx={{
          mt: 8,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          bgcolor: '#fafafa',
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 1, color: '#0d47a1' }}>
          Compare Features
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          All plans include essential features to manage your practice
        </Typography>

        <Grid container spacing={3}>
          {[
            { icon: <EventAvailable />, title: "Patient Booking", desc: "Online appointment booking" },
            { icon: <CloudDone />, title: "Cloud Records", desc: "Secure patient data storage" },
            { icon: <Speed />, title: "Fast Access", desc: "Quick dashboard performance" },
            { icon: <Support />, title: "24/7 Support", desc: "Dedicated customer support" },
            { icon: <Security />, title: "Data Security", desc: "End-to-end encryption" },
            { icon: <TrendingUp />, title: "Search Boost", desc: "Higher patient visibility" },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e3f2fd', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: '#e3f2fd', color: 'primary.main', mb: 2, width: 56, height: 56 }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentOpen}
        onClose={() => {
          if (!processing) setPaymentOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
          }
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              Complete Payment
            </Typography>
            <IconButton onClick={() => setPaymentOpen(false)} disabled={processing}>
              <Close />
            </IconButton>
          </Stack>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Choose Payment Method */}
          {activeStep === 0 && (
            <Box>
              <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 3, mb: 3, border: '1px solid #e3f2fd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      ₹{selectedPlan?.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {selectedPlan?.name} Plan • {selectedPlan?.billingCycle}
                    </Typography>
                  </Box>
                  <Chip label="Secure" color="success" icon={<Shield sx={{ fontSize: 16 }} />} />
                </Stack>
              </Box>

              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, color: '#333' }}>
                Select Payment Method
              </Typography>

              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    borderColor: paymentMethod === "QR Code" ? "#0d47a1" : "#e0e0e0",
                    bgcolor: paymentMethod === "QR Code" ? "#f4f9ff" : "transparent",
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#0d47a1' },
                  }}
                >
                  <FormControlLabel
                    value="QR Code"
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <QrCode2 sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>Scan QR Code</Typography>
                          <Typography variant="caption" color="text.secondary">Pay instantly with any UPI app</Typography>
                        </Box>
                      </Stack>
                    }
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    borderColor: paymentMethod === "UPI" ? "#0d47a1" : "#e0e0e0",
                    bgcolor: paymentMethod === "UPI" ? "#f4f9ff" : "transparent",
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#0d47a1' },
                  }}
                >
                  <FormControlLabel
                    value="UPI"
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <AccountBalanceWallet sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>UPI ID</Typography>
                          <Typography variant="caption" color="text.secondary">Enter your VPA manually</Typography>
                        </Box>
                      </Stack>
                    }
                  />
                  {paymentMethod === "UPI" && (
                    <Box sx={{ ml: 5, mt: 1.5 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="yourname@upi"
                        value={paymentDetails.upiId}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Box>
                  )}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2,
                    borderColor: paymentMethod === "Card" ? "#0d47a1" : "#e0e0e0",
                    bgcolor: paymentMethod === "Card" ? "#f4f9ff" : "transparent",
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#0d47a1' },
                  }}
                >
                  <FormControlLabel
                    value="Card"
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CreditCard sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>Debit / Credit Card</Typography>
                          <Typography variant="caption" color="text.secondary">Visa, Mastercard, RuPay, Amex</Typography>
                        </Box>
                      </Stack>
                    }
                  />
                  {paymentMethod === "Card" && (
                    <Box sx={{ ml: 5, mt: 2 }}>
                      <Stack spacing={1.5}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Card Number"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Name on Card"
                          value={paymentDetails.cardName}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                        <Stack direction="row" spacing={1.5}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="MM/YY"
                            value={paymentDetails.cardExpiry}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            type="password"
                            placeholder="CVV"
                            value={paymentDetails.cardCvv}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </RadioGroup>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForward />}
                  onClick={handleValidateStep1}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(13,71,161,0.2)',
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 1: Review & Pay */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 3, mb: 3, border: '1px solid #e3f2fd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mb: 2 }}>
                  Payment Summary
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Plan</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedPlan?.name} ({selectedPlan?.billingCycle})</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Payment Method</Typography>
                    <Typography variant="body2" fontWeight={700}>{paymentMethod}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" fontWeight={800}>Total Payable</Typography>
                    <Typography variant="h4" color="primary.main" fontWeight={800}>₹{selectedPlan?.price}</Typography>
                  </Stack>
                </Stack>
              </Box>

              {paymentMethod === "QR Code" && (
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="body1" fontWeight={800} sx={{ mb: 2, color: '#333' }}>
                    Scan using any UPI App
                  </Typography>
                  <Box sx={{ display: "inline-block", p: 2, bgcolor: "white", border: "2px solid #e3f2fd", borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=Docify@upi%26pn=Docify%26am=${selectedPlan?.price}%26cu=INR`}
                      alt="UPI QR Code"
                      width="180"
                      height="180"
                    />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
                    Waiting for payment confirmation...
                  </Typography>
                </Box>
              )}

              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={600}>
                  This is a simulated payment for testing. If you have an active trial, this plan will automatically queue up to begin after it ends.
                </Typography>
              </Alert>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => setActiveStep(0)}
                  disabled={processing}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProcessPayment}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={18} color="inherit" /> : paymentMethod === "QR Code" ? <CheckCircle /> : <Lock />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(13,71,161,0.2)',
                  }}
                >
                  {processing ? "Processing..." : paymentMethod === "QR Code" ? "I have paid" : `Pay ₹${selectedPlan?.price}`}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Success */}
          {activeStep === 2 && paymentDone && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: '#e8f5e9', color: 'success.main' }}>
                  <CheckCircle sx={{ fontSize: 60 }} />
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check sx={{ fontSize: 18, color: 'white' }} />
                </Box>
              </Box>

              <Typography variant="h4" fontWeight={800} color="#333" sx={{ mb: 1 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, px: 2, fontWeight: 500 }}>
                Your {selectedPlan?.name} subscription has been secured. Your profile is now boosted in patient search results.
              </Typography>

              <Paper variant="outlined" sx={{ p: 3, mt: 4, bgcolor: "white", borderRadius: 3, textAlign: 'left', border: '1px solid #e3f2fd' }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Plan Purchased</Typography>
                    <Typography variant="body2" fontWeight={800}>{selectedPlan?.name}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Amount Paid</Typography>
                    <Typography variant="body2" fontWeight={800}>₹{selectedPlan?.price}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Transaction Ref</Typography>
                    <Typography variant="body2" fontWeight={800} color="primary.main">{paymentReference}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body1" color="error.main" fontWeight={700}>Valid Until</Typography>
                    <Typography variant="body1" fontWeight={800} color="error.main">
                      {formatDate(currentSubscription?.expiryDate)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none' }}
                  onClick={() => setPaymentOpen(false)}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none' }}
                  onClick={() => {
                    setPaymentOpen(false);
                    window.print();
                  }}
                >
                  Download Receipt
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPlan;