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
} from "@mui/icons-material";
import { useAuth } from "../../store/auth";

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
      const response = await fetch(
        "http://localhost:3000/api/doctorform/plans",
        { method: "GET" }
      );
      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/doctorform/subscription/mine",
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
        "http://localhost:3000/api/doctorform/subscription/status",
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

  const handleActivateTrial = async () => {
    setTrialLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        "http://localhost:3000/api/doctorform/subscription/trial",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
        }
      );
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

  useEffect(() => {
    fetchPlans();
    fetchMySubscription();
    fetchSubscriptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show all plans side-by-side (Monthly + Yearly cards)
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

  // Simulated payment (bypasses Razorpay for testing)
  const handleProcessPayment = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    setMessage("");
    try {
      // Simulate a short processing delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Simulated success - activate subscription directly via enroll endpoint
      const response = await fetch(
        "http://localhost:3000/api/doctorform/subscription/enroll",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationtoken,
          },
          body: JSON.stringify({
            plan: selectedPlan.name,
            paymentMethod,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        const ref = `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setPaymentReference(ref);
        setCurrentSubscription(data.subscription);
        setMessageType("success");
        setMessage(data.msg || "Subscription activated successfully!");
        setPaymentDone(true);
        setActiveStep(2);
        await fetchSubscriptionStatus();
      } else {
        setMessageType("error");
        setMessage(data.msg || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessageType("error");
      setMessage("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const steps = ["Choose Payment Method", "Enter Details", "Payment Confirmed"];

  const planIcon = (index) => {
    const icons = [
      <Verified key="m" sx={{ fontSize: 48 }} />,
      <WorkspacePremium key="y" sx={{ fontSize: 48 }} />,
    ];
    return icons[index] || <Star sx={{ fontSize: 48 }} />;
  };

  const planColors = ["#1976d2", "#7b1fa2"];

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
          mb: 3,
          background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, opacity: 0.95 }}>
          Activate your plan to appear in patient search and enable online
          booking. Payments are simulated for testing.
        </Typography>
      </Paper>

      {/* Free Trial Banner */}
      {trialActive && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="primary" size="small" onClick={() => {}}>
              View Plans
            </Button>
          }
        >
          You are on a <strong>14-day free trial</strong>. Trial started on{" "}
          <strong>
            {trialStartDate ? new Date(trialStartDate).toLocaleDateString() : "N/A"}
          </strong>{" "}
          and ends on{" "}
          <strong>
            {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : "N/A"}
          </strong>
          . Subscribe to continue using premium features after the trial.
        </Alert>
      )}

      {/* Trial expired banner */}
      {subscriptionStatus === "TrialExpired" && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Your free trial has ended. Please subscribe to continue using
          premium features.
        </Alert>
      )}

      {!trialActive &&
        subscriptionStatus !== "Active" &&
        subscriptionStatus !== "Trial" &&
        subscriptionStatus !== "TrialExpired" && (
          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="primary"
                size="small"
                onClick={handleActivateTrial}
                disabled={trialLoading}
              >
                {trialLoading ? "Activating..." : "Start Free Trial"}
              </Button>
            }
          >
            New here? Start a <strong>14-day free trial</strong> and explore all
            features before subscribing.
          </Alert>
        )}

      {currentSubscription && currentSubscription.status === "Active" && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Your <strong>{currentSubscription.plan}</strong> plan is active until{" "}
          <strong>
            {currentSubscription.expiryDate
              ? new Date(currentSubscription.expiryDate).toLocaleDateString()
              : "N/A"}
          </strong>
          . Reference: {currentSubscription.paymentReference || "N/A"}
        </Alert>
      )}

      {message && (
        <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* Plan Cards - side by side (Monthly + Yearly) */}
      <Grid container spacing={3}>
        {visiblePlans.map((plan, index) => {
          const color = planColors[index] || "#1976d2";
          const isCurrent = isCurrentPlan(plan);
          const isPopular = plan.popular || plan.billingCycle === "Yearly";
          const selected = isSelected(plan);
          return (
            <Grid item xs={12} md={6} key={`${plan.name}-${plan.billingCycle}`}>
              <Zoom in timeout={300}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    position: "relative",
                    cursor: "pointer",
                    boxShadow: selected
                      ? "0 16px 40px rgba(13,71,161,0.28)"
                      : isCurrent
                      ? "0 12px 32px rgba(13,71,161,0.25)"
                      : "0 8px 24px rgba(13,71,161,0.1)",
                    border: selected
                      ? `3px solid ${color}`
                      : isCurrent
                      ? `2px solid ${color}`
                      : isPopular
                      ? "2px solid #7b1fa2"
                      : "1px solid #e3f2fd",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {selected && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        bgcolor: color,
                        color: "white",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 20 }} />
                    </Box>
                  )}
                  {isPopular && !isCurrent && !selected && (
                    <Chip
                      label="Most Popular"
                      color="secondary"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 16,
                        fontWeight: 700,
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Box sx={{ color, display: "flex", justifyContent: "center" }}>
                        {planIcon(index)}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                        {plan.name}
                      </Typography>
                      <Chip
                        icon={<Schedule sx={{ fontSize: 14 }} />}
                        label={plan.billingCycle || "Monthly"}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800, color }}>
                        ₹{plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.billingCycle === "Yearly"
                          ? "per year"
                          : `for ${plan.durationDays} days`}
                      </Typography>
                      {plan.billingCycle === "Yearly" && (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                          You save ₹
                          {(
                            (plans.find((p) => p.billingCycle === "Monthly")?.price || 0) *
                              12 -
                            plan.price
                          ).toLocaleString()}{" "}
                          vs monthly
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      {(plan.features || []).map((feature, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <CheckCircle sx={{ fontSize: 18, color: "success.main" }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    {isCurrent && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Current Plan"
                        color="success"
                        sx={{ mt: 2, width: "100%" }}
                      />
                    )}
                  </CardContent>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={isCurrent ? "outlined" : selected ? "contained" : "outlined"}
                      color={isPopular && !isCurrent ? "secondary" : "primary"}
                      disabled={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                      sx={{ borderRadius: 2, py: 1.2, fontWeight: 700 }}
                    >
                      {isCurrent ? "Active" : selected ? "Selected ✓" : "Select Plan"}
                    </Button>
                  </Box>
                </Card>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Plan Summary / Continue */}
      {selectedPlan && (
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "2px solid #0d47a1",
              bgcolor: "#f8fbff",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
              <Box sx={{ color: "primary.main" }}>{planIcon(visiblePlans.indexOf(selectedPlan))}</Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {selectedPlan.name} Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPlan.billingCycle} • ₹{selectedPlan.price}{" "}
                  {selectedPlan.billingCycle === "Yearly"
                    ? "/ year"
                    : `for ${selectedPlan.durationDays} days`}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Bolt />}
                onClick={() => handleContinueToPayment()}
                sx={{ borderRadius: 2, py: 1, px: 2.5, fontWeight: 700 }}
              >
                Continue to Payment
              </Button>
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
      >
        <DialogContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Choose payment method */}
          {activeStep === 0 && (
            <Box>
              <Box sx={{ p: 2, bgcolor: "#f8fbff", borderRadius: 2, mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                  ₹{selectedPlan?.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPlan?.name} Plan • {selectedPlan?.billingCycle} subscription
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Select Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    borderColor: paymentMethod === "UPI" ? "#0d47a1" : "inherit",
                  }}
                >
                  <FormControlLabel
                    value="UPI"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccountBalanceWallet sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            UPI
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            GPay, PhonePe, Paytm & more
                          </Typography>
                        </Box>
                      </Stack>
                    }
                  />
                  {paymentMethod === "UPI" && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Enter your UPI ID:
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="yourname@upi"
                        value={paymentDetails.upiId}
                        onChange={(e) =>
                          setPaymentDetails({ ...paymentDetails, upiId: e.target.value })
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    borderColor: paymentMethod === "Card" ? "#0d47a1" : "inherit",
                  }}
                >
                  <FormControlLabel
                    value="Card"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CreditCard sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Debit / Credit Card
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visa, Mastercard, RuPay, Amex
                          </Typography>
                        </Box>
                      </Stack>
                    }
                  />
                  {paymentMethod === "Card" && (
                    <Box sx={{ ml: 4, mt: 1 }}>
                      <Stack spacing={1.5}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Card Number"
                          value={paymentDetails.cardNumber}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Name on Card"
                          value={paymentDetails.cardName}
                          onChange={(e) =>
                            setPaymentDetails({ ...paymentDetails, cardName: e.target.value })
                          }
                        />
                        <Stack direction="row" spacing={1.5}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="MM/YY"
                            value={paymentDetails.cardExpiry}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })
                            }
                          />
                          <TextField
                            fullWidth
                            size="small"
                            type="password"
                            placeholder="CVV"
                            value={paymentDetails.cardCvv}
                            onChange={(e) =>
                              setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })
                            }
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: paymentMethod === "NetBanking" ? "#0d47a1" : "inherit",
                  }}
                >
                  <FormControlLabel
                    value="NetBanking"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Payment sx={{ color: "#0d47a1" }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Net Banking
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            All major banks
                          </Typography>
                        </Box>
                      </Stack>
                    }
                  />
                </Paper>
              </RadioGroup>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForward />}
                  onClick={handleValidateStep1}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 1: Review & Pay */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ p: 2, bgcolor: "#f8fbff", borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Payment Summary
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedPlan?.name} ({selectedPlan?.billingCycle})
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {paymentMethod}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700}>
                      Total Payable
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={800}>
                      ₹{selectedPlan?.price}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Shield sx={{ fontSize: 18, color: "success.main" }} />
                <Typography variant="caption" color="text.secondary">
                  This is a simulated payment for testing purposes. The
                  subscription will be activated immediately.
                </Typography>
              </Stack>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => setActiveStep(0)}
                  disabled={processing}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProcessPayment}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <Lock />}
                >
                  {processing ? "Processing..." : `Pay ₹${selectedPlan?.price}`}
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Success */}
          {activeStep === 2 && paymentDone && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CheckCircle sx={{ fontSize: 80, color: "success.main" }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 2 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Your {selectedPlan?.name} subscription has been activated. You are
                now listed on Find Doctors and can receive appointments.
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, mt: 2, bgcolor: "#f8fbff", borderRadius: 2 }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedPlan?.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ₹{selectedPlan?.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Reference
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {paymentReference}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Valid Until
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {currentSubscription?.expiryDate
                        ? new Date(currentSubscription.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => setPaymentOpen(false)}
              >
                Done
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPlan;
