const adminMiddleware = async (req, res, next) => {
  try {
console.log(req.user);
    const adminrole = req.user.isAdmin || (req.user.role || "").toLowerCase() === "admin";
    if (!adminrole) {
      return res.status(400).json({ msg: "Access denied user is not admin" });
    }
    // res.status(200).json({msg:req.user.isAdmin});
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = adminMiddleware;
