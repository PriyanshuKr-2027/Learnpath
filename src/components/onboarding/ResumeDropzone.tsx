"use client";

import React, { useState, useRef } from "react";
import { FileText, UploadSimple, CheckCircle, SpinnerGap, Sparkle } from "@phosphor-icons/react";
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

    // Read text from file
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
    <div className="flex flex-col gap-3">
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
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
            : parsedFileName
            ? "border-emerald-500/50 bg-emerald-950/20"
            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900"
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
            <SpinnerGap className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-zinc-300 font-medium">Extracting technical skills with AI...</p>
            <span className="text-xs text-zinc-500">Reading entities & project stacks</span>
          </div>
        ) : parsedFileName ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle className="w-9 h-9 text-emerald-400" weight="fill" />
            <p className="text-sm font-semibold text-zinc-100">{parsedFileName}</p>
            <span className="text-xs text-emerald-400/90 font-medium">
              ✅ Successfully parsed skills & projects
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
              <UploadSimple className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Click to upload or drag & drop your <span className="text-emerald-400">Resume PDF</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Supports PDF, TXT, Markdown (Max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Button for Hackathon Judges */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-zinc-500">Don't have a PDF ready?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSampleResume();
          }}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
        >
          <Sparkle className="w-3.5 h-3.5" />
          Use 1-Click Sample Resume
        </button>
      </div>
    </div>
  );
}
