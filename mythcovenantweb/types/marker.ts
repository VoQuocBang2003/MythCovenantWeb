// Marker type for battle map annotations
export type MarkerType = "point" | "area" | "label";

// Available marker icons - reduced to 10 most common
export const markerIcons = [
  "📍", "⭐", "⚔", "🛡", "💚", "👑", "⚡", "🔥", "💧", "🏹", "☠", "❗"
] as const;

export type MarkerIcon = (typeof markerIcons)[number];

// Available marker colors - reduced to 8 common colors
export const markerColors = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
  "#a855f7", // purple
  "#ffffff", // white
  "#000000", // black
] as const;

export type MarkerColor = (typeof markerColors)[number];

// Marker shape for tldraw
export interface BattleMarker {
  id: string;
  name: string;
  icon: MarkerIcon;
  color: MarkerColor;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width?: number;
  height?: number;
}