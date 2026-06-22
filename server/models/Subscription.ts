import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, default: "default" },
    planName: { type: String, required: true },
    teamSeatsCount: { type: Number, required: true, default: 1 },
    agencyMembersCount: { type: Number, default: 1 },
    contractorsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "past_due", "canceled", "trialing"],
      default: "active"
    },
    renewalDate: { type: Date }
  },
  {
    timestamps: true,
    _id: false,
  }
);

export default mongoose.model("Subscription", SubscriptionSchema);
