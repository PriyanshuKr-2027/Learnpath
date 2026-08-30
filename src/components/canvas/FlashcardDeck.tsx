"use client";

import React, { useState, useEffect } from "react";
import {
  Cards,
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  CheckCircle,
  Sparkle,
  Lightbulb,
  Code,
} from "@phosphor-icons/react";
import { Flashcard } from "@/types";

interface FlashcardDeckProps {
  flashcards?: Flashcard[];
  title?: string;
}

export function FlashcardDeck({ flashcards = [], title = "Remedial Concept Flashcards" }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex] || flashcards[0];
  const isCurrentMastered = masteredIds.includes(currentCard.id);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleToggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) =>
      prev.includes(currentCard.id)
        ? prev.filter((id) => id !== currentCard.id)
        : [...prev, currentCard.id]
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flashcards.length]);

  return (
    <div className="flex flex-col gap-3.5 p-5 rounded-3xl border border-orange-500/30 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <Cards className="w-5 h-5" weight="fill" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              {title}
            </h3>
            <span className="text-[10px] text-orange-400/90 font-medium">
              Surgical Remediation * Click card or press Space to flip
            </span>
          </div>
        </div>

        {/* Progress & Card Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
        <div
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
        />
      </div>

      {/* 3D Flip Card Arena */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full min-h-[220px] rounded-2xl cursor-pointer select-none transition-all duration-300 group [perspective:1000px]"
      >
        <div
          className={`w-full h-full min-h-[220px] rounded-2xl p-6 flex flex-col justify-between border transition-all duration-500 [transform-style:preserve-3d] ${
            isFlipped
              ? "border-focus/40 bg-zinc-950/95 shadow-xl shadow-focus/5 [transform:rotateY(180deg)]"
              : "border-orange-500/30 bg-gradient-to-br from-zinc-950 to-zinc-900/90 shadow-xl shadow-orange-500/5 hover:border-orange-400/50"
          }`}
        >
          {/* FRONT SIDE (Prompt / Question) */}
          {!isFlipped ? (
            <div className="flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wider font-mono">
                  {currentCard.category}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-orange-400 transition-colors">
                  <ArrowsClockwise className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Flip Answer</span>
                </div>
              </div>

              <div className="my-auto py-2">
                <h4 className="text-sm sm:text-base font-bold text-zinc-100 leading-snug">
                  {currentCard.front}
                </h4>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                <span className="flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Click to test recall
                </span>
                {isCurrentMastered && (
                  <span className="text-focus font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Mastered
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* BACK SIDE (Solution / Core Rule) */
            <div className="flex flex-col justify-between h-full gap-3 [transform:rotateY(180deg)]">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-focus/10 text-focus border border-focus/20 uppercase tracking-wider font-mono">
                  Solution & Core Takeaway
                </span>

                <button
                  type="button"
                  onClick={handleToggleMastered}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isCurrentMastered
                      ? "bg-focus text-zinc-950 shadow-md shadow-focus/20"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                  <span>{isCurrentMastered ? "Mastered  " : "Mark Mastered"}</span>
                </button>
              </div>

              <div className="my-auto py-1">
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {currentCard.back}
                </p>

                {currentCard.codeSnippet && (
                  <div className="mt-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    <pre>{currentCard.codeSnippet}</pre>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                <span>Click to flip back</span>
                <span className="text-zinc-400 font-mono">Card {currentIndex + 1} of {flashcards.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handlePrev}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowsClockwise className="w-3.5 h-3.5 text-orange-400" />
          <span>Flip (Space)</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-3.5 py-2 rounded-xl bg-focus hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-focus/20 cursor-pointer"
        >
          <span>Next Card</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
