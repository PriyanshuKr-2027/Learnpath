import Link from "next/link";
import {
  Compass,
  House,
  MapTrifold,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-paper text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-focus/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-warning/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10 p-8 rounded-3xl border border-border bg-surface/80 backdrop-blur-xl shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-focus/15 border border-focus/30 text-focus flex items-center justify-center mx-auto shadow-xl shadow-focus/20 animate-bounce duration-1000">
          <Compass className="w-10 h-10" weight="duotone" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-focus/10 text-focus border border-focus/25 inline-flex items-center gap-1.5">
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            404 Error - Coordinate Not In DAG
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            The milestone, route, or resource you were looking for does not exist in this knowledge graph or may have been pruned during curriculum synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2 text-left">
          <Link
            href="/dashboard"
            className="p-3.5 rounded-2xl bg-paper hover:bg-border/60 border border-border flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-focus/10 text-focus flex items-center justify-center">
                <House className="w-4 h-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary block group-hover:text-focus transition-colors">
                  Return to Dashboard
                </span>
                <span className="text-[10px] text-text-secondary">View active milestones and readiness</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-focus group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/roadmap"
            className="p-3.5 rounded-2xl bg-paper hover:bg-border/60 border border-border flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <MapTrifold className="w-4 h-4" weight="bold" />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary block group-hover:text-warning transition-colors">
                  Candy Crush Roadmap
                </span>
                <span className="text-[10px] text-text-secondary">Navigate the Kahn DAG path</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-text-secondary group-hover:text-warning group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary font-semibold transition-colors"
          >
            <span>Back to Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
