import mongoose, { Schema } from "mongoose";

const personSelect = "name email image role";

const PmStageSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["task", "bug"], required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);
PmStageSchema.index({ ownerId: 1, type: 1, order: 1 });

const PmManagedSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const PmProjectSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    budget: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ongoing", "onhold", "finished"],
      default: "ongoing",
    },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const PmTaskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "PmProject", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    stageId: { type: Schema.Types.ObjectId, ref: "PmStage", required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    category: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const PmBugSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "PmProject", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    stageId: { type: Schema.Types.ObjectId, ref: "PmStage", required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const PmMilestoneSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "PmProject", required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    cost: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ["Incomplete", "Complete"], default: "Incomplete" },
  },
  { timestamps: true }
);

const PmAttachmentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "PmProject", required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const PmActivitySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "PmProject", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const PmStageModel = mongoose.model("PmStage", PmStageSchema);
export const PmManagedModel = mongoose.model("PmManaged", PmManagedSchema);
export const PmProjectModel = mongoose.model("PmProject", PmProjectSchema);
export const PmTaskModel = mongoose.model("PmTask", PmTaskSchema);
export const PmBugModel = mongoose.model("PmBug", PmBugSchema);
export const PmMilestoneModel = mongoose.model("PmMilestone", PmMilestoneSchema);
export const PmAttachmentModel = mongoose.model("PmAttachment", PmAttachmentSchema);
export const PmActivityModel = mongoose.model("PmActivity", PmActivitySchema);
export const PM_PERSON_SELECT = personSelect;
