const express = require("express");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Employer: list all employees in their company
router.get(
  "/",
  requireAuth,
  requireRole("EMPLOYER"),
  async (req, res) => {
    try {
      const employees = await User.find({
        role: "EMPLOYEE",
        companyCode: req.user.companyCode,
      })
        .select("name email leaveBalance createdAt")
        .sort({ name: 1 })
        .lean();
      return res.json(employees);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Get employees error", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
