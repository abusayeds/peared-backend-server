import { UserModel } from "../modules/basic_modules/user/user.model";

const asId = (v: any) => String(v);

const hasBlocked = (list: any[] | undefined, target: string) =>
  (list || []).some((id) => asId(id) === asId(target));

export const getBlockState = async (userA: string, userB: string) => {
  const [a, b] = await Promise.all([
    UserModel.findById(userA).select("blockedUsers").lean(),
    UserModel.findById(userB).select("blockedUsers").lean(),
  ]);
  const blockedByMe = hasBlocked((a as any)?.blockedUsers, userB);
  const blockedByPeer = hasBlocked((b as any)?.blockedUsers, userA);
  return {
    blockedByMe,
    blockedByPeer,
    isBlocked: blockedByMe || blockedByPeer,
  };
};
