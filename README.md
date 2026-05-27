# Research Intelligence System

MVP web app for generating research topic candidates from scholarly metadata.

## What it does

- Accepts multiple keywords, a discipline, and a methodology.
- Retrieves scholarly metadata from the live OpenAlex Works API through the app server route, with no mock paper fallback.
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
- Adds strategy modes for beginner-safe, high-impact/high-risk, fast publishable, interdisciplinary, practitioner-oriented, and theory-heavy planning.
- Recommends publication venues only from retrieved OpenAlex source names, with indexing status marked as unverified unless independently checked.
- Suggests public dataset and data collection routes with difficulty, sample, ethics, and source notes.
- Provides Markdown, BibTeX, browser print/PDF, topic bookmarking, and local workspace history features.
- Orchestrates a lightweight multi-agent research workflow for retrieval, theory extraction, citation intelligence, gap analysis, methodology recommendation, topic generation, contradiction detection, and roadmap planning.
- Adds autonomous exploration paths for adjacent theories, emerging concepts, weak domain links, refined research goals, and specialized directions.
- Generates deep synthesis outputs for theory synthesis, competing frameworks, unresolved debates, interdisciplinary connections, and conceptual integration proposals.
- Persists local research memory seeds, evolving agendas, comparison snapshots, and collaborative workspace history in the browser.
- Adds forecast dashboards for high-growth areas, likely future trends, saturated areas, declining themes, and interdisciplinary opportunity zones.
- Generates complete research proposal drafts, conceptual frameworks, variable relationship maps, reasoning workflows, refinement actions, literature review workspaces, academic writing suggestions, and thesis/conference/journal workflow plans.
- Adds self-improving intelligence views for researcher profiles, continuous trend snapshots, transparent topic/proposal evaluation, AI mentor critique, institutional mapping, expanded knowledge graph signals, and research scenario simulation.
- Adds an agentic self-improving research loop that critiques each generated topic, proposes evidence-bound improvements, re-scores refined topics, compares before/after versions, re-ranks candidates, and stores local refine-again history.
- Adds persistent scholarly memory with local JSON session storage, local hashing-based vector retrieval, cross-session recall, and a unified scholarly knowledge graph spanning papers, authors, theories, concepts, methodologies, datasets, venues, institutions, disciplines, and generated topics.
- Adds predictive academic intelligence for trend forecasting, publication outcome estimates, advanced topic evaluation, autonomous strategy optimization, scenario simulation, and research impact pathway analysis.
- Adds a fully autonomous academic operating layer that coordinates topic-to-proposal workflows, research production drafts, dependency-aware planning, scholarly reasoning panels, monitoring alerts, optimization controls, and versioned research workspace outputs.
- Adds a self-evolving academic ecosystem layer for snapshot-based continuous learning, dynamic knowledge graph updates, autonomous monitoring feeds, research benchmarking, adaptive agent coordination, institutional/team intelligence, workspace hubs, and long-term research trajectories.
- Adds a global autonomous scholarly network layer for self-evaluation, QA/confidence checks, weak-signal detection, global ecosystem summaries, adaptive strategy generation, and long-term scholarly evolution planning.
- Adds a trusted academic intelligence infrastructure layer with evidence-linked reasoning traces, evidence lineage views, transparent decision explanations, governance checks, research audits, human review workflows, and scalable infrastructure plans.
- Adds Zotero Local API integration for read-only library synchronization, collections, saved-paper metadata, PDF indexed-text signals where available, personal literature maps, reading queues, and library-grounded literature review drafts.
- Adds a full research workflow copilot for survey/interview/focus-group/observation/experiment instrument drafts, statistical analysis workflows, R/Python/SPSS/Stata/Quarto starter code, execution plans, writing support, reproducibility checks, and external workflow planning.
- Adds a scholarly collaboration and publication platform layer with AI peer-review simulation, publication optimization, collaborative manuscript workspace planning, revision intelligence, lifecycle timelines, academic benchmarking, and Zotero/Overleaf/Notion/GitHub/Google Docs/Jupyter/CSV workflow connectivity plans.

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
- The app may run at `localhost`, but paper retrieval is a live server-side HTTPS request to `api.openalex.org`; the UI shows retrieval mode, API status, response count, response time, and the exact OpenAlex request URL.
- No Google Scholar scraping is used.
- Papers are not fabricated; topic cards link back to retrieved OpenAlex metadata URLs or landing pages.
- Generated topics and gaps are labeled as inference.
- Retracted works whose titles begin with `RETRACTED:` are filtered out.
- No API keys or secrets are required.
- Graph relationships are inferred from co-occurrence in retrieved metadata. They are not full-text claims, causal claims, or definitive citation-network clusters.
- Citation relationships use OpenAlex metadata only. Shared-reference edges are bibliographic coupling signals, not a complete co-citation map from full reference lists.
- Debate and contradiction panels do not assert that a scholarly debate exists unless the retrieved metadata contains explicit textual or methodological signals.
- Publication targeting does not guarantee acceptance and does not verify SSCI/SCI/Scopus status automatically.
- Dataset recommendations are candidates with official source links and variable-coverage caveats; researchers must verify codebooks and access conditions.
- Multi-agent outputs are structured rule-based workflow traces, not autonomous external browsing agents or hidden LLM claims.
- Forecasts are search-result heuristics based on retrieved metadata, topic frequency, and recentness; they are not predictions of field-level certainty.
- Research memory is stored locally in the browser. It should not be treated as cloud collaboration or shared access control.
- Proposal, conceptual framework, and writing outputs are generated planning drafts. They do not establish causal relationships or scholarly claims without later human review and source verification.
- Continuous intelligence is a current-session OpenAlex snapshot, not a background monitor. Institutional, author, and collaboration panels only display metadata returned by retrieved papers.
- Evaluation, mentor, and scenario outputs are transparent heuristics based on retrieved evidence, profile settings, and existing app scores. They do not guarantee research quality, funding, publication, or future field movement.
- Topic refinement loops use existing retrieved evidence, topic scores, graph signals, and methodology fit. Score increases describe improved planning assumptions, not proven scholarly superiority.
- Persistent memory is stored locally under `.ris-memory/`, which is excluded from Git. Local hashing embeddings are lightweight retrieval signals, not external model embeddings or full semantic proof.
- Unified knowledge graph edges mark inferred relationships separately from retrieved metadata relationships and should be treated as exploration candidates unless independently verified.
- Predictive intelligence is heuristic and evidence-bound. It estimates strategic likelihoods from retrieved metadata, graph signals, memory, and existing scores; it does not guarantee publication, citations, hot-topic status, or scholarly impact.
- The autonomous academic operating layer coordinates workflows and drafts dossiers from existing evidence-bound modules. It does not run real experiments, submit IRB, manage real-time collaboration permissions, verify final citations, or guarantee publication outcomes.
- The self-evolving ecosystem layer compares the current OpenAlex search snapshot with local memory and graph signals. It does not run a hidden background crawler, verify funding alignment from external grant databases, or guarantee forecasting accuracy.
- The global scholarly network layer is a heuristic strategy and QA layer. It does not audit full-text citations, connect to private institutional systems, validate real funding calls, or claim global academic coverage.
- Trusted infrastructure traces link generated decisions back to retrieved paper IDs and heuristic reasoning steps. They do not replace full-text source verification, institutional governance systems, expert peer review, or secure multi-tenant access control.
- Zotero integration is read-only in this MVP. It uses the local Zotero Desktop API, does not require API keys, does not write to Zotero collections, and does not return PDF file paths or full PDF text.
- Copilot recommendations are rule-based inferences from retrieved evidence, graph metrics, topic scores, and methodology signals. They are not generated from hidden sources.
- Research workflow code and statistical plans are starter templates only. They do not generate empirical results, validate statistical assumptions, prove model correctness, or replace data inspection and expert review.
- Peer-review simulations are AI-generated critique templates, not real reviewer feedback, editorial decisions, journal authority, or publication guarantees. Publication optimization uses retrieved venue/source proxies and must be checked against official author guidelines.

## Known MVP limits

- Analysis uses metadata and abstracts, not full-text PDFs.
- Zotero PDF intelligence uses Zotero indexed full-text snippets when the local API permits it; otherwise it falls back to clearly labeled metadata-only analysis.
- Gap confidence is based on retrieval-set counts and keyword/theory/method signals, not exhaustive systematic review evidence.
- Citation and bibliometric intelligence are relative to the retrieved OpenAlex result set and should not be treated as an exhaustive field-level map.
- Vector retrieval uses local token hashing for MVP portability. A future version should swap in a stronger embedding model or vector DB if the user provides an approved provider and privacy model.
- Scoring is heuristic and designed to be replaced later by richer citation, venue, vector, graph, and expert-review signals.
- The copilot does not replace a human literature review; it structures candidate plans and explicitly separates evidence from inference.
