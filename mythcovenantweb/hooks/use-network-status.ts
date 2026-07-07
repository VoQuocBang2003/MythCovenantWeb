"use client";

import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return isOnline;
}