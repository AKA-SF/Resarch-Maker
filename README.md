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

## Data and safety notes

- Primary data source: OpenAlex Works API.
- No Google Scholar scraping is used.
- Papers are not fabricated; topic cards link back to retrieved OpenAlex metadata URLs or landing pages.
- Generated topics and gaps are labeled as inference.
- Retracted works whose titles begin with `RETRACTED:` are filtered out.
- No API keys or secrets are required.
- Graph relationships are inferred from co-occurrence in retrieved metadata. They are not full-text claims, causal claims, or definitive citation-network clusters.
- Copilot recommendations are rule-based inferences from retrieved evidence, graph metrics, topic scores, and methodology signals. They are not generated from hidden sources.

## Known MVP limits

- Analysis uses metadata and abstracts, not full-text PDFs.
- Gap confidence is based on retrieval-set counts and keyword/theory/method signals, not exhaustive systematic review evidence.
- Citation weakness is relative to the retrieved OpenAlex metadata set and uses `cited_by_count`, not full reference graph traversal.
- Scoring is heuristic and designed to be replaced later by richer citation, venue, vector, graph, and expert-review signals.
- The copilot does not replace a human literature review; it structures candidate plans and explicitly separates evidence from inference.
