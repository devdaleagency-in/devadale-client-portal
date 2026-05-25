import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    client: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Pending",
    },

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
  }
);

export default mongoose.model("Project", ProjectSchema);
