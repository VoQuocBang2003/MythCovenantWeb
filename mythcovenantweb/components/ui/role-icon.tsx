import { getRoleIcons, hasRole } from "@/lib/role-icons";

interface RoleIconProps {
  roles: string | string[];
  className?: string;
}

// Display all role icons (excluding Member)
export function RoleIcon({ roles, className = "" }: RoleIconProps) {
  const icons = getRoleIcons(roles);
  
  if (icons.length === 0) {
    return null;
  }

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {icons.map((icon, index) => (
        <span key={index} className="text-sm">{icon}</span>
      ))}
    </span>
  );
}

// Display role icons with leader highlight styling
interface RoleIconWithHighlightProps {
  roles: string | string[];
  className?: string;
}

export function RoleIconWithHighlight({ roles, className = "" }: RoleIconWithHighlightProps) {
  const icons = getRoleIcons(roles);
  const hasLeader = hasRole(roles, "Leader");
  
  if (icons.length === 0) {
    return null;
  }

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {icons.map((icon, index) => {
        const isLeaderIcon = icon === "👑";
        return (
          <span 
            key={index} 
            className={`text-sm ${isLeaderIcon && hasLeader ? "text-amber-400" : ""}`}
          >
            {icon}
          </span>
        );
      })}
    </span>
  );
}

// Render role icons with leader highlight - main helper function
interface RenderRoleIconsProps {
  roles: string | string[];
  className?: string;
}

export function RenderRoleIcons({ roles, className = "" }: RenderRoleIconsProps) {
  const icons = getRoleIcons(roles);
  const hasLeader = hasRole(roles, "Leader");
  
  if (icons.length === 0) {
    return null;
  }

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      {icons.map((icon, index) => {
        const isLeaderIcon = icon === "👑";
        return (
          <span 
            key={index} 
            className={`text-sm ${isLeaderIcon && hasLeader ? "text-amber-400" : ""}`}
          >
            {icon}
          </span>
        );
      })}
    </span>
  );
}