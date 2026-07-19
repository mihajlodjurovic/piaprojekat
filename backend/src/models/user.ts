import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let User = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['athlete', 'employee', 'admin'], required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  profileImage: { type: String, default: 'default-avatar.png' },
  favoriteSports: [{ type: String, trim: true }],
  // Employee-specific
  facilityName: { type: String, trim: true },
  facilityAddress: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  pib: { type: String, trim: true },
  // Blocked facilities
  blockedFacilities: [{
    facility: { type: Schema.Types.ObjectId, ref: 'SportFacilityModel' },
    noShowCount: { type: Number, default: 0 }
  }],
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Account status
  isActive: { type: Boolean, default: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('UserModel', User, 'users');
