const { hash } = require("bcryptjs");
const User = require("../models/user-model");
const Doctor = require("../models/Doctor-model");
const bcrypt = require("bcryptjs");

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
    const { username, email, phone, password, role } = req.body;
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return res.status(400).json({ msg: "Please select a valid role" });
    }

    const userExist = await User.findOne({ email: email?.trim().toLowerCase() });

    if (userExist) {
      return res.status(409).json({ msg: "Email already exists" });
    }

    const saltround = 10;
    const hash_password = await bcrypt.hash(password, saltround);

const userCreated = await User.create({
      username: username?.trim(),
      email: email?.trim().toLowerCase(),
      phone: String(phone).trim(),
      password: hash_password,
      role: normalizedRole,
    });

    // Auto-create a Doctor profile when a user registers as a Doctor.
    // This ensures the doctor appears in the patient-facing doctor list
    // (book appointment page & find doctor page) with basic information.
    if (normalizedRole === "Doctor") {
      await Doctor.create({
        userId: userCreated._id,
        name: username?.trim() || userCreated.username,
        email: email?.trim().toLowerCase(),
        phone: String(phone).trim(),
        specialization: "",
        clinicAddress: "",
        city: "",
        // Default Free subscription so the doctor is visible/listed
        subscriptionPlan: "Free",
        subscriptionStatus: "Free",
      });
    }

    return res.status(200).json({
      msg: "Registration successfully",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      return res.status(400).json({ msg: "Please select a valid role" });
    }

// First try to match the exact role selected in the form (Patient/Doctor)
    let userExist = await User.findOne({
      email: email?.trim().toLowerCase(),
      role: normalizedRole,
    });

    // If not found, allow an admin (role "Admin" / isAdmin) to log in regardless
    // of the form-selected role since "Admin" is hidden from the dropdown.
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

// to send user data  - user logic

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
