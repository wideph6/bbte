"use client";
import { useState } from "react";
import { ChevronIcon } from "./icons";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div
            key={it.id}
            className={`group rounded-2xl border bg-white/80 backdrop-blur-sm transition-all duration-200 ${
              isOpen
                ? "border-brand/30 shadow-glow ring-1 ring-brand/10"
                : "border-slate-200 shadow-soft hover:border-brand/20 hover:shadow-lift"
            }`}
          >
            <button
              onClick={() => setOpen(isOpen ? null : it.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
              aria-expanded={isOpen}
            >
              <span className={`flex-1 text-base sm:text-lg font-semibold transition-colors ${
                isOpen ? "text-brand-dark" : "text-slate-800"
              }`}>
                {it.question}
              </span>
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full transition-all duration-300 ${
                  isOpen
                    ? "bg-brand text-white rotate-180"
                    : "bg-brand/10 text-brand group-hover:bg-brand/15"
                }`}
                aria-hidden="true"
              >
                <ChevronIcon className="h-4 w-4" />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 -mt-1 text-slate-700 leading-loose">
                  {it.answer.split("\n").filter(Boolean).map((p, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
