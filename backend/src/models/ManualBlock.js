/**
 * Host-created calendar blocks (maintenance, personal use, etc.)
 */
import mongoose from "mongoose";

const manualBlockSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: "Blocked by host",
    },
    createdBy: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

manualBlockSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

const ManualBlock = mongoose.model("ManualBlock", manualBlockSchema);

export default ManualBlock;
