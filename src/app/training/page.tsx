"use client";

import { useEffect } from "react";

export default function TrainingPage() {
  useEffect(() => {
    window.location.replace("/volunteer/training/index.html");
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <p className="hub-kicker text-navy mb-2">Volunteer Training</p>
      <h1 className="text-2xl font-serif mb-4">Opening Training Modules...</h1>
      <p className="text-sm text-[#555] mb-6">Redirecting you to the interactive curriculum.</p>
      <a
        href="/volunteer/training/index.html"
        className="hub-btn bg-[#222] px-5 py-2 text-white hover:bg-navy"
      >
        Click here if not redirected automatically
      </a>
      <meta httpEquiv="refresh" content="0;url=/volunteer/training/index.html" />
    </div>
  );
}
