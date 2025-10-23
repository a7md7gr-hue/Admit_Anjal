"use client";
import { useState } from "react";

export default function StudentLogin() {
  const [nid, setNid] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("Loading...");
    const r = await fetch("/api/auth/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ national_id: nid.trim(), pin_4: pin.trim() }),
    });
    const d = await r.json();
    if (!r.ok) {
      setMsg("❌ " + (d.error || "خطأ"));
      return;
    }
    location.href = "/student/exam";
  }

  return (
    <div className="section max-w-md mx-auto">
      <h1 className="h2 mb-3">دخول الطالب</h1>
      <div className="grid gap-2">
        <input
          className="input"
          placeholder="رقم الهوية"
          value={nid}
          onChange={(e) => setNid(e.target.value)}
        />
        <input
          className="input"
          placeholder="PIN — 4 أرقام"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={4}
        />
        <button className="btn btn-primary" onClick={login}>
          دخول
        </button>
        {msg && <div className="muted">{msg}</div>}
      </div>
    </div>
  );
}
