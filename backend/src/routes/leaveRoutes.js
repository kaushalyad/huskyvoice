const express = require("express");
const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Employee: create a new leave request
router.post(
  "/",
  requireAuth,
  requireRole("EMPLOYEE"),
  async (req, res) => {
    try {
      const { leaveType, startDate, endDate, reason } = req.body;

      if (!leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({
          message: "leaveType, startDate, endDate and reason are required",
        });
      }
      if (typeof reason !== "string" || reason.trim().length < 3) {
        return res
          .status(400)
          .json({ message: "reason must be at least 3 characters" });
      }
      if (typeof leaveType !== "string" || leaveType.trim().length < 2) {
        return res
          .status(400)
          .json({ message: "leaveType must be at least 2 characters" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (end < start) {
        return res
          .status(400)
          .json({ message: "End date cannot be before start date" });
      }

      const daysMs = end.getTime() - start.getTime();
      const daysRequested = Math.floor(daysMs / (1000 * 60 * 60 * 24)) + 1;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (daysRequested > user.leaveBalance) {
        return res.status(400).json({
          message: "Insufficient leave balance for the selected dates",
        });
      }

      const overlapping = await LeaveRequest.findOne({
        employee: req.user.id,
        companyCode: req.user.companyCode,
        status: { $in: ["PENDING", "APPROVED"] },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
          { startDate: { $lte: end }, endDate: { $gte: start } },
        ],
      });
      if (overlapping) {
        return res.status(400).json({
          message: "You already have a leave request overlapping these dates",
        });
      }

      const leave = await LeaveRequest.create({
        employee: req.user.id,
        companyCode: req.user.companyCode,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
      });

      return res.status(201).json(leave);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Create leave error", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Employee: view own leave requests
router.get(
  "/my",
  requireAuth,
  requireRole("EMPLOYEE"),
  async (req, res) => {
    try {
      const leaves = await LeaveRequest.find({
        employee: req.user.id,
        companyCode: req.user.companyCode,
      })
        .sort({ createdAt: -1 })
        .lean();
      return res.json(leaves);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Get my leaves error", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Employer: view all leave requests

router.get(
  "/",
  requireAuth,
  requireRole("EMPLOYER"),
  async (req, res) => {
    try {
      const leaves = await LeaveRequest.find({
        companyCode: req.user.companyCode,
      })
        .populate("employee", "name email")
        .sort({ createdAt: -1 })
        .lean();
      return res.json(leaves);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Get all leaves error", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

async function updateStatus(req, res, newStatus) {
  try {
    const { id } = req.params;
    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.companyCode !== req.user.companyCode) {
      return res.status(403).json({
        message: "You can only update requests from your own company",
      });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending requests can be updated",
      });
    }

    if (newStatus === "APPROVED") {
      const employee = await User.findById(leave.employee);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const daysMs =
        leave.endDate.getTime() - leave.startDate.getTime();
      const daysApproved =
        Math.floor(daysMs / (1000 * 60 * 60 * 24)) + 1;

      if (daysApproved > employee.leaveBalance) {
        return res.status(400).json({
          message: "Employee no longer has enough leave balance",
        });
      }

      employee.leaveBalance -= daysApproved;
      await employee.save();
    }

    leave.status = newStatus;
    leave.decisionBy = req.user.id;
    leave.decisionAt = new Date();
    await leave.save();

    return res.json(leave);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Update leave status error", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Employer: approve a leave request
router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("EMPLOYER"),
  (req, res) => updateStatus(req, res, "APPROVED")
);

// Employer: reject a leave request
router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("EMPLOYER"),
  (req, res) => updateStatus(req, res, "REJECTED")
);

module.exports = router;

