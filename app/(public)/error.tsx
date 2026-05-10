"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-urdu p-8" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">معذرت، کچھ غلط ہو گیا</h1>
        <p className="text-slate-600 mb-6">براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔</p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-brand text-white font-medium hover:bg-brand-dark"
        >
          دوبارہ کوشش کریں
        </button>
      </div>
    </div>
  );
}
