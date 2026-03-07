const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["EMPLOYEE", "EMPLOYER"],
      required: true,
    },
    companyCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    managerName: {
      type: String,
      trim: true,
    },
    managerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    leaveBalance: {
      type: Number,
      default: 20,
      min: 0,
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    companyCode: this.companyCode,
    companyName: this.companyName,
    managerName: this.managerName,
    managerEmail: this.managerEmail,
    leaveBalance: this.leaveBalance,
  };
};

module.exports = mongoose.model("User", userSchema);

