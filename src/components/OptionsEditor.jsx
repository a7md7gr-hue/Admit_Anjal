"use client";
import { useState, useEffect } from "react";

export default function OptionsEditor({ value, onChange }) {
  const [opts, setOpts] = useState(
    Array.isArray(value) && value.length
      ? value
      : [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
        ],
  );

  // بلّغ الأب بأي تغيير
  useEffect(() => {
    onChange?.(opts);
  }, [opts]); // eslint-disable-line

  const setText = (i, text) =>
    setOpts((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, option_text: text } : o)),
    );

  const setCorrect = (i) =>
    setOpts((prev) => prev.map((o, idx) => ({ ...o, is_correct: idx === i })));

  const addOption = () =>
    setOpts((prev) => [...prev, { option_text: "", is_correct: false }]);

  const removeOption = (i) =>
    setOpts((prev) => {
      const next = prev.slice();
      next.splice(i, 1);
      if (next.length && !next.some((o) => o.is_correct))
        next[0].is_correct = true;
      return next;
    });

  return (
    <div className="space-y-3">
      {opts.map((o, i) => (
        <div key={i} className="flex items-center gap-3">
          <input
            type="radio"
            name="correct"
            checked={!!o.is_correct}
            onChange={() => setCorrect(i)}
            title="الإجابة الصحيحة"
          />
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder={`خيار ${i + 1}`}
            value={o.option_text || ""}
            onChange={(e) => setText(i, e.target.value)}
          />
          <button
            type="button"
            className="border px-3 py-2 rounded"
            onClick={() => removeOption(i)}
            disabled={opts.length <= 2}
          >
            حذف
          </button>
        </div>
      ))}

      <button
        type="button"
        className="border px-3 py-2 rounded"
        onClick={addOption}
      >
        + إضافة خيار
      </button>
    </div>
  );
}
