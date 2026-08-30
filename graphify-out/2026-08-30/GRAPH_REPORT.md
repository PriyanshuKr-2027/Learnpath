# Graph Report - dsa-dashboard  (2026-08-29)

## Corpus Check
- 100 files · ~76,554 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 346 nodes · 613 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 38,692 input · 1,271 output

## Community Hubs (Navigation)
- Admin & User Management Views
- User Dashboard & State Management
- Runtime Dependencies & Libraries
- Learning Canvas & Interactive Roadmap
- TypeScript & Next.js Compiler Setup
- Development Tooling & PostCSS
- Adaptive CAT Assessments & YouTube Search
- Onboarding Flow & GitHub Telemetry
- AI Goal & Resume Intelligence
- Learner Persistence & Storage APIs
- Core Algorithms & Architectural Specs
- Markdown Rendering Engine
- Authentication Middleware & Session Proxy
- Agent Workflows & Graph Visualizer
- AI Coaching & Socratic Guidance
- ESLint Rules & Standards
- Next.js Application Configuration
- PostCSS Styling Architecture
- LearnPath AI Domain Taxonomy

## God Nodes (most connected - your core abstractions)
1. `useSupabase()` - 17 edges
2. `LevelNode` - 16 edges
3. `compilerOptions` - 16 edges
4. `mockStore` - 13 edges
5. `createClient()` - 12 edges
6. `SkillEntry` - 12 edges
7. `getNextGeminiApiKey()` - 11 edges
8. `LearningPath` - 10 edges
9. `getNextGroqApiKey()` - 9 edges
10. `generateLearningPathFromProfile()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Graph Visualizer` --implements--> `graphify`  [INFERRED]
  public/graph.html → AGENTS.md
- `SettingsPage()` --calls--> `useSupabase()`  [EXTRACTED]
  src/app/(app)/settings/page.tsx → src/components/providers/SupabaseProvider.tsx
- `Project Specification` --references--> `Kahn's Topological Sort`  [EXTRACTED]
  docs/PROJECT_SPECIFICATION.md → README.md
- `Project Specification` --references--> `1-PL Rasch IRT Model`  [EXTRACTED]
  docs/PROJECT_SPECIFICATION.md → README.md
- `LeaderboardPage()` --calls--> `useSupabase()`  [EXTRACTED]
  src/app/(app)/leaderboard/page.tsx → src/components/providers/SupabaseProvider.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Autonomous Adaptive Learning Loop** — kahns_topological_sort, rasch_irt_model, skill_delta_matrix [EXTRACTED 0.90]
- **Graphify Knowledge Management** — agents_readme, graphify_tool, public_graph_html [EXTRACTED 0.95]

## Communities (22 total, 6 thin omitted)

### Community 0 - "Admin & User Management Views"
Cohesion: 0.06
Nodes (40): AdminPage(), AdminUserDetailPage(), ActivityItem, LeaderboardPage(), LeaderboardUser, DBUser, Friendship, GroupChat (+32 more)

### Community 1 - "User Dashboard & State Management"
Cohesion: 0.07
Nodes (36): DashboardPage(), SettingsPage(), FlashcardDeck(), FlashcardDeckProps, VideoPlayerWithControls(), VideoPlayerWithControlsProps, ScheduledTopoNode, scheduleNodesWithKahns() (+28 more)

### Community 2 - "Runtime Dependencies & Libraries"
Cohesion: 0.06
Nodes (35): clsx, @google/generative-ai, lucide-react, motion, next, dependencies, clsx, @google/generative-ai (+27 more)

### Community 3 - "Learning Canvas & Interactive Roadmap"
Cohesion: 0.12
Nodes (18): MarkdownNotesEditor(), MarkdownNotesEditorProps, Message, QUICK_PROMPTS, SocraticCopilotSidecar(), SocraticCopilotSidecarProps, CandyCrushMap(), CandyCrushMapProps (+10 more)

### Community 4 - "TypeScript & Next.js Compiler Setup"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "Development Tooling & PostCSS"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 6 - "Adaptive CAT Assessments & YouTube Search"
Cohesion: 0.15
Nodes (18): formatDuration(), GET(), parseISO8601Duration(), YouTubeSearchItem, YouTubeVideoDetails, CATAssessmentPage(), calculateProbabilityOfSuccess(), DEFAULT_INITIAL_THETA (+10 more)

### Community 7 - "Onboarding Flow & GitHub Telemetry"
Cohesion: 0.21
Nodes (14): OnboardingPage(), QUICK_GOAL_PRESETS, UnifiedOnboardingModalContent(), GitHubTelemetryCard(), GitHubTelemetryCardProps, ResumeDropzone(), ResumeDropzoneProps, SkillSliderMatrix() (+6 more)

### Community 8 - "AI Goal & Resume Intelligence"
Cohesion: 0.25
Nodes (15): GoalExtractResult, POST(), POST(), ResumeParseResult, POST(), getNextIndexAtomic(), buildGeminiPool(), buildGroqPool() (+7 more)

### Community 9 - "Learner Persistence & Storage APIs"
Cohesion: 0.22
Nodes (8): GET(), POST(), GET(), POST(), GET(), POST(), createAdminClient(), createClient()

### Community 10 - "Core Algorithms & Architectural Specs"
Cohesion: 0.53
Nodes (5): CourseOs Split Canvas, Project Specification, Kahn's Topological Sort, 1-PL Rasch IRT Model, Skill Gap Delta Matrix

### Community 11 - "Markdown Rendering Engine"
Cohesion: 0.50
Nodes (3): MarkdownRenderer(), MarkdownRendererProps, renderFormattedText()

### Community 12 - "Authentication Middleware & Session Proxy"
Cohesion: 0.60
Nodes (3): updateSession(), config, proxy()

## Knowledge Gaps
- **99 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Runtime Dependencies & Libraries` to `Development Tooling & PostCSS`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useSupabase()` connect `Admin & User Management Views` to `User Dashboard & State Management`, `Onboarding Flow & GitHub Telemetry`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin & User Management Views` be split into smaller, more focused modules?**
  _Cohesion score 0.056866303690260134 - nodes in this community are weakly interconnected._
- **Should `User Dashboard & State Management` be split into smaller, more focused modules?**
  _Cohesion score 0.0746606334841629 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies & Libraries` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Learning Canvas & Interactive Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.12183908045977011 - nodes in this community are weakly interconnected._