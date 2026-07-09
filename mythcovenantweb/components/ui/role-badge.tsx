import { getRoleBadgeClasses } from "@/lib/role-colors";
import { getRoleIcon } from "@/lib/role-icons";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 text-sm font-medium ${getRoleBadgeClasses(role)} ${className}`}>
      {getRoleIcon(role)}
    </span>
  );
}