const doctorMiddleware = (req, res, next) => {
  const role = (req.user?.role || "").toLowerCase();

  if (role !== "doctor" || req.user?.isAdmin) {
    return res.status(403).json({ msg: "Doctor access is required" });
  }

  return next();
};

module.exports = doctorMiddleware;