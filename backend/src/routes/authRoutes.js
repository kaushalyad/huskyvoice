const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function validateRegisterBody(body) {
  const { name, email, password, role, companyCode, companyName } = body;
  if (!name || !email || !password || !role) {
    return "name, email, password and role are required";
  }
  if (!["EMPLOYEE", "EMPLOYER"].includes(role)) {
    return "role must be EMPLOYEE or EMPLOYER";
  }
  if (password.length < 6) {
    return "password must be at least 6 characters";
  }
  if (!companyCode) {
    return "companyCode is required";
  }
  if (role === "EMPLOYER" && !companyName) {
    return "companyName is required for employers";
  }
  return null;
}

router.post("/register", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const error = validateRegisterBody(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const { name, email, password, role, companyCode, companyName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const normalizedCode = (companyCode || "").trim().toLowerCase();
    if (!normalizedCode) {
      return res.status(400).json({ message: "Company code is required" });
    }

    const roleUpper = String(role || "").toUpperCase();
    let user;

    if (roleUpper === "EMPLOYER") {
      user = await User.create({
        name,
        email,
        passwordHash,
        role: "EMPLOYER",
        companyCode: normalizedCode,
        companyName: (companyName || "").trim(),
      });
    } else {
      const employer = await User.findOne({
        role: "EMPLOYER",
        companyCode: normalizedCode,
      });
      if (!employer) {
        return res.status(400).json({
          message: "No employer found for this company code. The employer must register first and share the code with you.",
        });
      }

      user = await User.create({
        name,
        email,
        passwordHash,
        role: "EMPLOYEE",
        companyCode: employer.companyCode,
        companyName: employer.companyName,
        managerName: employer.name,
        managerEmail: employer.email,
      });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        companyCode: user.companyCode,
        companyName: user.companyName,
        managerName: user.managerName,
        managerEmail: user.managerEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(201).json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Register error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        companyCode: user.companyCode,
        companyName: user.companyName,
        managerName: user.managerName,
        managerEmail: user.managerEmail,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.json({
      token,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Login error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

