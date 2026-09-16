const isFutureDate = (value, now = new Date()) =>
  value && new Date(value).getTime() > now.getTime();

const isDoctorBookable = (doctor, now = new Date()) => {
  if (!doctor || doctor.status !== "approved" || doctor.adminApproved !== true) {
    return false;
  }

  if (doctor.subscriptionStatus === "Active") {
    return isFutureDate(doctor.expiryDate || doctor.subscriptionExpiry, now);
  }

  return doctor.subscriptionStatus === "Trial" && isFutureDate(doctor.trialEndsAt, now);
};

const bookableDoctorQuery = (now = new Date()) => ({
  status: "approved",
  adminApproved: true,
  $or: [
    {
      subscriptionStatus: "Active",
      $or: [
        { expiryDate: { $gt: now } },
        { subscriptionExpiry: { $gt: now } },
      ],
    },
    { subscriptionStatus: "Trial", trialEndsAt: { $gt: now } },
  ],
});

module.exports = { isDoctorBookable, bookableDoctorQuery };