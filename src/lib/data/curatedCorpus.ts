import { CATQuestion, DocResource, Flashcard, GitHubRepoResource, VideoResource } from "@/types";

export interface PreSeededTopicResource {
  skillName: string;
  video: VideoResource;
  doc: DocResource;
  githubRepo: GitHubRepoResource;
  whyRecommendedTemplate: string;
  catQuestions: CATQuestion[];
  flashcards?: Flashcard[];
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
    flashcards: [
      {
        id: "fc-sql-1",
        front: "What is the exact evaluation order of SQL clauses in the engine?",
        back: "1. FROM / JOIN\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT / Window Functions\n6. DISTINCT\n7. ORDER BY\n8. LIMIT / OFFSET",
        category: "SQL Query Lifecycle",
        codeSnippet: "-- WHERE filters before grouping, HAVING filters after grouping\nSELECT dept, AVG(salary) FROM employees WHERE active = true GROUP BY dept HAVING AVG(salary) > 80000;",
      },
      {
        id: "fc-sql-2",
        front: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() on tied values (e.g. 100, 100, 90)?",
        back: "• ROW_NUMBER(): Strict sequential integers (1, 2, 3)\n• RANK(): Ties share rank, leaves gaps (1, 1, 3)\n• DENSE_RANK(): Ties share rank, no gaps (1, 1, 2)",
        category: "Window Functions",
        codeSnippet: "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) as ranking FROM scores;",
      },
      {
        id: "fc-sql-3",
        front: "When should you use an EXISTS clause instead of IN with a subquery?",
        back: "Use EXISTS when the subquery may contain NULLs or when evaluating large subqueries. EXISTS short-circuits on the first true match and handles NULL values without breaking 3-valued boolean logic.",
        category: "Performance & Subqueries",
        codeSnippet: "SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.cust_id = c.id);",
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
    flashcards: [
      {
        id: "fc-dax-1",
        front: "What is 'Context Transition' in DAX and when does it occur?",
        back: "Context Transition is the transformation of all active Row Contexts into equivalent Filter Contexts. It happens automatically whenever CALCULATE() or CALCULATETABLE() is called inside an iterator or row context.",
        category: "DAX Evaluation Engine",
        codeSnippet: "-- Calling a Measure inside SUMX triggers context transition automatically:\nSUMX(Customers, [Total Sales])",
      },
      {
        id: "fc-dax-2",
        front: "What is the difference between ALL() and ALLEXCEPT() in DAX?",
        back: "• ALL(Table[Column]): Completely clears all filters applied to the specified table or column, returning all rows.\n• ALLEXCEPT(Table, Table[Col1]): Clears all filters on the table EXCEPT for the specified preserved column(s).",
        category: "DAX Filter Modifiers",
        codeSnippet: "-- Percent of Total Sales:\nDIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products)))",
      },
      {
        id: "fc-dax-3",
        front: "Why should you prefer Star Schema over Snowflake Schema in Power BI Tabular Engine (VertiPaq)?",
        back: "VertiPaq column-store compression is heavily optimized for single-hop 1-to-many relationships in a Star Schema (Central Fact + Dimension tables). Snowflake schemas introduce multi-hop joins which increase memory footprint and query latency.",
        category: "Data Modeling",
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
    flashcards: [
      {
        id: "fc-torch-1",
        front: "What is the exact sequence of steps in a standard PyTorch training loop iteration?",
        back: "1. optimizer.zero_grad() — Clear previous gradients\n2. outputs = model(inputs) — Forward pass\n3. loss = criterion(outputs, labels) — Compute loss\n4. loss.backward() — Backpropagation (compute gradients)\n5. optimizer.step() — Update weights",
        category: "PyTorch Core Engine",
        codeSnippet: "for x, y in dataloader:\n    optimizer.zero_grad()\n    out = model(x)\n    loss = loss_fn(out, y)\n    loss.backward()\n    optimizer.step()",
      },
    ],
  },
};

/**
 * Generates tailored Flashcards for any remedial subtopic (e.g. for Level 5.1, 5.2, 5.3)
 */
export function generateFlashcardsForSubtopic(subtopic: string, skillName: string): Flashcard[] {
  const key = skillName.toLowerCase().trim();
  const corpus = PRESEEDED_CURATED_CORPUS[key];

  if (corpus?.flashcards && corpus.flashcards.length > 0) {
    return corpus.flashcards;
  }

  // Dynamic generative fallback
  return [
    {
      id: `fc-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1`,
      front: `What is the core architectural principle of ${subtopic}?`,
      back: `${subtopic} defines the foundation for ensuring data correctness, performance scaling, and avoiding common execution anti-patterns in ${skillName}.`,
      category: `${skillName} • Core Concept`,
    },
    {
      id: `fc-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, "-")}-2`,
      front: `What is the most common pitfall or mistake when implementing ${subtopic}?`,
      back: `Failing to account for context boundaries, state accumulation, or incorrect order-of-operations. Always verify baseline constraints before applying complex transformations.`,
      category: `${skillName} • Debugging & Optimization`,
    },
    {
      id: `fc-${subtopic.toLowerCase().replace(/[^a-z0-9]/g, "-")}-3`,
      front: `How do you verify and test mastery of ${subtopic}?`,
      back: `Implement a minimal reproduction script or query verifying that edge cases (nulls, tied ranks, empty batches) behave deterministically.`,
      category: `${skillName} • Production Readiness`,
    },
  ];
}

/**
 * Fallback generator for any arbitrary skill requested by user that isn't pre-seeded.
 */
export function getOrCreateCuratedResource(skillName: string): PreSeededTopicResource {
  const key = skillName.toLowerCase().trim();
  if (PRESEEDED_CURATED_CORPUS[key]) {
    return PRESEEDED_CURATED_CORPUS[key];
  }

  for (const [k, val] of Object.entries(PRESEEDED_CURATED_CORPUS)) {
    if (k.includes(key) || key.includes(k)) {
      return val;
    }
  }

  const formattedTitle = skillName.charAt(0).toUpperCase() + skillName.slice(1);
  return {
    skillName: formattedTitle,
    video: {
      youtubeId: "rfscVS0vtbw",
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
    flashcards: generateFlashcardsForSubtopic("Core Fundamentals", formattedTitle),
  };
}
