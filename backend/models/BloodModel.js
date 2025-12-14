import mongoose from "mongoose";

const bloodSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    // For Blood Labs
    bloodLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: false, // Changed from true to false
    },
    // For Hospitals (NEW FIELD)
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: false,
    },
    status: {
      type: String,
      enum: ["available", "used", "expired"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Custom validation to ensure either bloodLab or hospital is provided
bloodSchema.pre("save", function (next) {
  // Check if at least one facility reference exists
  if (!this.bloodLab && !this.hospital) {
    return next(new Error("Either bloodLab or hospital must be specified"));
  }

  // Prevent both from being set
  if (this.bloodLab && this.hospital) {
    return next(new Error("Blood cannot belong to both lab and hospital"));
  }

  // Auto-expire after 42 days if not set
  if (!this.expiryDate) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 42);
    this.expiryDate = expiry;
  }

  next();
});

// Indexes for performance
bloodSchema.index({ bloodLab: 1, bloodGroup: 1 });
bloodSchema.index({ hospital: 1, bloodGroup: 1 });
bloodSchema.index({ expiryDate: 1 });

export default mongoose.model("Blood", bloodSchema);