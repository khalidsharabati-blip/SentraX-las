"use client";

import { useState } from "react";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("اختر ملف أولاً");
      setSuccess(false);
      return;
    }

    const allowedTypes = ["application/pdf", "text/csv", "application/vnd.ms-excel"];
    const allowedExt = [".pdf", ".csv"];
    const fileExt = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedTypes.includes(file.type) || !allowedExt.includes(fileExt)) {
      setMessage("مسموح فقط ملفات PDF و CSV");
      setSuccess(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("الحد الأقصى 5MB");
      setSuccess(false);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setSuccess(true);
        setDownloadUrl(`/api/download/${data.fileName}`);
      } else {
        setMessage(data.message || "فشل الرفع");
        setSuccess(false);
      }
    } catch {
      setMessage("حدث خطأ في الاتصال");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded p-5 max-w-md">
      <h3 className="text-sm font-bold text-text-bright mb-4 flex items-center gap-2">
        <Upload className="w-4 h-4 text-accent" />
        رفع ملف (PDF / CSV)
      </h3>

      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded cursor-pointer hover:border-accent/50 transition">
        <FileText className="w-5 h-5 text-text-dim" />
        <span className="text-sm text-text-dim">
          {file ? file.name : "اختر ملف PDF أو CSV"}
        </span>
        <input
          type="file"
          accept=".pdf,.csv"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setMessage("");
            setDownloadUrl("");
            setSuccess(false);
          }}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full mt-3 py-2 bg-accent text-bg font-bold rounded hover:bg-accent/90 transition disabled:opacity-50 text-sm"
      >
        {loading ? "جاري الرفع..." : "رفع الملف"}
      </button>

      {message && (
        <p className={`mt-3 text-sm flex items-center gap-2 ${success ? "text-accent2" : "text-danger"}`}>
          {success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </p>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          className="mt-2 text-sm text-accent flex items-center gap-1.5 hover:underline"
        >
          <Download className="w-3.5 h-3.5" />
          تحميل الملف
        </a>
      )}
    </div>
  );
}
