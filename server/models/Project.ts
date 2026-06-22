import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      ref: 'User',
    },
    assignedMembers: [{
      type: String,
      ref: 'User',
    }],
    stage: {
      type: String,
      default: "Discovery",
    },
    health: {
      type: String,
      enum: ["healthy", "warning", "critical"],
      default: "healthy",
    },
    progress: {
      type: Number,
      default: 0,
    },
    nextMilestone: {
      type: String,
      default: "",
    },
    nextMilestoneDate: {
      type: String,
      default: "",
    },
    iconName: {
      type: String,
      default: "palette",
    },
    category: {
      type: String,
      default: "",
    },
    team: [
      {
        name: { type: String, required: true },
        avatarUrl: { type: String, default: "" },
      },
    ],
    description: {
      type: String,
    },
    lastUpdated: {
      type: String,
      default: "Just now",
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export default mongoose.model("Project", ProjectSchema);
