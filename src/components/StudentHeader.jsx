"use client";
import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

export default function StudentHeader() {
  const [p, setP] = useState({ progress_percent: 0 });

  useEffect(() => {
    fetch("/api/student/progress")
      .then((r) => r.json())
      .then((d) => d?.progress && setP(d.progress))
      .catch(() => {});
  }, []);

  return <ProgressBar value={p.progress_percent || 0} label="Progress" />;
}
