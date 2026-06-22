import mongoose from "mongoose";

const IntegrationSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Connected", "Needs auth", "Ready"],
      default: "Ready"
    },
    workspaceId: { type: String, default: "default" },
    lastSyncedAt: { type: Date }
  },
  {
    timestamps: true,
    _id: false,
  }
);

export default mongoose.model("Integration", IntegrationSchema);
