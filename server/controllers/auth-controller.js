const bcrypt = require("bcryptjs");
const User = require("../models/user-model");
const Doctor = require("../models/Doctor-model");

const normalizeRole = (role) => {
  const normalizedRole = role?.trim().toLowerCase();

  if (normalizedRole === "doctor") return "Doctor";
  if (normalizedRole === "patient") return "Patient";
  if (normalizedRole === "admin") return "Admin";

  return "";
};

const home = async (req, res) => {
  try {
    res.status(200).send("welcome my website using router");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { username, email, phone, password, role, specialization, experience, fees } = req.body;

    // Normalize email and role
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = normalizeRole(role) || "Patient";

    // 1. Check if user already exists
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(password, salt);

    // 2. Create base User record
    const userCreated = await User.create({
      username: username?.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hash_password,
      role: normalizedRole
    });

    // 3. Auto-create a Doctor profile when a user registers as a Doctor
    if (normalizedRole === "Doctor") {
      try {
        await Doctor.create({
          userId: userCreated._id,
          name: username?.trim() || userCreated.username || "New Doctor",
          email: normalizedEmail,
          phone: String(phone || "").trim(),
          specialization: specialization || "General Physician",
          experience: experience || 0,
          fees: fees || 500,
          clinicAddress: "Not Provided",
          city: "Not Provided",
          subscriptionPlan: "Free",
          subscriptionStatus: "Free",
          isVerified: true
        });
      } catch (docError) {
        console.error("Doctor profile auto-creation failed:", docError.message);
        // We do NOT throw an error here, so the user registration still succeeds!
      }
    }

    // 4. Generate JWT Token safely
    let token = "";
    if (typeof userCreated.generateToken === 'function') {
      token = await userCreated.generateToken();
    }

    return res.status(201).json({
      message: "Registration successfully",
      token: token,
      userId: userCreated._id.toString(),
      role: userCreated.role
    });

  } catch (error) {
    console.error("Registration Server Error:", error);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return res.status(400).json({ msg: "Please select a valid role" });
    }

    // First try to match the exact role selected in the form
    let userExist = await User.findOne({
      email: email?.trim().toLowerCase(),
      role: normalizedRole,
    });

    // If not found, allow an admin to log in regardless
    if (!userExist) {
      userExist = await User.findOne({
        email: email?.trim().toLowerCase(),
        $or: [{ role: "Admin" }, { isAdmin: true }],
      });
    }

    if (!userExist) {
      return res.status(401).json({ msg: "Invalid credential" });
    }

    const ispasswordvalid = await bcrypt.compare(password, userExist.password);

    if (ispasswordvalid) {
      return res.status(200).json({
        msg: "Login successfully",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
        role: userExist.role,
        isAdmin: userExist.isAdmin,
      });
    }

    return res.status(400).json({ msg: "Invalid email or password" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// to send user data - user logic
const user = async (req, res) => {
  try {
    const userData = req.user;
    return res.status(200).json({ userData });
  } catch (error) {
    console.error("error from the user route", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = { home, register, login, user, normalizeRole };