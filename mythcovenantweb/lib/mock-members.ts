import type { Member } from "@/types/member";

export const memberClasses = [
  "Swordmaster",
  "Shadowblade",
  "Warden",
  "Cultivator",
  "Invoker",
];

export const initialMembers: Member[] = [
  {
    id: "member-1",
    nickname: "Lan Yêu",
    className: "Swordmaster",
    role: "Leader",
    power: 9800,
    note: "Đội trưởng nhóm khám phá",
  },
  {
    id: "member-2",
    nickname: "Vân Khôi",
    className: "Shadowblade",
    role: "Scout",
    power: 9120,
    note: "Rất giỏi trong nhiệm vụ bí mật",
  },
  {
    id: "member-3",
    nickname: "Thiên Mộc",
    className: "Cultivator",
    role: "Support",
    power: 8750,
    note: "Chuyên phụ trách hồi phục và hỗ trợ",
  },
  {
    id: "member-4",
    nickname: "Huyền Vũ",
    className: "Warden",
    role: "Tank",
    power: 9430,
    note: "Bảo vệ đội hình ở tuyến đầu",
  },
];
