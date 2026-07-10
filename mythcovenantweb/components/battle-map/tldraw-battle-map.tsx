"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { BattleMarker, MarkerIcon, MarkerColor } from "@/types/marker";
import { markerIcons, markerColors } from "@/types/marker";
import { v4 as uuidv4 } from "uuid";

// Drawing tools
type Tool = "select" | "pen" | "eraser" | "rectangle" | "circle" | "line" | "arrow" | "text" | "marker";

// Drawing object - stored in pixel coordinates
interface DrawnObject {
  id: string;
  type: "pen" | "rectangle" | "circle" | "line" | "arrow" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  points?: { x: number; y: number }[];
  text?: string;
}

// Tool panel props
interface ToolPanelProps {
  activeTool: Tool;
  selectedColor: MarkerColor;
  zoom: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: MarkerColor) => void;
  onAddMarker: (marker: BattleMarker) => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitMap: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Marker creation panel
function ToolPanel({
  activeTool,
  selectedColor,
  zoom,
  onToolChange,
  onColorChange,
  onAddMarker,
  onClear,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitMap,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolPanelProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<MarkerIcon>("📍");

  const handleAddMarker = useCallback(() => {
    if (!name.trim()) return;
    const marker: BattleMarker = {
      id: uuidv4(),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      x: 50,
      y: 50,
    };
    onAddMarker(marker);
    setName("");
  }, [name, selectedIcon, selectedColor, onAddMarker]);

  const toolButtons = [
    { tool: "select" as Tool, icon: "👆", label: "Chọn" },
    { tool: "pen" as Tool, icon: "✏️", label: "Bút" },
    { tool: "eraser" as Tool, icon: "🧹", label: "Tẩy" },
    { tool: "line" as Tool, icon: "📏", label: "Line" },
    { tool: "arrow" as Tool, icon: "➡️", label: "Arrow" },
    { tool: "rectangle" as Tool, icon: "▢", label: "Hình chữ nhật" },
    { tool: "circle" as Tool, icon: "●", label: "Hình tròn" },
    { tool: "text" as Tool, icon: "T", label: "Text" },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 backdrop-blur-sm">
      {/* Row 1: Drawing tools, zoom */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1">Công cụ:</span>
          <div className="flex gap-1">
            {toolButtons.map(({ tool, icon, label }) => (
              <button
                key={tool}
                onClick={() => onToolChange(tool)}
                className={`flex h-7 w-7 items-center justify-center rounded text-sm transition ${
                  activeTool === tool ? "bg-amber-500/20 ring-2 ring-amber-500" : "bg-white/5 hover:bg-white/10"
                }`}
                title={label}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1">Zoom:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onZoomOut}
              className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs hover:bg-white/10 transition"
              title="Thu nhỏ"
            >
              -
            </button>
            <button
              onClick={onResetZoom}
              className="flex h-6 px-2 items-center justify-center rounded bg-white/5 text-xs font-medium hover:bg-white/10 transition"
              title="Đặt lại zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={onZoomIn}
              className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs hover:bg-white/10 transition"
              title="Phóng to"
            >
              +
            </button>
            <button
              onClick={onFitMap}
              className="flex h-6 px-2 items-center justify-center rounded bg-amber-500/20 text-xs font-medium text-amber-300 hover:bg-amber-500/30 transition"
              title="Fit Map"
            >
              Fit
            </button>
          </div>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Undo/Redo controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-xs hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Row 2: Marker creation, icon, color, delete */}
      <div className="flex items-center gap-2">
        <div className="w-px h-5 bg-white/10 mx-1" />
        
        <h3 className="text-sm font-semibold text-white whitespace-nowrap">Tạo Marker</h3>
        <input
          type="text"
          placeholder="Tên marker..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40 rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1">Icon:</span>
          <div className="flex gap-1">
            {markerIcons.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`flex h-7 w-7 items-center justify-center rounded text-sm transition ${
                  selectedIcon === icon ? "bg-amber-500/20 ring-2 ring-amber-500" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1">Màu:</span>
          <div className="flex gap-1">
            {markerColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`h-5 w-5 rounded-full border-2 transition ${
                  selectedColor === color ? "ring-2 ring-white" : "border-white/20"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleAddMarker}
          disabled={!name.trim()}
          className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thêm
        </button>

        <button
          onClick={onClear}
          className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

interface BattleMapProps {
  onMarkersChange: (markers: BattleMarker[]) => void;
}

export function TldrawBattleMap({ onMarkersChange }: BattleMapProps) {
  const [markers, setMarkers] = useState<BattleMarker[]>([]);
  const [drawnObjects, setDrawnObjects] = useState<DrawnObject[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedColor, setSelectedColor] = useState<MarkerColor>("#ef4444");
  const [zoom, setZoom] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Load map image to get dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setMapLoaded(true);
      setMapDimensions({ width: img.width, height: img.height });
    };
    img.src = "/maps/map1.png";
  }, []);

  // Calculate fit scale
  const calculateFitScale = useCallback(() => {
    const container = containerRef.current;
    if (!container || mapDimensions.width === 0) return 1;

    const containerRect = container.getBoundingClientRect();
    const scaleX = containerRect.width / mapDimensions.width;
    const scaleY = containerRect.height / mapDimensions.height;
    return Math.min(scaleX, scaleY);
  }, [mapDimensions]);

  // Fit map to container
  const fitMap = useCallback(() => {
    const fitScale = calculateFitScale();
    setZoom(fitScale);
  }, [calculateFitScale]);

  // Redraw canvas - convert percentage to pixels
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawnObjects.forEach((obj) => {
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      if (obj.type === "pen" && obj.points) {
        ctx.beginPath();
        obj.points.forEach((point, i) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (obj.type === "rectangle") {
        const x = (obj.x / 100) * canvas.width;
        const y = (obj.y / 100) * canvas.height;
        const w = (obj.width || 0) / 100 * canvas.width;
        const h = (obj.height || 0) / 100 * canvas.height;
        ctx.strokeRect(x, y, w, h);
      } else if (obj.type === "circle") {
        const x = (obj.x / 100) * canvas.width;
        const y = (obj.y / 100) * canvas.height;
        const radius = Math.max((obj.width || 0) / 100 * canvas.width, (obj.height || 0) / 100 * canvas.height) / 2;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [drawnObjects]);

  // Resize canvas to fit container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    redrawCanvas();
  }, [redrawCanvas]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMarkers = localStorage.getItem("battle-map-markers");
    const savedObjects = localStorage.getItem("battle-map-objects");

    if (savedMarkers) {
      try {
        const parsed = JSON.parse(savedMarkers);
        setMarkers(parsed);
        onMarkersChange(parsed);
      } catch (e) {
        console.error("Failed to parse saved markers:", e);
      }
    }

    if (savedObjects) {
      try {
        const parsed = JSON.parse(savedObjects);
        setDrawnObjects(parsed);
      } catch (e) {
        console.error("Failed to parse saved objects:", e);
      }
    }
  }, [onMarkersChange]);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("battle-map-markers", JSON.stringify(markers));
    onMarkersChange(markers);
  }, [markers, onMarkersChange]);

  useEffect(() => {
    localStorage.setItem("battle-map-objects", JSON.stringify(drawnObjects));
  }, [drawnObjects]);

  // Fit map on initial load
  useEffect(() => {
    if (mapLoaded) {
      fitMap();
    }
  }, [mapLoaded, fitMap]);

  // Resize canvas on mount and window resize
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => {
      resizeCanvas();
      if (mapLoaded) {
        fitMap();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvas, mapLoaded, fitMap]);

  // Redraw canvas when objects change
  useEffect(() => {
    redrawCanvas();
  }, [drawnObjects, redrawCanvas]);

  // Handle mouse events for drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select" || activeTool === "marker") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Convert to percentage coordinates (accounting for zoom)
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;

    isDrawingRef.current = true;
    startPointRef.current = { x, y };

    if (activeTool === "pen") {
      currentPathRef.current = [{ x, y }];
    } else if (activeTool === "eraser") {
      // Eraser mode - remove objects under cursor
      setDrawnObjects((prev) => {
        return prev.filter((obj) => {
          if (obj.type === "pen" && obj.points) {
            // Check if any point is within eraser range
            return !obj.points.some((point) => {
              const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
              return dist < 5; // Eraser radius in percentage
            });
          } else if (obj.type === "rectangle" || obj.type === "circle") {
            // Check if object center is within eraser range
            const centerX = obj.x + (obj.width || 0) / 2;
            const centerY = obj.y + (obj.height || 0) / 2;
            const dist = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
            return dist > 5; // Keep if not within eraser range
          }
          return true;
        });
      });
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || activeTool === "select" || activeTool === "marker") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Convert to percentage coordinates (accounting for zoom)
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;

    // Handle eraser - remove objects under cursor while dragging
    if (activeTool === "eraser") {
      setDrawnObjects((prev) => {
        return prev.filter((obj) => {
          if (obj.type === "pen" && obj.points) {
            // Check if any point is within eraser range
            return !obj.points.some((point) => {
              const dist = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
              return dist < 5; // Eraser radius in percentage
            });
          } else if (obj.type === "rectangle" || obj.type === "circle") {
            // Check if object center is within eraser range
            const centerX = obj.x + (obj.width || 0) / 2;
            const centerY = obj.y + (obj.height || 0) / 2;
            const dist = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
            return dist > 5; // Keep if not within eraser range
          }
          return true;
        });
      });
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all existing objects
    drawnObjects.forEach((obj) => {
      ctx.strokeStyle = obj.color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      if (obj.type === "pen" && obj.points) {
        ctx.beginPath();
        obj.points.forEach((point, i) => {
          const px = (point.x / 100) * canvas.width;
          const py = (point.y / 100) * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      } else if (obj.type === "rectangle") {
        const rx = (obj.x / 100) * canvas.width;
        const ry = (obj.y / 100) * canvas.height;
        const rw = (obj.width || 0) / 100 * canvas.width;
        const rh = (obj.height || 0) / 100 * canvas.height;
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (obj.type === "circle") {
        const cx = (obj.x / 100) * canvas.width;
        const cy = (obj.y / 100) * canvas.height;
        const radius = Math.max((obj.width || 0) / 100 * canvas.width, (obj.height || 0) / 100 * canvas.height) / 2;
        ctx.beginPath();
        ctx.arc(cx + radius, cy + radius, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw current shape being created
    if (startPointRef.current) {
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;

      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 2;

      if (activeTool === "pen") {
        currentPathRef.current.push({ x, y });
        ctx.beginPath();
        currentPathRef.current.forEach((point, i) => {
          const px = (point.x / 100) * canvas.width;
          const py = (point.y / 100) * canvas.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      } else if (activeTool === "rectangle") {
        // Save current position for later use
        currentPathRef.current = [{ x, y }];
        const width = x - startX;
        const height = y - startY;
        const rx = (startX / 100) * canvas.width;
        const ry = (startY / 100) * canvas.height;
        const rw = (width / 100) * canvas.width;
        const rh = (height / 100) * canvas.height;
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (activeTool === "circle") {
        // Save current position for later use
        currentPathRef.current = [{ x, y }];
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        const cx = (startX / 100) * canvas.width;
        const cy = (startY / 100) * canvas.height;
        const cr = (radius / 100) * canvas.width;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [activeTool, drawnObjects, selectedColor]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current || activeTool === "select" || activeTool === "marker") return;

    isDrawingRef.current = false;

    if (startPointRef.current) {
      const startX = startPointRef.current.x;
      const startY = startPointRef.current.y;
      const endPoint = currentPathRef.current[currentPathRef.current.length - 1] || startPointRef.current;

      const newObject: DrawnObject = {
        id: uuidv4(),
        type: activeTool as "pen" | "rectangle" | "circle",
        x: startX,
        y: startY,
        width: endPoint.x - startX,
        height: endPoint.y - startY,
        color: selectedColor,
        points: activeTool === "pen" ? [...currentPathRef.current] : undefined,
      };

      setDrawnObjects((prev) => [...prev, newObject]);
    }

    startPointRef.current = null;
    currentPathRef.current = [];
  }, [activeTool, selectedColor]);

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev + delta)));
  }, []);

  const handleAddMarker = useCallback((marker: BattleMarker) => {
    setMarkers((prev) => [...prev, marker]);
  }, []);

  const handleClear = useCallback(() => {
    setDrawnObjects([]);
    setMarkers([]);
  }, []);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    setDrawnObjects((prev) => {
      const newObjects = [...prev];
      newObjects.pop();
      return newObjects;
    });
  }, []);

  const handleRedo = useCallback(() => {
    // Redo is not fully implemented in this simple version
    // Would need a history stack for full redo support
  }, []);

  const canUndo = drawnObjects.length > 0;
  const canRedo = false;

  // Handle marker drag
  const handleMarkerDrag = useCallback((id: string, x: number, y: number) => {
    setMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, x, y } : m)));
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)] w-full">
      {/* Tools bar */}
      <div className="flex items-start gap-4 mb-4">
        <ToolPanel
          activeTool={activeTool}
          selectedColor={selectedColor}
          zoom={zoom}
          onToolChange={setActiveTool}
          onColorChange={setSelectedColor}
          onAddMarker={handleAddMarker}
          onClear={handleClear}
          onZoomIn={() => setZoom((prev) => Math.min(5, prev + 0.1))}
          onZoomOut={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
          onResetZoom={() => setZoom(1)}
          onFitMap={fitMap}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden rounded-[1.75rem] border border-white/10"
        onWheel={handleWheel}
      >
        {/* Map image - fits container, scales with zoom */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url(/maps/map1.png)",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Canvas for drawing - positioned over map */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ touchAction: "none" }}
        />

        {/* Markers - draggable */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute cursor-move select-none"
            style={{ 
              left: `${marker.x}%`, 
              top: `${marker.y}%`,
            }}
            onMouseDown={(e) => {
              if (activeTool !== "select" && activeTool !== "marker") return;

              const container = e.currentTarget.parentElement;
              if (!container) return;

              const rect = container.getBoundingClientRect();
              const offsetX = e.clientX - (marker.x / 100) * rect.width;
              const offsetY = e.clientY - (marker.y / 100) * rect.height;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newX = ((moveEvent.clientX - offsetX) / rect.width) * 100;
                const newY = ((moveEvent.clientY - offsetY) / rect.height) * 100;
                handleMarkerDrag(marker.id, Math.max(0, Math.min(100, newX)), Math.max(0, Math.min(100, newY)));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full text-lg shadow-lg border-2 border-white"
              style={{ backgroundColor: marker.color }}
            >
              {marker.icon}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-slate-950/90 rounded text-xs text-white whitespace-nowrap">
              {marker.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}