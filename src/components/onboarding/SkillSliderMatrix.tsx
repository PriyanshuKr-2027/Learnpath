"use client";

import React, { useState } from "react";
import { Sliders, Trash2, Plus, FileText, Sparkles, UserCheck, Code } from "lucide-react";
import { SkillEntry, SkillSource } from "@/types";

interface SkillSliderMatrixProps {
  skills: SkillEntry[];
  onChange: (updatedSkills: SkillEntry[]) => void;
}

const QUICK_SKILL_SUGGESTIONS = [
  "Docker",
  "TypeScript",
  "PostgreSQL",
  "Pandas & DataFrames",
  "PyTorch & Deep Learning",
  "DAX & Power BI",
  "Kafka & Event Streams",
  "AWS Cloud",
  "System Architecture",
];

export function SkillSliderMatrix({ skills, onChange }: SkillSliderMatrixProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProf, setNewSkillProf] = useState(50);

  const handleSliderChange = (index: number, value: number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], currentProficiency: value };
    onChange(updated);
  };

  const handleDeleteSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddSkillByName = (nameToAdd: string, prof = 50) => {
    if (!nameToAdd.trim()) return;
    const exists = skills.some((s) => s.name.toLowerCase() === nameToAdd.trim().toLowerCase());
    if (exists) return;

    const updated = [
      ...skills,
      {
        name: nameToAdd.trim(),
        source: "manual" as SkillSource,
        currentProficiency: prof,
        evidence: "Manually added skill",
      },
    ];
    onChange(updated);
  };

  const handleAddSkill = () => {
    handleAddSkillByName(newSkillName, newSkillProf);
    setNewSkillName("");
    setNewSkillProf(50);
  };

  const getSourceTag = (source: SkillSource) => {
    switch (source) {
      case "resume":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-focus/10 text-focus border border-focus/20">
            <FileText className="w-3 h-3" />
            Resume
          </span>
        );
      case "github":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-signal/10 text-signal border border-signal/20">
            <Code className="w-3 h-3" />
            GitHub
          </span>
        );
      case "inferred":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-warning/10 text-warning border border-warning/20">
            <Sparkles className="w-3 h-3" />
            Inferred
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-paper text-text-secondary border border-border">
            <UserCheck className="w-3 h-3" />
            Added
          </span>
        );
    }
  };

  const masteredCount = skills.filter((s) => s.currentProficiency >= 75).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-focus" />
            Confirmed Skill Proficiencies (0%  -  100%)
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Adjust your current proficiency to calculate your precise learning delta. Skills &ge; 75% are automatically bypassed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {masteredCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-signal/10 text-signal border border-signal/20 flex items-center gap-1">
                {masteredCount} Mastered (Bypassed)
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-paper border border-border text-text-secondary">
            {skills.length} Skills Calibrated
          </span>
        </div>
      </div>

      {/* Skills Slider List */}
      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {skills.map((skill, idx) => {
          const isMastered = skill.currentProficiency >= 75;
          return (
            <div
              key={skill.name}
              className={`flex flex-col gap-2.5 p-3.5 rounded-xl border transition-all ${
                isMastered
                  ? "border-signal/30 bg-signal/5"
                  : "border-border bg-paper hover:border-focus/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{skill.name}</span>
                  {getSourceTag(skill.source)}
                  {isMastered && (
                    <span className="text-[10px] font-bold text-signal bg-signal/10 px-2 py-0.5 rounded-full border border-signal/20">
                      Bypassed in Roadmap
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border shadow-sm ${
                      isMastered
                        ? "bg-signal/15 text-signal border-signal/30"
                        : "bg-surface text-text-primary border-border"
                    }`}
                  >
                    {skill.currentProficiency}%
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(idx)}
                    className="text-text-secondary hover:text-alert p-1 rounded transition-colors cursor-pointer"
                    title="Remove skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={skill.currentProficiency}
                  onChange={(e) => handleSliderChange(idx, parseInt(e.target.value, 10))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer border border-border ${
                    isMastered ? "accent-signal bg-signal/10" : "accent-focus bg-surface"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Suggestion Chips */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-focus" /> Quick-add popular tech skills:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SKILL_SUGGESTIONS.map((sug) => {
            const alreadyAdded = skills.some((s) => s.name.toLowerCase() === sug.toLowerCase());
            if (alreadyAdded) return null;
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddSkillByName(sug, 50)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-paper hover:bg-surface border border-border text-text-secondary hover:text-focus transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3 h-3" />
                {sug}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Skill Row */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Add custom skill (e.g. Terraform, GraphQL)..."
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          className="flex-1 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-focus/50 shadow-sm"
        />
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 shadow-sm">
          <span className="text-xs text-text-primary font-mono font-semibold">{newSkillProf}%</span>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={newSkillProf}
            onChange={(e) => setNewSkillProf(parseInt(e.target.value, 10))}
            className="w-16 h-1.5 bg-paper rounded-lg cursor-pointer accent-focus"
          />
        </div>
        <button
          type="button"
          disabled={!newSkillName.trim()}
          onClick={handleAddSkill}
          className="px-3.5 py-2.5 rounded-xl bg-focus hover:bg-focus/90 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
