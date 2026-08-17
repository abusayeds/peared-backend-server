import { Socket, Server as SocketIOServer } from "socket.io";
import { conversationModel } from "../modules/make_modules/messages/messages.model";
import { getBlockState } from "./block";
import { CallStatus, saveCallEvent } from "./callLog";

const asId = (v: any) => String(v);

type CallSession = {
  conversationId: string;
  peerId: string;
  callerId: string;
  callerName: string;
  accepted: boolean;
  connectedAt: number | null;
};

/** userId -> active call */
const callByUser = new Map<string, CallSession>();
const endingCalls = new Set<string>();

const clearPair = (a: string, b: string) => {
  callByUser.delete(a);
  callByUser.delete(b);
};

const patchPair = (a: string, b: string, patch: Partial<CallSession>) => {
  const ra = callByUser.get(a);
  const rb = callByUser.get(b);
  if (ra) callByUser.set(a, { ...ra, ...patch });
  if (rb) callByUser.set(b, { ...rb, ...patch });
};

const loadMembership = async (conversationId: string, userId: string) => {
  const conv: any = await conversationModel
    .findById(conversationId)
    .populate({ path: "userId", select: "name image" })
    .populate({ path: "providerId", select: "name image" });
  if (!conv) return null;
  const uid = asId(userId);
  const clientId = asId(conv.userId?._id || conv.userId);
  const providerId = asId(conv.providerId?._id || conv.providerId);
  if (uid !== clientId && uid !== providerId) return null;
  const peer = uid === clientId ? conv.providerId : conv.userId;
  const caller = uid === clientId ? conv.userId : conv.providerId;
  const peerId = asId(peer?._id || peer);
  return { conv, peerId, peer, caller };
};

const statusFromHint = (
  session: CallSession,
  hint?: string
): { status: CallStatus; durationSeconds: number } => {
  if (session.connectedAt) {
    return {
      status: "completed",
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - session.connectedAt) / 1000)
      ),
    };
  }
  if (hint === "rejected") return { status: "rejected", durationSeconds: 0 };
  if (hint === "cancelled") return { status: "cancelled", durationSeconds: 0 };
  if (hint === "no-answer" || hint === "unavailable" || hint === "disconnect") {
    return { status: "missed", durationSeconds: 0 };
  }
  if (session.accepted) return { status: "cancelled", durationSeconds: 0 };
  return { status: "missed", durationSeconds: 0 };
};

export const attachCallHandlers = ({
  socket,
  io,
  userId,
  userName,
  userImage,
  socketMap,
  emitToUser,
}: {
  socket: Socket;
  io: SocketIOServer;
  userId: string;
  userName: string;
  userImage?: string;
  socketMap: Map<string, Socket>;
  emitToUser: (id: string, event: string, payload: any) => void;
}) => {
  const finalizeCall = async (actorId: string, hint?: string) => {
    const session = callByUser.get(actorId);
    if (!session) return;
    const lockKey = session.conversationId;
    if (endingCalls.has(lockKey)) return;
    endingCalls.add(lockKey);
    const { conversationId, peerId, callerId, callerName } = session;
    const { status, durationSeconds } = statusFromHint(session, hint);
    clearPair(actorId, peerId);
    const calleeId =
      asId(callerId) === asId(actorId) ? peerId : actorId;

    try {
      await saveCallEvent({
        io,
        emitToUser,
        conversationId,
        callerId,
        calleeId,
        callerName,
        status,
        durationSeconds,
      });
    } finally {
      endingCalls.delete(lockKey);
    }

    const ended = {
      conversationId,
      reason: hint || status,
      durationSeconds,
      callStatus: status,
    };
    emitToUser(peerId, "call:ended", ended);
    emitToUser(actorId, "call:ended", ended);
  };

  socket.on("call:invite", async (data) => {
    try {
      const conversationId = String(data?.conversationId || "");
      if (!conversationId) return;
      const membership = await loadMembership(conversationId, userId);
      if (!membership) {
        socket.emit("call:error", { message: "Not in this chat" });
        return;
      }
      const { peerId, peer, caller } = membership;
      const block = await getBlockState(userId, peerId);
      if (block.isBlocked) {
        socket.emit("call:error", { message: "You can't call this user" });
        return;
      }
      if (callByUser.has(userId) || callByUser.has(peerId)) {
        socket.emit("call:busy", { conversationId });
        return;
      }

      const callerName = caller?.name || userName || "Peared user";
      if (!socketMap.get(peerId)) {
        await saveCallEvent({
          io,
          emitToUser,
          conversationId,
          callerId: userId,
          calleeId: peerId,
          callerName,
          status: "missed",
          durationSeconds: 0,
        });
        socket.emit("call:unavailable", { conversationId });
        return;
      }

      const session: CallSession = {
        conversationId,
        peerId,
        callerId: userId,
        callerName,
        accepted: false,
        connectedAt: null,
      };
      callByUser.set(userId, session);
      callByUser.set(peerId, { ...session, peerId: userId });

      emitToUser(peerId, "call:incoming", {
        conversationId,
        fromId: userId,
        fromName: callerName,
        fromImage: caller?.image || userImage || "",
      });
      socket.emit("call:ringing", {
        conversationId,
        toId: peerId,
        toName: peer?.name,
        toImage: peer?.image,
      });
    } catch (err) {
      console.error("call:invite", err);
    }
  });

  socket.on("call:accept", async (data) => {
    const conversationId = String(data?.conversationId || "");
    const record = callByUser.get(userId);
    if (!record || record.conversationId !== conversationId) return;
    patchPair(userId, record.peerId, { accepted: true });
    emitToUser(record.peerId, "call:accepted", { conversationId });
  });

  socket.on("call:started", () => {
    const record = callByUser.get(userId);
    if (!record || record.connectedAt) return;
    patchPair(userId, record.peerId, { connectedAt: Date.now() });
  });

  socket.on("call:reject", (data) => {
    const conversationId = String(data?.conversationId || "");
    const record = callByUser.get(userId);
    if (!record || (conversationId && record.conversationId !== conversationId)) {
      return;
    }
    const hint = asId(record.callerId) === asId(userId) ? "cancelled" : "rejected";
    void finalizeCall(userId, hint);
  });

  socket.on("call:end", (data) => {
    const record = callByUser.get(userId);
    if (!record) return;
    const hint = String(data?.reason || "hangup");
    void finalizeCall(userId, hint);
  });

  socket.on("call:signal", (data) => {
    const record = callByUser.get(userId);
    if (!record) return;
    emitToUser(record.peerId, "call:signal", {
      conversationId: record.conversationId,
      sdp: data?.sdp,
      candidate: data?.candidate,
    });
  });

  socket.on("disconnect", () => {
    void finalizeCall(userId, "disconnect");
  });
};
