"use client";

import { TldrawBattleMap } from "@/components/battle-map/tldraw-battle-map";
import type { BattleMarker } from "@/types/marker";

export default function BattleMapPage() {
  const handleMarkersChange = (markers: BattleMarker[]) => {
    // This is called when markers change, can be used for additional logic
    console.log("Markers updated:", markers);
  };

  return (
    <div className="h-full min-h-[calc(100vh-100px)]">
      <TldrawBattleMap onMarkersChange={handleMarkersChange} />
    </div>
  );
}