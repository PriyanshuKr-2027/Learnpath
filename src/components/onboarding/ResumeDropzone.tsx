"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Loader2, Sparkles, FileText } from "lucide-react";
import { ProjectEntry, SkillEntry } from "@/types";

interface ResumeDropzoneProps {
  onParsed: (data: { skills: SkillEntry[]; certifications: string[]; projects: ProjectEntry[] }) => void;
  apiKey?: string;
}

const SAMPLE_RESUME_TEXT = `
Alex Dev - Software & Data Practitioner
Experience:
- Junior Developer at TechFlow (2 Years): Analyzed customer churn datasets using Python (Pandas, NumPy) and wrote intermediate SQL queries (PostgreSQL, Joins, Aggregations) to automate monthly executive reports.
- Built interactive Excel models and basic Power BI dashboards for business stakeholders.
Certifications:
- Google Data Analytics Professional Certificate
Projects:
- E-Commerce Sales Performance Dashboard (Python, Pandas, SQL, Power BI)
- Machine Learning Iris & Titanic Classification (Scikit-Learn, Python)
`;

export function ResumeDropzone({ onParsed, apiKey }: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFileName, setParsedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParseText = async (text: string, fileName: string) => {
    setIsParsing(true);
    setParsedFileName(fileName);

    try {
      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, fileName, apiKey }),
      });

      if (res.ok) {
        const data = await res.json();
        onParsed(data);
      }
    } catch (e) {
      console.error("Resume parse error:", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseText(content || SAMPLE_RESUME_TEXT, file.name);
    };
    reader.readAsText(file);
  };

  const handleSampleResume = () => {
    handleParseText(SAMPLE_RESUME_TEXT, "Alex_Dev_Resume.pdf");
  };

  return (
    <div className="flex flex-col gap-3 h-full justify-between">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const content = evt.target?.result as string;
              handleParseText(content || SAMPLE_RESUME_TEXT, file.name);
            };
            reader.readAsText(file);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 min-h-[220px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-focus bg-focus/10 scale-[1.01]"
            : parsedFileName
            ? "border-signal/50 bg-signal/5"
            : "border-border hover:border-focus/40 bg-paper hover:bg-surface"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.md"
          className="hidden"
          onChange={handleFileChange}
        />

        {isParsing ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-8 h-8 text-focus animate-spin" />
            <p className="text-sm text-text-primary font-medium">Extracting technical skills with AI...</p>
            <span className="text-xs text-text-secondary">Reading entities & project stacks</span>
          </div>
        ) : parsedFileName ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle2 className="w-9 h-9 text-signal" />
            <p className="text-sm font-semibold text-text-primary">{parsedFileName}</p>
            <span className="text-xs text-signal font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Successfully parsed skills and projects
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-secondary shadow-sm">
              <UploadCloud className="w-6 h-6 text-focus" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Click to upload or drag & drop your <span className="text-focus font-semibold">Resume PDF</span>
              </p>
              <p className="text-xs text-text-secondary mt-0.5">Supports PDF, TXT, Markdown (Max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-text-secondary">Don&apos;t have a PDF ready?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSampleResume();
          }}
          className="text-xs font-medium text-focus hover:text-focus/80 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-focus/10 hover:bg-focus/20 border border-focus/20 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Use 1-Click Sample Resume
        </button>
      </div>
    </div>
  );
}
