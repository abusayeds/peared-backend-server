import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { UserModel } from "../../basic_modules/user/user.model";
import projectModel from "../addProject/project-model";
import BitProjectModel from "../BitProject/BitProject.model";
import {
  PM_PERSON_SELECT,
  PmActivityModel,
  PmAttachmentModel,
  PmBugModel,
  PmManagedModel,
  PmMilestoneModel,
  PmStageModel,
  PmTaskModel,
} from "./pm.model";

const IN_PROGRESS = ["running", "complete"];
const ACCESS_BITS = ["running", "complete", "finished"];

const DEFAULT_TASK_STAGES = [
  { name: "Todo", color: "#60A5FA", isDone: false },
  { name: "In Progress", color: "#9CA3AF", isDone: false },
  { name: "Review", color: "#22D3EE", isDone: false },
  { name: "Done", color: "#22C55E", isDone: true },
];

const DEFAULT_BUG_STAGES = [
  { name: "Unconfirmed", color: "#3B82F6", isDone: false },
  { name: "Confirmed", color: "#A855F7", isDone: false },
  { name: "In Progress", color: "#06B6D4", isDone: false },
  { name: "Resolved", color: "#22C55E", isDone: false },
  { name: "Verified", color: "#374151", isDone: true },
];

const asId = (v: any) => String(v);

let pmIndexesReady = false;
const ensurePmIndexes = async () => {
  if (pmIndexesReady) return;
  try {
    await PmManagedModel.collection.dropIndex("projectId_1");
  } catch {
    /* old unique index may already be gone */
  }
  pmIndexesReady = true;
};

const uniquePosted = (rows: any[]) => {
  const seen = new Set<string>();
  return rows.filter((p: any) => {
    if (!p?._id) return false;
    const id = asId(p._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const guardAccess = async (user: any, projectId: any) => {
  const project: any = await projectModel.findById(projectId);
  if (!project) throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  const bits: any[] = await BitProjectModel.find({ projectId }).lean();
  const uid = asId(user._id);
  const ownerId = asId(project.userId);
  const assigned = bits.some((b) => asId(b.providerId) === uid);
  if (ownerId !== uid && !assigned && user.role !== "admin") {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  return { project, bits, isOwner: ownerId === uid, ownerId };
};

const guardPosted = async (user: any, projectId: any) => {
  const access = await guardAccess(user, projectId);
  const managed = await PmManagedModel.findOne({
    projectId,
    createdBy: user._id,
  });
  if (!managed) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Add this in-progress project to Project Manage first"
    );
  }
  return { ...access, managed };
};

export const ensureDefaultStages = async (ownerId: string) => {
  const existing = await PmStageModel.countDocuments({ ownerId });
  if (existing > 0) return;
  const docs = [
    ...DEFAULT_TASK_STAGES.map((s, i) => ({ ...s, ownerId, type: "task", order: i })),
    ...DEFAULT_BUG_STAGES.map((s, i) => ({ ...s, ownerId, type: "bug", order: i })),
  ];
  await PmStageModel.insertMany(docs);
};

const logActivity = async (projectId: any, userId: any, message: string) => {
  await PmActivityModel.create({ projectId, ownerId: userId, userId, message });
};

const daysLeft = (deadline?: Date) => {
  if (!deadline) return 0;
  const diff =
    new Date(deadline).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const deriveStatus = (project: any, bits: any[]) => {
  if (project.isComplete || bits.some((b) => b.isComplete === "finished")) {
    return "finished";
  }
  if (bits.some((b) => b.isComplete === "running" || b.isComplete === "complete")) {
    return "ongoing";
  }
  if (bits.some((b) => b.isComplete === "pending") && !project.isApprove) {
    return "onhold";
  }
  return "ongoing";
};

const shapePosted = (
  project: any,
  bits: any[],
  owner: any,
  assigned: any[],
  counts: { total: number; done: number },
  viewerRole: string
) => {
  const status = deriveStatus(project, bits);
  const paidBit = bits.find((b) =>
    ["running", "complete", "finished"].includes(b.isComplete)
  );
  const budget = paidBit?.price || 0;
  const deadline = project.expiredDate;
  const overdue = status !== "finished" && deadline && new Date(deadline).getTime() < Date.now();
  const total = counts?.total || 0;
  const done = counts?.done || 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  return {
    _id: project._id,
    title: project.projectName,
    description: project.workDetails,
    projectCategory: project.projectCategory,
    image: project.image,
    budget,
    budgetLabel: paidBit?.price
      ? `$${Number(paidBit.price).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : project.priceRange || "—",
    priceRange: project.priceRange,
    startDate: project.createdAt,
    deadline,
    status,
    overdue,
    daysLeft: daysLeft(deadline),
    ownerId: owner,
    assignedTo: assigned,
    progress: { done, total, percent },
    viewerRole,
    posted: true,
  };
};

const computeProgress = async (projectIds: string[], ownerId: any) => {
  const [tasks, doneStages] = await Promise.all([
    PmTaskModel.find({ projectId: { $in: projectIds }, ownerId }).select("projectId stageId"),
    PmStageModel.find({ ownerId, isDone: true }).select("_id"),
  ]);
  const doneSet = new Set(doneStages.map((s) => asId(s._id)));
  const map: Record<string, { total: number; done: number }> = {};
  for (const t of tasks) {
    const pid = asId(t.projectId);
    if (!map[pid]) map[pid] = { total: 0, done: 0 };
    map[pid].total += 1;
    if (doneSet.has(asId(t.stageId))) map[pid].done += 1;
  }
  return map;
};

const loadAccessiblePosted = async (
  user: any,
  { inProgressOnly = false }: { inProgressOnly?: boolean } = {}
) => {
  let posted: any[] = [];
  if (user.role === "provider") {
    const myBits = await BitProjectModel.find({
      providerId: user._id,
      isComplete: { $in: inProgressOnly ? IN_PROGRESS : ACCESS_BITS },
    })
      .populate("projectId")
      .lean();
    posted = uniquePosted(myBits.map((b: any) => b.projectId)).filter(
      (p: any) => !inProgressOnly || p.isComplete !== true
    );
  } else {
    posted = await projectModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    if (inProgressOnly && posted.length) {
      const bits = await BitProjectModel.find({
        projectId: { $in: posted.map((p) => p._id) },
      })
        .select("projectId isComplete")
        .lean();
      const runningIds = new Set(
        bits
          .filter((b) => IN_PROGRESS.includes(b.isComplete))
          .map((b) => asId(b.projectId))
      );
      posted = posted.filter(
        (p) =>
          p.isComplete !== true &&
          (p.isApprove === true || runningIds.has(asId(p._id)))
      );
    }
  }
  return posted;
};

const enrichPosted = async (user: any, posted: any[]) => {
  if (!posted.length) return [];
  const ids = posted.map((p) => p._id);
  const allBits = await BitProjectModel.find({ projectId: { $in: ids } })
    .populate("providerId", PM_PERSON_SELECT)
    .lean();
  const bitsByProject: Record<string, any[]> = {};
  for (const b of allBits) {
    const pid = asId(b.projectId);
    if (!bitsByProject[pid]) bitsByProject[pid] = [];
    bitsByProject[pid].push(b);
  }

  const ownerIds = [...new Set(posted.map((p) => asId(p.userId)))];
  const owners = await UserModel.find({ _id: { $in: ownerIds } })
    .select(PM_PERSON_SELECT)
    .lean();
  const ownerMap: Record<string, any> = {};
  for (const o of owners) ownerMap[asId(o._id)] = o;

  const progressMap = await computeProgress(ids.map(asId), user._id);
  return posted.map((p) => {
    const bits = bitsByProject[asId(p._id)] || [];
    const assigned = bits
      .filter((b) => ACCESS_BITS.includes(b.isComplete))
      .map((b) => b.providerId)
      .filter(Boolean);
    const uniq: any[] = [];
    const seenP = new Set<string>();
    for (const a of assigned) {
      const id = asId(a._id || a);
      if (seenP.has(id)) continue;
      seenP.add(id);
      uniq.push(a);
    }
    return shapePosted(
      p,
      bits,
      ownerMap[asId(p.userId)] || null,
      uniq,
      progressMap[asId(p._id)] || { total: 0, done: 0 },
      user.role
    );
  });
};

const listProjects = async (user: any, query: Record<string, any>) => {
  await ensurePmIndexes();
  await ensureDefaultStages(user._id);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(query.limit) || 12));
  const status = query.status as string | undefined;
  const searchTerm = String(query.searchTerm || "").trim().toLowerCase();

  const accessible = await loadAccessiblePosted(user);
  const managed = await PmManagedModel.find({
    createdBy: user._id,
    projectId: { $in: accessible.map((p) => p._id) },
  })
    .select("projectId")
    .lean();
  const managedSet = new Set(managed.map((m) => asId(m.projectId)));
  const posted = accessible.filter((p) => managedSet.has(asId(p._id)));
  let shaped = await enrichPosted(user, posted);

  if (searchTerm) {
    shaped = shaped.filter((p) =>
      `${p.title} ${p.projectCategory} ${p.description}`.toLowerCase().includes(searchTerm)
    );
  }
  if (status && ["ongoing", "onhold", "finished"].includes(status)) {
    shaped = shaped.filter((p) => p.status === status);
  }

  const stats = {
    total: shaped.length,
    ongoing: shaped.filter((p) => p.status === "ongoing").length,
    onhold: shaped.filter((p) => p.status === "onhold").length,
    finished: shaped.filter((p) => p.status === "finished").length,
    overdue: shaped.filter((p) => p.overdue).length,
  };

  const totalData = shaped.length;
  const pageItems = shaped.slice((page - 1) * limit, page * limit);

  return {
    stats,
    projects: pageItems,
    pagination: {
      totalData,
      currentPage: page,
      limit,
      totalPage: Math.ceil(totalData / limit) || 1,
    },
  };
};

const listEligible = async (user: any) => {
  await ensurePmIndexes();
  const posted = await loadAccessiblePosted(user, { inProgressOnly: true });
  const managed = await PmManagedModel.find({
    createdBy: user._id,
    projectId: { $in: posted.map((p) => p._id) },
  })
    .select("projectId")
    .lean();
  const managedSet = new Set(managed.map((m) => asId(m.projectId)));
  const open = posted.filter((p) => !managedSet.has(asId(p._id)));
  return enrichPosted(user, open);
};

const createProject = async (user: any, payload: any) => {
  const projectId = payload?.projectId;
  if (!projectId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Select an in-progress project");
  }
  const { project, bits } = await guardAccess(user, projectId);
  const uid = asId(user._id);
  const inProgress =
    project.isComplete !== true &&
    (user.role === "provider"
      ? bits.some(
          (b) =>
            IN_PROGRESS.includes(b.isComplete) && asId(b.providerId) === uid
        )
      : project.isApprove === true ||
        bits.some((b) => IN_PROGRESS.includes(b.isComplete)));
  if (!inProgress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only in-progress projects can be added to Project Manage"
    );
  }

  const existing = await PmManagedModel.findOne({
    projectId,
    createdBy: user._id,
  });
  if (!existing) {
    await PmManagedModel.create({ projectId, createdBy: user._id });
    await ensureDefaultStages(user._id);
    await logActivity(projectId, user._id, "added this project to Project Manage");
  }
  return { _id: String(projectId), projectId };
};

const getProject = async (user: any, projectId: string) => {
  const { project, bits, isOwner: isListingOwner, ownerId } = await guardPosted(
    user,
    projectId
  );
  await ensureDefaultStages(user._id);
  const owner = await UserModel.findById(ownerId).select(PM_PERSON_SELECT).lean();
  const assigned = await UserModel.find({
    _id: {
      $in: bits
        .filter((b) => ["running", "complete", "finished"].includes(b.isComplete))
        .map((b) => b.providerId),
    },
  }).select(PM_PERSON_SELECT);

  const scope = { projectId, ownerId: user._id };
  const [tasks, bugs, milestones, attachments, activities, taskStages, bugStages] =
    await Promise.all([
      PmTaskModel.find(scope)
        .populate("assignees", PM_PERSON_SELECT)
        .populate("stageId")
        .sort({ createdAt: -1 }),
      PmBugModel.find(scope)
        .populate("assignees", PM_PERSON_SELECT)
        .populate("stageId")
        .sort({ createdAt: -1 }),
      PmMilestoneModel.find(scope).sort({ createdAt: -1 }),
      PmAttachmentModel.find(scope)
        .populate("uploadedBy", PM_PERSON_SELECT)
        .sort({ createdAt: -1 }),
      PmActivityModel.find(scope)
        .populate("userId", PM_PERSON_SELECT)
        .sort({ createdAt: -1 })
        .limit(50),
      PmStageModel.find({ ownerId: user._id, type: "task" }).sort({ order: 1 }),
      PmStageModel.find({ ownerId: user._id, type: "bug" }).sort({ order: 1 }),
    ]);

  const doneStageIds = new Set(
    taskStages.filter((s) => s.isDone).map((s) => asId(s._id))
  );
  const done = tasks.filter((t) => doneStageIds.has(asId(t.stageId?._id || t.stageId))).length;
  const chartMonths: Record<string, number> = {};
  for (const t of tasks) {
    const d = new Date((t as any).createdAt);
    const key = d.toLocaleString("en-US", { month: "short" });
    chartMonths[key] = (chartMonths[key] || 0) + 1;
  }

  const shaped = shapePosted(
    project.toObject ? project.toObject() : project,
    bits,
    owner,
    assigned,
    { total: tasks.length, done },
    user.role
  );

  return {
    project: shaped,
    tasks,
    bugs,
    milestones,
    attachments,
    activities,
    stages: { task: taskStages, bug: bugStages },
    summary: {
      members: assigned.length + 1,
      providers: assigned.length,
      clients: 1,
      taskDone: done,
      taskTotal: tasks.length,
      bugOpen: bugs.filter((b) => !(b.stageId as any)?.isDone).length,
      bugTotal: bugs.length,
      milestoneDone: milestones.filter((m) => m.status === "Complete").length,
      milestoneTotal: milestones.length,
      chart: Object.entries(chartMonths).map(([month, count]) => ({ month, count })),
    },
    isOwner: true,
    isListingOwner,
  };
};

const updateProject = async (_user: any, _projectId: string, _payload: any) => {
  throw new AppError(
    httpStatus.BAD_REQUEST,
    "Deadline and budget come from the posted project."
  );
};

const deleteProject = async (user: any, projectId: string) => {
  await guardPosted(user, projectId);
  const scope = { projectId, ownerId: user._id };
  await Promise.all([
    PmManagedModel.deleteOne({ projectId, createdBy: user._id }),
    PmTaskModel.deleteMany(scope),
    PmBugModel.deleteMany(scope),
    PmMilestoneModel.deleteMany(scope),
    PmAttachmentModel.deleteMany(scope),
    PmActivityModel.deleteMany(scope),
  ]);
  return { deleted: true };
};

const listStages = async (user: any, type: string) => {
  await ensureDefaultStages(user._id);
  const filter: any = { ownerId: user._id };
  if (type === "task" || type === "bug") filter.type = type;
  return PmStageModel.find(filter).sort({ type: 1, order: 1 });
};

const createStage = async (user: any, payload: any) => {
  await ensureDefaultStages(user._id);
  const type = payload.type === "bug" ? "bug" : "task";
  const last = await PmStageModel.findOne({ ownerId: user._id, type }).sort({ order: -1 });
  const stage = await PmStageModel.create({
    ownerId: user._id,
    type,
    name: String(payload.name || "").trim() || "New stage",
    color: payload.color || "#5E9A2D",
    order: (last?.order ?? -1) + 1,
    isDone: !!payload.isDone,
  });
  return stage;
};

const updateStage = async (user: any, stageId: string, payload: any) => {
  const stage = await PmStageModel.findById(stageId);
  if (!stage) throw new AppError(httpStatus.NOT_FOUND, "Stage not found");
  if (asId(stage.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  if (payload.name !== undefined) stage.name = payload.name;
  if (payload.color !== undefined) stage.color = payload.color;
  if (payload.isDone !== undefined) stage.isDone = !!payload.isDone;
  if (payload.order !== undefined) stage.order = Number(payload.order);
  await stage.save();
  return stage;
};

const reorderStages = async (user: any, ids: string[]) => {
  await Promise.all(
    (ids || []).map((id, index) =>
      PmStageModel.updateOne({ _id: id, ownerId: user._id }, { order: index })
    )
  );
  return listStages(user, "");
};

const deleteStage = async (user: any, stageId: string) => {
  const stage = await PmStageModel.findById(stageId);
  if (!stage) throw new AppError(httpStatus.NOT_FOUND, "Stage not found");
  if (asId(stage.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  const remaining = await PmStageModel.countDocuments({
    ownerId: user._id,
    type: stage.type,
    _id: { $ne: stage._id },
  });
  if (remaining < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, "Keep at least one stage");
  }
  const fallback = await PmStageModel.findOne({
    ownerId: user._id,
    type: stage.type,
    _id: { $ne: stage._id },
  }).sort({ order: 1 });
  if (stage.type === "task") {
    await PmTaskModel.updateMany(
      { stageId: stage._id, ownerId: user._id },
      { stageId: fallback!._id }
    );
  } else {
    await PmBugModel.updateMany(
      { stageId: stage._id, ownerId: user._id },
      { stageId: fallback!._id }
    );
  }
  await PmStageModel.findByIdAndDelete(stageId);
  return { deleted: true };
};

const createTask = async (user: any, projectId: string, payload: any) => {
  await guardPosted(user, projectId);
  await ensureDefaultStages(user._id);
  let stageId = payload.stageId;
  if (!stageId) {
    const first = await PmStageModel.findOne({
      ownerId: user._id,
      type: "task",
    }).sort({ order: 1 });
    stageId = first?._id;
  }
  if (!payload.title?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Title is required");
  const task = await PmTaskModel.create({
    projectId,
    ownerId: user._id,
    title: payload.title.trim(),
    description: payload.description || "",
    priority: payload.priority || "Medium",
    stageId,
    assignees: payload.assignees || [],
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    category: payload.category || "",
  });
  await logActivity(projectId, user._id, `created task "${task.title}"`);
  return PmTaskModel.findById(task._id)
    .populate("assignees", PM_PERSON_SELECT)
    .populate("stageId");
};

const updateTask = async (user: any, taskId: string, payload: any) => {
  const task = await PmTaskModel.findById(taskId);
  if (!task) throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  if (asId(task.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, task.projectId);
  const allowed = [
    "title",
    "description",
    "priority",
    "stageId",
    "assignees",
    "startDate",
    "endDate",
    "category",
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) (task as any)[key] = payload[key];
  }
  await task.save();
  await logActivity(task.projectId, user._id, `updated task "${task.title}"`);
  return PmTaskModel.findById(task._id)
    .populate("assignees", PM_PERSON_SELECT)
    .populate("stageId");
};

const deleteTask = async (user: any, taskId: string) => {
  const task = await PmTaskModel.findById(taskId);
  if (!task) throw new AppError(httpStatus.NOT_FOUND, "Task not found");
  if (asId(task.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, task.projectId);
  await PmTaskModel.findByIdAndDelete(taskId);
  await logActivity(task.projectId, user._id, `deleted task "${task.title}"`);
  return { deleted: true };
};

const createBug = async (user: any, projectId: string, payload: any) => {
  await guardPosted(user, projectId);
  await ensureDefaultStages(user._id);
  let stageId = payload.stageId;
  if (!stageId) {
    const first = await PmStageModel.findOne({
      ownerId: user._id,
      type: "bug",
    }).sort({ order: 1 });
    stageId = first?._id;
  }
  if (!payload.title?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Title is required");
  const bug = await PmBugModel.create({
    projectId,
    ownerId: user._id,
    title: payload.title.trim(),
    description: payload.description || "",
    priority: payload.priority || "Medium",
    stageId,
    assignees: payload.assignees || [],
  });
  await logActivity(projectId, user._id, `created bug "${bug.title}"`);
  return PmBugModel.findById(bug._id)
    .populate("assignees", PM_PERSON_SELECT)
    .populate("stageId");
};

const updateBug = async (user: any, bugId: string, payload: any) => {
  const bug = await PmBugModel.findById(bugId);
  if (!bug) throw new AppError(httpStatus.NOT_FOUND, "Bug not found");
  if (asId(bug.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, bug.projectId);
  const allowed = ["title", "description", "priority", "stageId", "assignees"];
  for (const key of allowed) {
    if (payload[key] !== undefined) (bug as any)[key] = payload[key];
  }
  await bug.save();
  await logActivity(bug.projectId, user._id, `updated bug "${bug.title}"`);
  return PmBugModel.findById(bug._id)
    .populate("assignees", PM_PERSON_SELECT)
    .populate("stageId");
};

const deleteBug = async (user: any, bugId: string) => {
  const bug = await PmBugModel.findById(bugId);
  if (!bug) throw new AppError(httpStatus.NOT_FOUND, "Bug not found");
  if (asId(bug.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, bug.projectId);
  await PmBugModel.findByIdAndDelete(bugId);
  await logActivity(bug.projectId, user._id, `deleted bug "${bug.title}"`);
  return { deleted: true };
};

const createMilestone = async (user: any, projectId: string, payload: any) => {
  await guardPosted(user, projectId);
  if (!payload.name?.trim()) throw new AppError(httpStatus.BAD_REQUEST, "Name is required");
  const milestone = await PmMilestoneModel.create({
    projectId,
    ownerId: user._id,
    name: payload.name.trim(),
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    cost: Number(payload.cost) || 0,
    progress: Number(payload.progress) || 0,
    status: payload.status || "Incomplete",
  });
  await logActivity(projectId, user._id, `added milestone "${milestone.name}"`);
  return milestone;
};

const updateMilestone = async (user: any, id: string, payload: any) => {
  const item = await PmMilestoneModel.findById(id);
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  if (asId(item.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, item.projectId);
  const allowed = ["name", "startDate", "endDate", "cost", "progress", "status"];
  for (const key of allowed) {
    if (payload[key] !== undefined) (item as any)[key] = payload[key];
  }
  await item.save();
  return item;
};

const deleteMilestone = async (user: any, id: string) => {
  const item = await PmMilestoneModel.findById(id);
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Milestone not found");
  if (asId(item.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, item.projectId);
  await PmMilestoneModel.findByIdAndDelete(id);
  return { deleted: true };
};

const addAttachment = async (user: any, projectId: string, payload: any) => {
  await guardPosted(user, projectId);
  if (!payload.url) throw new AppError(httpStatus.BAD_REQUEST, "File is required");
  const doc = await PmAttachmentModel.create({
    projectId,
    ownerId: user._id,
    name: payload.name || "Attachment",
    url: payload.url,
    uploadedBy: user._id,
  });
  await logActivity(projectId, user._id, `uploaded "${doc.name}"`);
  return PmAttachmentModel.findById(doc._id).populate("uploadedBy", PM_PERSON_SELECT);
};

const deleteAttachment = async (user: any, id: string) => {
  const item = await PmAttachmentModel.findById(id);
  if (!item) throw new AppError(httpStatus.NOT_FOUND, "Attachment not found");
  if (asId(item.ownerId) !== asId(user._id)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
  }
  await guardPosted(user, item.projectId);
  await PmAttachmentModel.findByIdAndDelete(id);
  return { deleted: true };
};

const assignableProviders = async () => {
  return UserModel.find({
    role: "provider",
    isApproved: true,
    isDeleted: { $ne: true },
  })
    .select(PM_PERSON_SELECT)
    .sort({ name: 1 })
    .limit(200);
};

export const pmService = {
  listProjects,
  listEligible,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listStages,
  createStage,
  updateStage,
  reorderStages,
  deleteStage,
  createTask,
  updateTask,
  deleteTask,
  createBug,
  updateBug,
  deleteBug,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  addAttachment,
  deleteAttachment,
  assignableProviders,
};
