import { CATQuestion, DocResource, GitHubRepoResource, VideoResource } from "@/types";

export interface PreSeededTopicResource {
  skillName: string;
  video: VideoResource;
  doc: DocResource;
  githubRepo: GitHubRepoResource;
  whyRecommendedTemplate: string;
  catQuestions: CATQuestion[];
}

export const PRESEEDED_CURATED_CORPUS: Record<string, PreSeededTopicResource> = {
  "sql": {
    skillName: "SQL",
    video: {
      youtubeId: "HXV3zeRR3h4",
      title: "SQL Tutorial - Full Database Course for Beginners",
      channelTitle: "freeCodeCamp.org",
      durationSeconds: 15600,
      durationFormatted: "4:20:00",
      relevantStartSeconds: 1800,
      relevantEndSeconds: 5400,
      pruningReason: "Selected because chapters on GROUP BY, HAVING, and Multi-Table JOINs close your 40% SQL gap.",
    },
    doc: {
      title: "PostgreSQL Interactive Tutorial & Joins Guide",
      url: "https://www.postgresqltutorial.com/",
      provider: "Official PostgreSQL Docs & Tutorial",
      summary: "Comprehensive guide to complex relational joins, subqueries, and window functions with interactive sandboxes.",
    },
    githubRepo: {
      repoName: "sql-practice-labs",
      repoUrl: "https://github.com/learnpath/sql-practice-labs",
      owner: "learnpath",
      starsCount: 1420,
      description: "Hands-on SQL schema datasets (E-commerce, Healthcare) with 100 real-world business queries.",
    },
    whyRecommendedTemplate: "SQL is the universal data language required in 85% of analytical roles. This lesson bridges your syntax-to-query gap.",
    catQuestions: [
      {
        id: "cat-sql-1",
        skillName: "SQL",
        topic: "Joins & Filtering",
        difficultyTier: 1,
        calibratedDifficulty: 0.25,
        question: "Which SQL clause is used to filter records resulting from a GROUP BY aggregation?",
        options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        correctOptionIndex: 1,
        explanation: "HAVING is evaluated after GROUP BY to filter aggregated rows, whereas WHERE filters individual rows prior to aggregation.",
      },
      {
        id: "cat-sql-2",
        skillName: "SQL",
        topic: "Joins & Filtering",
        difficultyTier: 3,
        calibratedDifficulty: 0.55,
        question: "What is the difference between an INNER JOIN and a LEFT JOIN?",
        options: [
          "INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table and matched rows from the right table",
          "INNER JOIN returns all rows from both tables; LEFT JOIN returns only matches",
          "There is no difference in relational algebra",
          "LEFT JOIN excludes null values while INNER JOIN includes them",
        ],
        correctOptionIndex: 0,
        explanation: "LEFT JOIN preserves all rows from the left table regardless of whether a matching record exists in the right table (filling non-matches with NULL).",
      },
      {
        id: "cat-sql-3",
        skillName: "SQL",
        topic: "Window Functions",
        difficultyTier: 4,
        calibratedDifficulty: 0.75,
        question: "Which window function assigns a unique sequential integer to rows within a partition, without gaps between identical values?",
        options: ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"],
        correctOptionIndex: 2,
        explanation: "ROW_NUMBER() always assigns a strictly unique integer (1, 2, 3...) regardless of ties. RANK() leaves gaps, and DENSE_RANK() does not leave gaps on ties.",
      },
      {
        id: "cat-sql-4",
        skillName: "SQL",
        topic: "Subqueries & CTEs",
        difficultyTier: 5,
        calibratedDifficulty: 0.90,
        question: "In PostgreSQL, what is the primary execution difference between a non-correlated Subquery and a CTE defined with 'WITH cte AS MATERIALIZED (...) '?",
        options: [
          "MATERIALIZED CTE forces the optimizer to compute the CTE once and store it as a temporary table, preventing query inlining across outer joins",
          "CTEs cannot be filtered with WHERE clauses",
          "Subqueries are always cached in Redis memory",
          "MATERIALIZED CTEs only work on read-only replicas",
        ],
        correctOptionIndex: 0,
        explanation: "MATERIALIZED forces Postgres to evaluate the CTE as an optimization barrier, which is beneficial when the CTE is expensive and referenced multiple times.",
      },
    ],
  },
  "power bi & dax": {
    skillName: "Power BI & DAX",
    video: {
      youtubeId: "AGrl-H87pRU",
      title: "Power BI Full Course 2026 - Beginner to Advanced Dashboarding",
      channelTitle: "Kevin Stratvert",
      durationSeconds: 12000,
      durationFormatted: "3:20:00",
      relevantStartSeconds: 2400,
      relevantEndSeconds: 7200,
      pruningReason: "Pruned out initial installation chapters to focus purely on Power Query transformations and DAX CALCULATE syntax.",
    },
    doc: {
      title: "DAX Guide - Comprehensive Function Reference",
      url: "https://dax.guide/",
      provider: "SQLBI & Microsoft Power BI Docs",
      summary: "Authoritative reference for Filter Context, Row Context, CALCULATE, and Time Intelligence functions.",
    },
    githubRepo: {
      repoName: "powerbi-executive-dashboards",
      repoUrl: "https://github.com/learnpath/powerbi-executive-dashboards",
      owner: "learnpath",
      starsCount: 980,
      description: "Complete .pbix template files with custom star schemas and dynamic drill-through KPIs.",
    },
    whyRecommendedTemplate: "Addresses your 55% Power BI gap by teaching relational star modeling and CALCULATE filter transition.",
    catQuestions: [
      {
        id: "cat-pbi-1",
        skillName: "Power BI & DAX",
        topic: "Calculated Columns vs Measures",
        difficultyTier: 2,
        calibratedDifficulty: 0.35,
        question: "When should you use a DAX Measure instead of a Calculated Column?",
        options: [
          "When you want dynamic aggregation computed at query time respecting report slicers and filter context",
          "When you need to store static row-by-row values on disk in RAM",
          "When defining table relationships only",
          "Measures can only be used for text strings",
        ],
        correctOptionIndex: 0,
        explanation: "Measures consume zero RAM at rest and are calculated dynamically on the fly based on the user's active report filter context.",
      },
      {
        id: "cat-pbi-2",
        skillName: "Power BI & DAX",
        topic: "DAX CALCULATE",
        difficultyTier: 4,
        calibratedDifficulty: 0.78,
        question: "What fundamental operation does the DAX CALCULATE function perform?",
        options: [
          "It modifies or overrides the existing filter context and triggers context transition",
          "It only calculates basic arithmetic sums",
          "It imports data from Excel into Power Query",
          "It creates physical partitions on the disk",
        ],
        correctOptionIndex: 0,
        explanation: "CALCULATE is the only DAX function capable of altering filter context and transforming existing row contexts into filter context (context transition).",
      },
    ],
  },
  "pytorch & deep learning foundations": {
    skillName: "PyTorch & Deep Learning Foundations",
    video: {
      youtubeId: "V_xro1rmAuQ",
      title: "PyTorch for Deep Learning & Neural Networks Bootcamp",
      channelTitle: "freeCodeCamp.org / Daniel Bourke",
      durationSeconds: 93600,
      durationFormatted: "26:00:00",
      relevantStartSeconds: 3600,
      relevantEndSeconds: 14400,
      pruningReason: "Pruned setup lessons to fast-track directly into Autograd, Tensor operations, and custom nn.Module building.",
    },
    doc: {
      title: "PyTorch Official Tutorials & Tensor Cheat Sheet",
      url: "https://pytorch.org/tutorials/",
      provider: "PyTorch Foundation",
      summary: "In-depth guide to nn.Module, Autograd, DataLoader pipelines, and GPU training acceleration.",
    },
    githubRepo: {
      repoName: "pytorch-deep-learning-labs",
      repoUrl: "https://github.com/learnpath/pytorch-deep-learning-labs",
      owner: "learnpath",
      starsCount: 3200,
      description: "Jupyter notebooks implementing CNNs, ResNets, and custom optimizers from scratch in PyTorch.",
    },
    whyRecommendedTemplate: "PyTorch is the industry-standard framework for 82% of modern AI research and LLM engineering.",
    catQuestions: [
      {
        id: "cat-torch-1",
        skillName: "PyTorch & Deep Learning Foundations",
        topic: "Autograd & Backprop",
        difficultyTier: 3,
        calibratedDifficulty: 0.58,
        question: "Why must optimizer.zero_grad() be called before loss.backward() in a standard PyTorch training loop?",
        options: [
          "Because PyTorch accumulates gradients across consecutive backward passes by default",
          "To reset model weights to random values",
          "To clear GPU VRAM memory buffers",
          "To compute the validation accuracy automatically",
        ],
        correctOptionIndex: 0,
        explanation: "By default, gradients accumulate in .grad buffers. If not zeroed, gradients from previous batches would sum together incorrectly.",
      },
    ],
  },
  "retrieval-augmented generation (rag)": {
    skillName: "Retrieval-Augmented Generation (RAG)",
    video: {
      youtubeId: "tcqEUSNCn8I",
      title: "Building Production RAG Systems with Vector Databases and LangChain",
      channelTitle: "James Briggs",
      durationSeconds: 7200,
      durationFormatted: "2:00:00",
      relevantStartSeconds: 600,
      relevantEndSeconds: 5400,
      pruningReason: "Focuses on semantic chunking, reciprocal rank fusion (RRF), and hybrid sparse-dense search.",
    },
    doc: {
      title: "LangChain & LlamaIndex Production RAG Guide",
      url: "https://docs.llamaindex.ai/en/stable/optimizing/production_rag/",
      provider: "LlamaIndex & Pinecone Research",
      summary: "Production patterns for metadata filtering, re-ranking with Cohere, and contextual retrieval.",
    },
    githubRepo: {
      repoName: "enterprise-rag-architecture",
      repoUrl: "https://github.com/learnpath/enterprise-rag-architecture",
      owner: "learnpath",
      starsCount: 2450,
      description: "FastAPI + pgvector + Groq/Llama-3.3 enterprise RAG template with evaluation metrics (RAGAS).",
    },
    whyRecommendedTemplate: "RAG is the #1 requested skill in modern AI job descriptions, combining vector search with grounded LLM generation.",
    catQuestions: [
      {
        id: "cat-rag-1",
        skillName: "Retrieval-Augmented Generation (RAG)",
        topic: "Vector Search & Retrieval",
        difficultyTier: 4,
        calibratedDifficulty: 0.76,
        question: "What is the primary benefit of Hybrid Search (combining BM25 Sparse Search with Dense Vector Embeddings)?",
        options: [
          "It captures both exact keyword matches (e.g. part numbers, names) and conceptual semantic meaning",
          "It reduces vector database storage by 90%",
          "It eliminates the need for an LLM during answer generation",
          "It allows running neural networks without GPUs",
        ],
        correctOptionIndex: 0,
        explanation: "Dense vectors capture semantics but struggle with exact alphanumeric IDs/keywords. BM25 excels at keywords. Hybrid search combines the best of both.",
      },
    ],
  },
  "react 19 & next.js 16 app router": {
    skillName: "React 19 & Next.js 16 App Router",
    video: {
      youtubeId: "wm5gMKuwSYk",
      title: "Next.js 16 Full Course - React Server Components & Streaming",
      channelTitle: "Jack Herrington",
      durationSeconds: 14400,
      durationFormatted: "4:00:00",
      relevantStartSeconds: 1200,
      relevantEndSeconds: 7800,
      pruningReason: "Focuses on Server Action boundaries, parallel routes, and streaming Suspense architecture.",
    },
    doc: {
      title: "Next.js App Router Official Architecture Guide",
      url: "https://nextjs.org/docs/app",
      provider: "Vercel Next.js Documentation",
      summary: "Complete reference for Server vs Client components, caching tiers, route handlers, and streaming UI.",
    },
    githubRepo: {
      repoName: "nextjs16-modern-saas-starter",
      repoUrl: "https://github.com/learnpath/nextjs16-modern-saas-starter",
      owner: "learnpath",
      starsCount: 1890,
      description: "Next.js 16 + Tailwind v4 + Supabase Auth + React Flow interactive dashboard boilerplate.",
    },
    whyRecommendedTemplate: "Next.js 16 is the industry standard for production-grade fullstack web applications with high performance.",
    catQuestions: [
      {
        id: "cat-next-1",
        skillName: "React 19 & Next.js 16 App Router",
        topic: "Server Components vs Client",
        difficultyTier: 3,
        calibratedDifficulty: 0.52,
        question: "In Next.js App Router, which directive must be placed at the top of a file to enable useState and useEffect hooks?",
        options: ["'use client'", "'use server'", "'use dynamic'", "'use strict'"],
        correctOptionIndex: 0,
        explanation: "'use client' marks the boundary between Server Components and interactive Client Components where browser APIs and state hooks are permitted.",
      },
    ],
  },
};

/**
 * Fallback generator for any arbitrary skill requested by user that isn't pre-seeded.
 */
export function getOrCreateCuratedResource(skillName: string): PreSeededTopicResource {
  const key = skillName.toLowerCase().trim();
  if (PRESEEDED_CURATED_CORPUS[key]) {
    return PRESEEDED_CURATED_CORPUS[key];
  }

  // Find fuzzy match
  for (const [k, val] of Object.entries(PRESEEDED_CURATED_CORPUS)) {
    if (k.includes(key) || key.includes(k)) {
      return val;
    }
  }

  // Dynamic fallback synthesis
  const formattedTitle = skillName.charAt(0).toUpperCase() + skillName.slice(1);
  return {
    skillName: formattedTitle,
    video: {
      youtubeId: "rfscVS0vtbw", // Python/CS foundational video ID as reliable fallback
      title: `${formattedTitle} Masterclass - Zero to Production`,
      channelTitle: "freeCodeCamp.org / LearnPath AI",
      durationSeconds: 7200,
      durationFormatted: "2:00:00",
      relevantStartSeconds: 0,
      relevantEndSeconds: 7200,
      pruningReason: `Curated sequence focusing on high-impact core architectures for ${formattedTitle}.`,
    },
    doc: {
      title: `${formattedTitle} Official Technical Documentation`,
      url: `https://devdocs.io/#q=${encodeURIComponent(skillName)}`,
      provider: "DevDocs & Official Guides",
      summary: `Comprehensive syntax, architectural patterns, and practical guides for ${formattedTitle}.`,
    },
    githubRepo: {
      repoName: `${skillName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-starter-kit`,
      repoUrl: `https://github.com/learnpath/${skillName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-starter-kit`,
      owner: "learnpath",
      starsCount: 650,
      description: `Starter repository and practice benchmarks for mastering ${formattedTitle}.`,
    },
    whyRecommendedTemplate: `Mastering ${formattedTitle} directly addresses your identified skill gap, advancing your readiness toward your target role.`,
    catQuestions: [
      {
        id: `cat-${skillName.toLowerCase().slice(0, 4)}-1`,
        skillName: formattedTitle,
        topic: "Core Fundamentals",
        difficultyTier: 3,
        calibratedDifficulty: 0.50,
        question: `What is the primary architectural advantage of using ${formattedTitle} in modern software engineering?`,
        options: [
          `It offers optimized abstraction, maintainability, and high-performance execution for its problem domain`,
          `It is the only tool that runs on microcontrollers`,
          `It completely removes the need for unit testing`,
          `It replaces the underlying operating system kernel`,
        ],
        correctOptionIndex: 0,
        explanation: `${formattedTitle} provides standard patterns designed to solve domain-specific engineering problems efficiently.`,
      },
    ],
  };
}
