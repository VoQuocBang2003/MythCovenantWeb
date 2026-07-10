"use client";

import { useState, useEffect, useCallback } from "react";
import type { BattleMarker } from "@/types/marker";

const STORAGE_KEY = "battle-map-markers";

export function useMarkers() {
  const [markers, setMarkers] = useState<BattleMarker[]>([]);

  // Load markers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMarkers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved markers:", e);
      }
    }
  }, []);

  // Save markers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  }, [markers]);

  // Add a new marker
  const addMarker = useCallback((marker: BattleMarker) => {
    setMarkers((prev) => [...prev, marker]);
  }, []);

  // Update a marker
  const updateMarker = useCallback((id: string, updates: Partial<BattleMarker>) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  // Delete a marker
  const deleteMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  return {
    markers,
    addMarker,
    updateMarker,
    deleteMarker,
    clearMarkers,
  };
}