"use client";

import React, { useState } from "react";
import { Plus, Trash, Sparkle, Sliders, Check } from "@phosphor-icons/react";
import { SkillEntry, SkillSource } from "@/types";

interface SkillSliderMatrixProps {
  skills: SkillEntry[];
  onChange: (updatedSkills: SkillEntry[]) => void;
}

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

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;

    const updated = [
      ...skills,
      {
        name: newSkillName.trim(),
        source: "manual" as SkillSource,
        currentProficiency: newSkillProf,
        evidence: "Manually added during onboarding confirmation",
      },
    ];
    onChange(updated);
    setNewSkillName("");
    setNewSkillProf(50);
  };

  const getSourceBadge = (source: SkillSource) => {
    switch (source) {
      case "resume":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📄 Resume</span>;
      case "github":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">🐙 GitHub</span>;
      case "inferred":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">🧠 AI Inferred</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">✍️ Stated</span>;
    }
  };

  const getSliderTrackColor = (val: number) => {
    if (val >= 70) return "accent-emerald-500";
    if (val >= 40) return "accent-amber-500";
    return "accent-rose-500";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Confirmed Skill Proficiencies (0% – 100%)
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Adjust your current proficiency to calculate your precise learning delta
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300">
          {skills.length} Skills Calibrated
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {skills.map((skill, idx) => (
          <div
            key={skill.name}
            className="flex flex-col gap-2 p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-100">{skill.name}</span>
                {getSourceBadge(skill.source)}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-zinc-200 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  {skill.currentProficiency}%
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove skill"
                >
                  <Trash className="w-4 h-4" />
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
                className={`w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer ${getSliderTrackColor(
                  skill.currentProficiency
                )}`}
              />
            </div>

            {skill.evidence && (
              <p className="text-[11px] text-zinc-500 truncate">{skill.evidence}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Skill Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Add other skill (e.g. Docker, Rust)..."
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
        />
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1.5">
          <span className="text-[11px] text-zinc-400 font-mono">{newSkillProf}%</span>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={newSkillProf}
            onChange={(e) => setNewSkillProf(parseInt(e.target.value, 10))}
            className="w-16 h-1 bg-zinc-800 rounded-lg cursor-pointer accent-emerald-500"
          />
        </div>
        <button
          type="button"
          disabled={!newSkillName.trim()}
          onClick={handleAddSkill}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" weight="bold" />
          Add
        </button>
      </div>
    </div>
  );
}
