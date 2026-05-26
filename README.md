# Research Intelligence System

MVP web app for generating research topic candidates from scholarly metadata.

## What it does

- Accepts multiple keywords, a discipline, and a methodology.
- Retrieves scholarly metadata from OpenAlex.
- Extracts theory/framework, trend, limitation, related concept, and emerging-topic signals from retrieved titles, abstracts, and concepts.
- Builds a lightweight in-memory theory graph from co-occurring theories, concepts, variables, and methodology signals.
- Surfaces relationship intelligence for co-occurring theories, adjacent frameworks, weak concept links, emerging combinations, relative citation weakness, and methodology diversity.
- Adds trend intelligence for rising, declining, and year-by-year topic frequency signals.
- Detects count-backed gap signals without claiming that they prove a literature gap.
- Generates topic cards with rationale, research question, hypotheses/propositions, methodology, variables/concepts, contribution, scores, saturation, and linked retrieved evidence.
- Adds an agentic research copilot layer that refines topic directions, compares safer versus high-novelty paths, recommends theories, proposes methodology alternatives, and produces research planning outputs.
- Expands each topic with core theory, adjacent theories, variables/concepts, mediator/moderator candidates, methodology guidance, risks, publication suitability, conceptual model suggestions, and data collection recommendations.
- Adds citation intelligence from OpenAlex `referenced_works`, `related_works`, citation counts, authors, institutions, countries, and concepts.
- Builds bibliometric and scientometric dashboards for keyword co-occurrence, publication trends, topic evolution, collaboration patterns, research maturity, and saturation.
- Generates literature maps with foundational theories, dominant frameworks, adjacent disciplines, interdisciplinary bridges, and theory timelines.
- Produces AI-assisted literature review drafts that separate retrieved evidence, inferred synthesis, and generated narrative.
- Surfaces contradiction/debate signals only when retrieved metadata contains explicit evidence or method/theory plurality that needs human follow-up.
- Generates research roadmaps for beginner-safe topics, high-impact/high-risk directions, future trends, next-step studies, and interdisciplinary combinations.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The API route is `POST /api/research`.

## Update and publish workflow

When the app is updated in this workspace, changes should be validated with the available checks, committed intentionally, and pushed to `origin/main` on `AKA-SF/Resarch-Maker`.

Before publishing, keep generated build output, dependencies, local environment files, API keys, and secrets out of Git. The repository `.gitignore` excludes `node_modules/`, `.next/`, `coverage/`, `*.tsbuildinfo`, and `.env*`.

## Data and safety notes

- Primary data source: OpenAlex Works API.
- No Google Scholar scraping is used.
- Papers are not fabricated; topic cards link back to retrieved OpenAlex metadata URLs or landing pages.
- Generated topics and gaps are labeled as inference.
- Retracted works whose titles begin with `RETRACTED:` are filtered out.
- No API keys or secrets are required.
- Graph relationships are inferred from co-occurrence in retrieved metadata. They are not full-text claims, causal claims, or definitive citation-network clusters.
- Citation relationships use OpenAlex metadata only. Shared-reference edges are bibliographic coupling signals, not a complete co-citation map from full reference lists.
- Debate and contradiction panels do not assert that a scholarly debate exists unless the retrieved metadata contains explicit textual or methodological signals.
- Copilot recommendations are rule-based inferences from retrieved evidence, graph metrics, topic scores, and methodology signals. They are not generated from hidden sources.

## Known MVP limits

- Analysis uses metadata and abstracts, not full-text PDFs.
- Gap confidence is based on retrieval-set counts and keyword/theory/method signals, not exhaustive systematic review evidence.
- Citation and bibliometric intelligence are relative to the retrieved OpenAlex result set and should not be treated as an exhaustive field-level map.
- Scoring is heuristic and designed to be replaced later by richer citation, venue, vector, graph, and expert-review signals.
- The copilot does not replace a human literature review; it structures candidate plans and explicitly separates evidence from inference.
