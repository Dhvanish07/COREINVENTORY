import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: "" },
    meta: { type: Object, default: {} },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;