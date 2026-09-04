import type { MembershipRole } from "@resolve/types";
import { AppError } from "../errors/app-error.js";

const roleRank: Record<MembershipRole, number> = { AGENT: 1, ADMIN: 2, OWNER: 3 };

export function requireRole(role: MembershipRole, minimumRole: MembershipRole) {
  if (roleRank[role] < roleRank[minimumRole]) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action", 403);
  }
}
