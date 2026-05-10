"use client";
import { useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id} className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : it.id)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-slate-50"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-base sm:text-lg">{it.question}</span>
              <span className={`text-2xl transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            {isOpen ? (
              <div className="px-5 pb-4 text-slate-700 animate-fade-in">
                {it.answer.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i} className="mb-2 last:mb-0">{p}</p>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
