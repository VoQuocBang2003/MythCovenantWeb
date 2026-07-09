"use client";

import { useState } from "react";

export default function BackgroundVideo() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,190,92,0.18),_transparent_32%),linear-gradient(135deg,_#070b16_0%,_#111827_100%)] z-0" />
    );
  }

  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        onError={() => setHasError(true)}
      >
        <source src="https://yysls-build-na.fp.ps.easebar.com/file/690c691d71f08da387bae4c7LU88eShI03" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-slate-950/40 z-0" />
    </>
  );
}