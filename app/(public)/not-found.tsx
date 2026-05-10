import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ur" dir="rtl">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 font-urdu">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-3">صفحہ نہیں ملا</h1>
          <p className="text-slate-600 mb-6">جس صفحے کی آپ تلاش کر رہے ہیں وہ موجود نہیں۔</p>
          <Link href="/" className="inline-flex items-center gap-2 text-brand font-medium">
            ← گھر واپس جائیں
          </Link>
        </div>
      </body>
    </html>
  );
}
