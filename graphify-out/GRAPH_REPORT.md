# Graph Report - dsa-dashboard  (2026-08-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 354 nodes · 618 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f35fed4c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- roadmap/page.tsx
- cat/page.tsx
- dependencies
- useSupabase
- compilerOptions
- devDependencies
- getNextGeminiApiKey
- mockStore.ts
- socialStore.ts
- createClient
- resourceBlending.ts
- MarkdownRenderer.tsx
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `useSupabase()` - 19 edges
2. `compilerOptions` - 16 edges
3. `getNextGeminiApiKey()` - 13 edges
4. `mockStore` - 13 edges
5. `LevelNode` - 12 edges
6. `createClient()` - 12 edges
7. `SkillEntry` - 11 edges
8. `LearningPath` - 10 edges
9. `generateLearningPathFromProfile()` - 9 edges
10. `getNextGroqApiKey()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `ProfilePage()` --calls--> `useSupabase()`  [EXTRACTED]
  src/app/(app)/profile/page.tsx → src/components/providers/SupabaseProvider.tsx
- `SocialStudyRoomPage()` --calls--> `useSupabase()`  [EXTRACTED]
  src/app/(app)/social/page.tsx → src/components/providers/SupabaseProvider.tsx
- `FlashcardDeckProps` --references--> `Flashcard`  [EXTRACTED]
  src/components/canvas/FlashcardDeck.tsx → src/types/index.ts
- `UnifiedOnboardingModalContent()` --calls--> `generateLearningPathFromProfile()`  [EXTRACTED]
  src/components/layout/SetupModal.tsx → src/lib/services/mockStore.ts
- `OnboardingPage()` --calls--> `generateLearningPathFromProfile()`  [EXTRACTED]
  src/app/onboarding/page.tsx → src/lib/services/mockStore.ts

## Import Cycles
- None detected.

## Communities (20 total, 3 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.08
Nodes (33): ProfilePage(), inter, jetbrainsMono, metadata, OnboardingPage(), QUICK_GOAL_PRESETS, UnifiedOnboardingModalContent(), GitHubTelemetryCard() (+25 more)

### Community 1 - "roadmap/page.tsx"
Cohesion: 0.08
Nodes (23): StudyNoteItem, MarkdownNotesEditor(), MarkdownNotesEditorProps, Message, QUICK_PROMPTS, SocraticCopilotSidecar(), SocraticCopilotSidecarProps, VideoPlayerWithControls() (+15 more)

### Community 2 - "cat/page.tsx"
Cohesion: 0.09
Nodes (27): extractChapterBoundaries(), formatDuration(), GET(), parseISO8601Duration(), YouTubeSearchItem, YouTubeVideoDetails, CATAssessmentContent(), FlashcardDeckProps (+19 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (35): clsx, @google/generative-ai, lucide-react, motion, next, dependencies, clsx, @google/generative-ai (+27 more)

### Community 4 - "useSupabase"
Cohesion: 0.09
Nodes (25): AdminPage(), AdminUserDetailPage(), ActivityItem, LeaderboardPage(), LeaderboardUser, SettingsPage(), emptySubscribe(), LoginPage() (+17 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 7 - "getNextGeminiApiKey"
Cohesion: 0.23
Nodes (16): GoalExtractResult, POST(), POST(), ResumeParseResult, POST(), getNextIndexAtomic(), buildGeminiPool(), buildGroqPool() (+8 more)

### Community 8 - "mockStore.ts"
Cohesion: 0.15
Nodes (15): DashboardPage(), MOCK_14_DAY_ACTIVITY, ScheduledTopoNode, scheduleNodesWithKahns(), TopoNodeInput, calculateRemediationCoordinate(), Coordinate, generateSerpentineCoordinates() (+7 more)

### Community 9 - "socialStore.ts"
Cohesion: 0.15
Nodes (17): SocialStudyRoomPage(), SocialTab, Contributor, DEFAULT_ACTIVE_STUDIERS, DEFAULT_CHALLENGES, DEFAULT_CONTRIBUTORS, DEFAULT_DOUBTS, DEFAULT_GROUPS (+9 more)

### Community 10 - "createClient"
Cohesion: 0.24
Nodes (8): GET(), POST(), GET(), POST(), GET(), POST(), createAdminClient(), createClient()

### Community 11 - "resourceBlending.ts"
Cohesion: 0.40
Nodes (5): calculateBlendedScore(), calculateSemanticRelevance(), CandidateResourceInput, CONCEPT_SYNONYM_MAP, ResourceScore

### Community 12 - "MarkdownRenderer.tsx"
Cohesion: 0.50
Nodes (3): MarkdownRenderer(), MarkdownRendererProps, renderFormattedText()

### Community 13 - "proxy.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, proxy()

## Knowledge Gaps
- **112 isolated node(s):** `CATSession`, `NodeStatus`, `Problem`, `RoleSkillRequirement`, `SkillSliderMatrixProps` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSupabase()` connect `useSupabase` to `index.ts`, `socialStore.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `CATSession`, `NodeStatus`, `Problem` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08081632653061224 - nodes in this community are weakly interconnected._
- **Should `roadmap/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08232118758434548 - nodes in this community are weakly interconnected._
- **Should `cat/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._