"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const [nationalId, setNationalId] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const submit = async (e: any) => {
    e.preventDefault();
    setMsg("جاري التحقق...");
    const res = await fetch("/api/auth/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ national_id: nationalId, pin_4: pin }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("✅ تم الدخول بنجاح");
      router.push("/student/exam");
    } else {
      setMsg(`❌ ${data.error}`);
    }
  };

  return (
    <section className="section max-w-md mx-auto text-center">
      <h1 className="h1 mb-4">تسجيل دخول الطالب</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input
          className="input"
          placeholder="الرقم الوطني"
          value={nationalId}
          onChange={(e) => setNationalId(e.target.value)}
        />
        <input
          className="input"
          placeholder="رمز PIN (4 أرقام)"
          type="password"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          دخول
        </button>
        <div className="muted text-sm">{msg}</div>
      </form>
    </section>
  );
}
