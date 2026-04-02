import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Number }, // from client
    status: {
      type: String,
      enum: ["triggered", "processed"],
      default: "triggered"
    },
    snapshotUrl: { type: String }, // optional (image/video)
  },
  { timestamps: true } // adds createdAt, updatedAt
);

export default mongoose.model("SOS", sosSchema);