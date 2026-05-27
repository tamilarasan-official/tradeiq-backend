import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    panNumber: { type: String, required: true },
    passwordHash: { type: String, required: true },
    mpin: String,
    kycStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    kycDocuments: {
      panCard: String,
      aadhaar: { front: String, back: String },
      bankProof: String,
      selfie: String,
    },
    studyGroup: {
      type: String,
      enum: ['APP', 'CONTROL', 'NONE'],
      default: 'NONE',
    },
    consentSigned: { type: Boolean, default: false },
    consentTimestamp: Date,
    biometricEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
