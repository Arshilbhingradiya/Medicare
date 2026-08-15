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

  // =====================================================================
  // TRIAL ACTIVATION LOGIC
  // =====================================================================

  /*
  // 🟢 PRODUCTION CODE: REAL BACKEND TRIAL ACTIVATION
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
  */

  // 🔴 DUMMY TEST CODE: SIMULATED TRIAL ACTIVATION
  const handleActivateTrial = async () => {
    setTrialLoading(true);
    setMessage("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const now = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(now.getDate() + 14);

      setTrialActive(true);
      setTrialStartDate(now.toISOString());
      setTrialEndsAt(trialEnd.toISOString());
      setSubscriptionStatus("Trial");
      setMessageType("success");
      setMessage("Dummy 14-Day Free Trial activated successfully!");
    } catch (error) {
      console.error("Trial error:", error);
      setMessageType("error");
      setMessage("Failed to activate trial.");
    } finally {
      setTrialLoading(false);
    }
  };

  // =====================================================================
  // PAYMENT PROCESSING LOGIC
  // =====================================================================

  /*
  // 🟢 PRODUCTION CODE: REAL RAZORPAY INTEGRATION
  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setMessage("");

    try {
      const orderRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationtoken,
        },
        body: JSON.stringify({ amount: selectedPlan.price, planName: selectedPlan.name }),
      });
      
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Order creation failed");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Medicare Subscription",
        description: `${selectedPlan.name} Plan`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${API_URL}/api/razorpay/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authorizationtoken,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: selectedPlan.name,
              billingCycle: selectedPlan.billingCycle 
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setMessageType("success");
            setMessage("Subscription activated successfully! Database updated.");
            await fetchSubscriptionStatus(); 
          } else {
            setMessageType("error");
            setMessage("Payment verification failed.");
          }
        },
        theme: { color: "#0d47a1" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment error:", error);
      setMessageType("error");
      setMessage("Payment initiation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  */

  // 🔴 DUMMY TEST CODE: PURE UI SIMULATION
  // const handleProcessPayment = async () => {
  //   if (!selectedPlan) return;
  //   setProcessing(true);
  //   setMessage("");

  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     const ref = `DUMMY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
  //     let baseDate = new Date();
  //     if (currentSubscription && currentSubscription.expiryDate) {
  //       const currentExpiry = new Date(currentSubscription.expiryDate);
  //       if (currentExpiry > baseDate) {
  //         baseDate = currentExpiry; 
  //       }
  //     } else if (trialActive && trialEndsAt) {
  //       const currentTrialEnd = new Date(trialEndsAt);
  //       if (currentTrialEnd > baseDate) {
  //         baseDate = currentTrialEnd;
  //       }
  //     }

  //     const dummyExpiry = new Date(baseDate);
  //     if (selectedPlan.billingCycle === "Yearly") {
  //       dummyExpiry.setFullYear(dummyExpiry.getFullYear() + 1);
  //     } else if (selectedPlan.billingCycle === "Half-Yearly") {
  //       dummyExpiry.setMonth(dummyExpiry.getMonth() + 6);
  //     } else {
  //       dummyExpiry.setMonth(dummyExpiry.getMonth() + 1);
  //     }

  //     setPaymentReference(ref);
  //     setCurrentSubscription({
  //       plan: selectedPlan.name,
  //       status: "Active",
  //       startDate: new Date().toISOString(),
  //       expiryDate: dummyExpiry.toISOString(),
  //       paymentReference: ref,
  //     });

  //     setSubscriptionStatus("Active");
  //     setMessageType("success");
  //     setMessage(`Subscription activated successfully!`);
  //     setPaymentDone(true);
  //     setActiveStep(2);
  //   } catch (error) {
  //     console.error("Payment error:", error);
  //     setMessageType("error");
  //     setMessage("Payment failed. Please try again.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };
  // 🟢 REAL BACKEND INTEGRATION
  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setMessage("");

    try {
      // 1. Call your backend enrollSubscription controller
      const response = await fetch(`${API_URL}/api/doctorform/subscription/enroll`, { // Make sure this matches your actual backend route!
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

      // 2. Handle successful backend response
      if (response.ok) {
        // Update UI state with the real data returned from your database
        setPaymentReference(data.subscription.paymentReference);
        setCurrentSubscription(data.subscription);
        setSubscriptionStatus(data.subscription.status);

        setMessageType("success");
        setMessage("Subscription activated successfully!");
        setPaymentDone(true);
        setActiveStep(2);

        // 3. Re-fetch data to ensure everything is perfectly in sync
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
  // =====================================================================

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          mb: 4,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          color: "white",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(13, 71, 161, 0.2)"
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Manage Your Subscription
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.95 }}>
          Activate or extend your plan to appear in patient search results and receive online bookings.
        </Typography>
      </Paper>

      {/* ====================================================================== */}
      {/* PROFESSIONAL ACTIVE SUBSCRIPTION DASHBOARD WIDGET */}
      {/* ====================================================================== */}
      {currentSubscription && currentSubscription.status === "Active" && (
        <Fade in timeout={500}>
          <Paper
            elevation={3}
            sx={{
              mb: 5,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e0e0e0",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                bgcolor: "#0d47a1",
                color: "white",
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <WorkspacePremium sx={{ fontSize: 32, color: "#ffd54f" }} />
                <Typography variant="h5" fontWeight={800}>
                  Active Subscription
                </Typography>
              </Stack>
              <Chip
                label="LIVE & ACTIVE"
                color="success"
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "#fff",
                      borderRadius: "50%",
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.7)" },
                        "70%": { boxShadow: "0 0 0 6px rgba(255, 255, 255, 0)" },
                        "100%": { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)" },
                      },
                    }}
                  />
                }
                sx={{
                  bgcolor: "#2e7d32",
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  px: 1,
                  "& .MuiChip-icon": { ml: 1 },
                }}
              />
            </Box>

            {/* Content Data Section */}
            <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#fafafa" }}>
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
                        {currentSubscription.startDate
                          ? new Date(currentSubscription.startDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                          : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
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
                        {currentSubscription.expiryDate
                          ? new Date(currentSubscription.expiryDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
                          : "N/A"}
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
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Free Trial Banners */}
      {trialActive && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2, border: '1px solid #90caf9' }}>
          You are on a <strong>14-day free trial</strong>. Trial started on{" "}
          <strong>{trialStartDate ? new Date(trialStartDate).toLocaleDateString() : "N/A"}</strong>{" "}
          and ends on{" "}
          <strong>{trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "N/A"}</strong>
          . Purchasing a subscription now will automatically activate <strong>after</strong> your trial ends!
        </Alert>
      )}

      {subscriptionStatus === "TrialExpired" && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2, border: '1px solid #ffcc80' }}>
          Your free trial has ended. Please subscribe to continue using premium features.
        </Alert>
      )}

      {!trialActive &&
        subscriptionStatus !== "Active" &&
        subscriptionStatus !== "Trial" &&
        subscriptionStatus !== "TrialExpired" && (
          <Alert
            severity="info"
            sx={{ mb: 4, borderRadius: 2, border: '1px solid #90caf9' }}
            action={
              <Button color="primary" variant="contained" size="small" onClick={handleActivateTrial} disabled={trialLoading} sx={{ fontWeight: 'bold' }}>
                {trialLoading ? "Activating..." : "Start 14-Day Free Trial"}
              </Button>
            }
          >
            New here? Explore all premium features before committing to a paid plan.
          </Alert>
        )}

      {message && (
        <Alert severity={messageType} sx={{ mb: 4, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Plan Cards */}
      <Typography variant="h5" fontWeight={800} align="center" sx={{ mb: 3, color: '#333' }}>
        Select a Plan to Extend or Upgrade
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
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
                    overflow: "hidden", // Ensures inner components don't break the rounded corners
                    boxShadow: selected
                      ? "0 16px 40px rgba(13,71,161,0.28)"
                      : isCurrent
                      ? "0 12px 32px rgba(13,71,161,0.25)"
                      : "0 8px 24px rgba(13,71,161,0.08)",
                    border: selected ? `3px solid ${color}` : isCurrent ? `2px solid ${color}` : isPopular ? "2px solid #7b1fa2" : "1px solid #e3f2fd",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-6px)" },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {/* PERFECTLY FITTED "MOST POPULAR" BANNER */}
                  {isPopular && !isCurrent && !selected && (
                    <Box
                      sx={{
                        width: '100%',
                        bgcolor: 'secondary.main',
                        color: 'white',
                        textAlign: 'center',
                        py: 0.75,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase'
                      }}
                    >
                      Most Popular
                    </Box>
                  )}

                  {/* PERFECTLY FITTED SELECTED INDICATOR */}
                  {selected && (
                    <Box
                      sx={{
                        width: '100%',
                        bgcolor: color,
                        color: 'white',
                        textAlign: 'center',
                        py: 0.75,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 16 }} /> SELECTED
                    </Box>
                  )}

                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Box sx={{ color, display: "flex", justifyContent: "center", mb: 1 }}>{planIcon(index)}</Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{plan.name}</Typography>
                      <Chip icon={<Schedule sx={{ fontSize: 14 }} />} label={plan.billingCycle || "Monthly"} size="small" variant="outlined" sx={{ mt: 1, fontWeight: 600 }} />
                    </Box>

                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color }}>₹{plan.price}</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {plan.billingCycle === "Yearly" ? "per year" : plan.billingCycle === "Half-Yearly" ? "for 6 months" : `for ${plan.durationDays || 30} days`}
                      </Typography>
                      {(plan.billingCycle === "Yearly" || plan.billingCycle === "Half-Yearly") && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, mt: 1, display: 'block' }}>
                          Save ₹{((plans.find((p) => p.billingCycle === "Monthly")?.price || 0) * (plan.billingCycle === "Yearly" ? 12 : 6) - plan.price).toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={2}>
                      {(plan.features || []).map((feature, i) => (
                        <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircle sx={{ fontSize: 20, color: "success.main", mt: 0.2 }} />
                          <Typography variant="body2" fontWeight={500} color="text.primary">{feature}</Typography>
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
                      sx={{ borderRadius: 2, py: 1.5, fontWeight: 800, fontSize: '1rem' }}
                    >
                      {isCurrent ? "Extend This Plan" : selected ? "Selected" : "Choose Plan"}
                    </Button>
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Plan Summary & Direct Payment Trigger */}
      {selectedPlan && (
        <Fade in timeout={400}>
          <Paper
            elevation={4}
            sx={{
              mt: 6, p: { xs: 3, md: 4 }, borderRadius: 4, border: "2px solid #0d47a1", bgcolor: "#f8fbff", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between", gap: 3,
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Box sx={{ color: "primary.main", bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                {planIcon(visiblePlans.indexOf(selectedPlan))}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0d47a1' }}>{selectedPlan.name} Plan Checkout</Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                  {selectedPlan.billingCycle} Subscription • Total: <Typography component="span" color="primary.main" fontWeight={800}>₹{selectedPlan.price}</Typography>
                </Typography>
              </Box>
            </Stack>
            
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column", alignItems: { xs: "stretch", md: "flex-end" } }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleContinueToPayment}
                size="large"
                sx={{ borderRadius: 3, py: 1.5, px: 5, fontWeight: 800, fontSize: "1.1rem", boxShadow: "0 8px 24px rgba(13,71,161,0.25)" }}
              >
                Proceed to Pay
              </Button>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Shield sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Secured by Razorpay Integration
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Payment Dialog */}
      <Dialog
        open={paymentOpen}
        onClose={() => {
          if (!processing) setPaymentOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Choose payment method */}
          {activeStep === 0 && (
            <Box>
              <Box sx={{ p: 3, bgcolor: "#f8fbff", borderRadius: 3, mb: 3, border: '1px solid #e3f2fd' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}>
                  ₹{selectedPlan?.price}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {selectedPlan?.name} Plan • {selectedPlan?.billingCycle} subscription
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#333' }}>
                Select Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 1.5, borderRadius: 2, borderColor: paymentMethod === "QR Code" ? "#0d47a1" : "#e0e0e0", bgcolor: paymentMethod === "QR Code" ? "#f4f9ff" : "transparent" }}
                >
                  <FormControlLabel
                    value="QR Code"
                    control={<Radio />}
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
                  sx={{ p: 2, mb: 1.5, borderRadius: 2, borderColor: paymentMethod === "UPI" ? "#0d47a1" : "#e0e0e0", bgcolor: paymentMethod === "UPI" ? "#f4f9ff" : "transparent" }}
                >
                  <FormControlLabel
                    value="UPI"
                    control={<Radio />}
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
                      <TextField fullWidth size="small" placeholder="yourname@upi" value={paymentDetails.upiId} onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })} />
                    </Box>
                  )}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ p: 2, mb: 1.5, borderRadius: 2, borderColor: paymentMethod === "Card" ? "#0d47a1" : "#e0e0e0", bgcolor: paymentMethod === "Card" ? "#f4f9ff" : "transparent" }}
                >
                  <FormControlLabel
                    value="Card"
                    control={<Radio />}
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
                        <TextField fullWidth size="small" placeholder="Card Number" value={paymentDetails.cardNumber} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })} />
                        <TextField fullWidth size="small" placeholder="Name on Card" value={paymentDetails.cardName} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })} />
                        <Stack direction="row" spacing={1.5}>
                          <TextField fullWidth size="small" placeholder="MM/YY" value={paymentDetails.cardExpiry} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })} />
                          <TextField fullWidth size="small" type="password" placeholder="CVV" value={paymentDetails.cardCvv} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })} />
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </RadioGroup>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button variant="contained" color="primary" endIcon={<ArrowForward />} onClick={handleValidateStep1} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}>
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 1: Review & Pay */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ p: 3, bgcolor: "#f8fbff", borderRadius: 3, mb: 3, border: '1px solid #e3f2fd' }}>
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
                    <Typography variant="h5" color="primary.main" fontWeight={800}>₹{selectedPlan?.price}</Typography>
                  </Stack>
                </Stack>
              </Box>

              {paymentMethod === "QR Code" && (
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="body1" fontWeight={800} sx={{ mb: 2, color: '#333' }}>
                    Scan using any UPI App
                  </Typography>
                  <Box sx={{ display: "inline-block", p: 2, bgcolor: "white", border: "2px solid #e0e0e0", borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=medicare@upi%26pn=Medicare%26am=${selectedPlan?.price}%26cu=INR`} alt="UPI QR Code" width="180" height="180" />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
                    Waiting for payment confirmation...
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3, p: 2, bgcolor: '#f1f8e9', borderRadius: 2 }}>
                <Shield sx={{ fontSize: 20, color: "success.main" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  This is a simulated payment for testing purposes. If you have an active trial, this plan will automatically queue up to begin after it ends.
                </Typography>
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => setActiveStep(0)} disabled={processing} sx={{ fontWeight: 700 }}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleProcessPayment} disabled={processing} startIcon={processing ? <CircularProgress size={18} color="inherit" /> : paymentMethod === "QR Code" ? <CheckCircle /> : <Lock />} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}>
                  {processing ? "Processing..." : paymentMethod === "QR Code" ? "I have paid" : `Pay ₹${selectedPlan?.price}`}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Success */}
          {activeStep === 2 && paymentDone && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CheckCircle sx={{ fontSize: 90, color: "success.main", mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#333' }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, px: 2, fontWeight: 500 }}>
                Your {selectedPlan?.name} subscription has been secured. Your profile is now boosted in patient search results.
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, mt: 4, bgcolor: "#fafafa", borderRadius: 3, textAlign: 'left' }}>
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
                      {currentSubscription?.expiryDate ? new Date(currentSubscription.expiryDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
              <Button variant="contained" color="primary" sx={{ mt: 4, px: 6, py: 1.5, borderRadius: 3, fontWeight: 800 }} onClick={() => setPaymentOpen(false)}>
                Go to Dashboard
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPlan;