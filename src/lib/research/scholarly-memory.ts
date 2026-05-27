import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BibliometricAnalysis,
  DatasetIntelligence,
  Discipline,
  Gap,
  Methodology,
  PersistentScholarlyMemory,
  ResearchStrategy,
  RetrievedPaper,
  ScholarlyMemoryRecord,
  SemanticRetrievalResult,
  Synthesis,
  TheoryGraph,
  Topic,
  UnifiedKnowledgeGraphEdge,
  UnifiedKnowledgeGraphNode,
  UnifiedScholarlyKnowledgeGraph
} from "./types";
import type { ResearcherProfile } from "./types";

const embeddingDimension = 64;
const maxMemoryRecords = 40;
const memoryNamespace = "ris-local-scholar-memory-v1";

type MemoryStore = {
  version: 1;
  records: ScholarlyMemoryRecord[];
};

type BuildMemoryParams = {
  keywords: string[];
  discipline: Discipline;
  methodology: Methodology;
  strategy: ResearchStrategy;
  researcherProfile?: Partial<ResearcherProfile>;
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  graph: TheoryGraph;
  gaps: Gap[];
  topics: Topic[];
  bibliometricAnalysis: BibliometricAnalysis;
  datasetIntelligence: DatasetIntelligence;
  priorRecords?: ScholarlyMemoryRecord[];
};

function memoryPath(): string {
  return path.join(process.cwd(), ".ris-memory", "scholarly-memory.json");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function hashToken(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function embedText(text: string): number[] {
  const vector = Array.from({ length: embeddingDimension }, () => 0);
  for (const token of tokenize(text)) {
    const index = hashToken(token) % embeddingDimension;
    vector[index] += 1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0)) || 1;
  const normB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0)) || 1;
  return Number((dot / (normA * normB)).toFixed(3));
}

function nodeId(type: string, label: string): string {
  return `${type}:${label.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "unknown"}`;
}

function addNode(nodes: Map<string, UnifiedKnowledgeGraphNode>, node: UnifiedKnowledgeGraphNode) {
  const existing = nodes.get(node.id);
  if (!existing) {
    nodes.set(node.id, node);
    return;
  }
  nodes.set(node.id, {
    ...existing,
    support: existing.support + node.support,
    evidencePaperIds: [...new Set([...existing.evidencePaperIds, ...node.evidencePaperIds])].slice(0, 12)
  });
}

function addEdge(edges: Map<string, UnifiedKnowledgeGraphEdge>, edge: UnifiedKnowledgeGraphEdge) {
  const existing = edges.get(edge.id);
  if (!existing) {
    edges.set(edge.id, edge);
    return;
  }
  edges.set(edge.id, {
    ...existing,
    weight: existing.weight + edge.weight,
    evidencePaperIds: [...new Set([...existing.evidencePaperIds, ...edge.evidencePaperIds])].slice(0, 12)
  });
}

function makeCurrentRecord(params: BuildMemoryParams, sessionId: string): ScholarlyMemoryRecord {
  return {
    sessionId,
    createdAt: new Date().toISOString(),
    keywords: params.keywords,
    discipline: params.discipline,
    methodology: params.methodology,
    strategy: params.strategy,
    generatedTopicTitles: params.topics.map((topic) => topic.title).slice(0, 10),
    theoryRelationships: params.graph.edges.slice(0, 12).map((edge) => {
      const source = params.graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = params.graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      return {
        source,
        target,
        evidence: `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}. 검색 근거 기반 추론입니다.`,
        paperIds: edge.paperIds
      };
    }),
    literatureSummaries: [
      `핵심 이론: ${params.synthesis.theories.slice(0, 4).map((item) => `${item.label}(${item.support})`).join(", ") || "명시 신호 부족"}`,
      `주요 트렌드: ${params.synthesis.trends.slice(0, 5).map((item) => `${item.label}(${item.support})`).join(", ") || "명시 신호 부족"}`
    ],
    gapAnalyses: params.gaps.slice(0, 8).map((gap) => `${gap.claim} 근거: ${gap.evidence}`),
    refinementHistory: params.topics.slice(0, 5).map((topic) => `${topic.title}: ${topic.inferenceNotice}`),
    userResearchInterests: [
      ...(params.researcherProfile?.interests ?? []),
      ...params.keywords
    ].slice(0, 16)
  };
}

function buildEmbeddingItems(params: BuildMemoryParams, current: ScholarlyMemoryRecord) {
  const currentItems = [
    ...params.papers.slice(0, 32).map((paper) => ({
      id: `paper:${paper.id}`,
      type: "paper" as const,
      label: paper.title,
      text: `${paper.title} ${paper.abstract} ${paper.concepts.join(" ")}`,
      sourceSessionId: current.sessionId,
      evidencePaperIds: [paper.id]
    })),
    ...params.topics.map((topic, index) => ({
      id: `topic:${current.sessionId}:${index}`,
      type: "topic" as const,
      label: topic.title,
      text: `${topic.title} ${topic.rationale} ${topic.researchQuestion} ${topic.variables.join(" ")} ${topic.coreTheory}`,
      sourceSessionId: current.sessionId,
      evidencePaperIds: topic.evidencePaperIds
    })),
    ...params.synthesis.theories.map((theory) => ({
      id: `theory:${current.sessionId}:${theory.label}`,
      type: "theory" as const,
      label: theory.label,
      text: `${theory.label} ${params.keywords.join(" ")} ${params.discipline}`,
      sourceSessionId: current.sessionId,
      evidencePaperIds: theory.paperIds
    })),
    ...params.gaps.map((gap, index) => ({
      id: `gap:${current.sessionId}:${index}`,
      type: "gap" as const,
      label: gap.claim,
      text: `${gap.claim} ${gap.evidence}`,
      sourceSessionId: current.sessionId,
      evidencePaperIds: gap.paperIds
    }))
  ];
  const priorItems = (params.priorRecords ?? []).flatMap((record) => [
    ...record.generatedTopicTitles.map((title, index) => ({
      id: `prior-topic:${record.sessionId}:${index}`,
      type: "topic" as const,
      label: title,
      text: `${title} ${record.keywords.join(" ")} ${record.discipline}`,
      sourceSessionId: record.sessionId,
      evidencePaperIds: []
    })),
    ...record.literatureSummaries.map((summary, index) => ({
      id: `prior-summary:${record.sessionId}:${index}`,
      type: "literature_summary" as const,
      label: summary.slice(0, 90),
      text: summary,
      sourceSessionId: record.sessionId,
      evidencePaperIds: []
    })),
    ...record.gapAnalyses.map((gap, index) => ({
      id: `prior-gap:${record.sessionId}:${index}`,
      type: "gap" as const,
      label: gap.slice(0, 90),
      text: gap,
      sourceSessionId: record.sessionId,
      evidencePaperIds: []
    })),
    ...record.userResearchInterests.map((interest, index) => ({
      id: `prior-interest:${record.sessionId}:${index}`,
      type: "profile_interest" as const,
      label: interest,
      text: `${interest} ${record.keywords.join(" ")}`,
      sourceSessionId: record.sessionId,
      evidencePaperIds: []
    }))
  ]);
  return [...currentItems, ...priorItems].map((item) => ({
    ...item,
    vector: embedText(item.text)
  }));
}

function searchSimilar(query: string, items: ReturnType<typeof buildEmbeddingItems>, limit: number, excludeSessionId?: string): SemanticRetrievalResult[] {
  const queryVector = embedText(query);
  return items
    .filter((item) => !excludeSessionId || item.sourceSessionId !== excludeSessionId)
    .map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label,
      similarity: cosine(queryVector, item.vector),
      evidence: `${item.type} 메모리 항목과 로컬 해시 임베딩 유사도 ${cosine(queryVector, item.vector)}입니다. 원문 의미 일치를 보장하지 않습니다.`,
      sourceSessionId: item.sourceSessionId,
      evidencePaperIds: item.evidencePaperIds
    }))
    .filter((item) => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function buildUnifiedGraph(params: BuildMemoryParams): UnifiedScholarlyKnowledgeGraph {
  const nodes = new Map<string, UnifiedKnowledgeGraphNode>();
  const edges = new Map<string, UnifiedKnowledgeGraphEdge>();
  const disciplineId = nodeId("discipline", params.discipline);
  addNode(nodes, { id: disciplineId, label: params.discipline, type: "discipline", support: 1, evidencePaperIds: [] });

  for (const paper of params.papers.slice(0, 24)) {
    const paperId = nodeId("paper", paper.id);
    addNode(nodes, { id: paperId, label: paper.title, type: "paper", support: 1, evidencePaperIds: [paper.id] });
    addEdge(edges, {
      id: `${paperId}->${disciplineId}`,
      source: paperId,
      target: disciplineId,
      relation: "belongs_to_discipline",
      weight: 1,
      evidence: "현재 검색 질의의 선택 분야와 연결한 세션 맥락 엣지입니다.",
      evidencePaperIds: [paper.id],
      inferred: true
    });
    for (const author of paper.authors.slice(0, 4)) {
      const authorId = nodeId("author", author);
      addNode(nodes, { id: authorId, label: author, type: "author", support: 1, evidencePaperIds: [paper.id] });
      addEdge(edges, { id: `${paperId}->${authorId}`, source: paperId, target: authorId, relation: "authored_by", weight: 1, evidence: "OpenAlex authorships 메타데이터 기반입니다.", evidencePaperIds: [paper.id], inferred: false });
    }
    for (const institution of paper.institutions.slice(0, 3)) {
      const institutionId = nodeId("institution", institution);
      addNode(nodes, { id: institutionId, label: institution, type: "institution", support: 1, evidencePaperIds: [paper.id] });
      addEdge(edges, { id: `${paperId}->${institutionId}`, source: paperId, target: institutionId, relation: "affiliated_with", weight: 1, evidence: "OpenAlex institution 메타데이터 기반입니다.", evidencePaperIds: [paper.id], inferred: false });
    }
    if (paper.source && paper.source !== "OpenAlex") {
      const venueId = nodeId("venue", paper.source);
      addNode(nodes, { id: venueId, label: paper.source, type: "venue", support: 1, evidencePaperIds: [paper.id] });
      addEdge(edges, { id: `${paperId}->${venueId}`, source: paperId, target: venueId, relation: "published_in", weight: 1, evidence: "OpenAlex host/source 표시 기반입니다.", evidencePaperIds: [paper.id], inferred: false });
    }
    for (const concept of paper.concepts.slice(0, 5)) {
      const conceptId = nodeId("concept", concept);
      addNode(nodes, { id: conceptId, label: concept, type: "concept", support: 1, evidencePaperIds: [paper.id] });
      addEdge(edges, { id: `${paperId}->${conceptId}`, source: paperId, target: conceptId, relation: "has_concept", weight: 1, evidence: "OpenAlex concepts 메타데이터 기반입니다.", evidencePaperIds: [paper.id], inferred: false });
    }
  }

  for (const theory of params.synthesis.theories.slice(0, 8)) {
    const theoryId = nodeId("theory", theory.label);
    addNode(nodes, { id: theoryId, label: theory.label, type: "theory", support: theory.support, evidencePaperIds: theory.paperIds });
    for (const paperIdRaw of theory.paperIds.slice(0, 8)) {
      const paperId = nodeId("paper", paperIdRaw);
      if (nodes.has(paperId)) {
        addEdge(edges, { id: `${paperId}->${theoryId}`, source: paperId, target: theoryId, relation: "grounded_in_theory", weight: 1, evidence: "제목/초록/개념에서 이론 라벨이 감지된 추론 엣지입니다.", evidencePaperIds: [paperIdRaw], inferred: true });
      }
    }
  }
  for (const method of params.topics.flatMap((topic) => [topic.recommendedMethodology, ...topic.methodologyRecommendations.slice(0, 2).map((item) => item.method)])) {
    const methodId = nodeId("methodology", method);
    addNode(nodes, { id: methodId, label: method, type: "methodology", support: 1, evidencePaperIds: [] });
    addEdge(edges, { id: `${methodId}->${disciplineId}`, source: methodId, target: disciplineId, relation: "uses_methodology", weight: 1, evidence: "생성 토픽의 방법론 추천에서 나온 설계 엣지입니다.", evidencePaperIds: [], inferred: true });
  }
  for (const dataset of params.datasetIntelligence.recommendations.slice(0, 6)) {
    const datasetId = nodeId("dataset", dataset.name);
    addNode(nodes, { id: datasetId, label: dataset.name, type: "dataset", support: 1, evidencePaperIds: [] });
    addEdge(edges, { id: `${datasetId}->${disciplineId}`, source: datasetId, target: disciplineId, relation: "recommends_dataset", weight: 1, evidence: dataset.evidence, evidencePaperIds: [], inferred: true });
  }
  for (const topic of params.topics.slice(0, 5)) {
    const topicId = nodeId("topic", topic.title);
    addNode(nodes, { id: topicId, label: topic.title, type: "topic", support: topic.evidencePaperIds.length, evidencePaperIds: topic.evidencePaperIds });
    const theoryId = nodeId("theory", topic.coreTheory);
    if (nodes.has(theoryId)) {
      addEdge(edges, { id: `${topicId}->${theoryId}`, source: topicId, target: theoryId, relation: "grounded_in_theory", weight: 1, evidence: topic.inferenceNotice, evidencePaperIds: topic.evidencePaperIds, inferred: true });
    }
  }

  const bridgeEdges = params.graph.edges.slice(0, 8).map((edge) => {
    const source = params.graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
    const target = params.graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
    return {
      path: [source, target, params.discipline],
      explanation: `${source}와 ${target}가 같은 검색 집합에서 약하거나 인접한 연결로 나타났습니다.`,
      evidence: `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}.`,
      confidence: edge.weight >= 3 ? "medium" as const : "low" as const
    };
  });

  return {
    nodes: [...nodes.values()].slice(0, 240),
    edges: [...edges.values()].slice(0, 360),
    multiHopDiscoveries: bridgeEdges.slice(0, 5),
    hiddenRelationshipCandidates: (bridgeEdges.filter((item) => item.confidence === "low").length > 0 ? bridgeEdges.filter((item) => item.confidence === "low") : bridgeEdges).slice(0, 5),
    interdisciplinaryBridgeDiscoveries: bridgeEdges.slice(0, 5),
    longRangeConceptExploration: params.synthesis.emergingTopics.slice(0, 5).map((topic) => ({
      path: [topic.label, params.synthesis.trends[0]?.label ?? "core trend", params.discipline],
      explanation: "최근 등장 개념을 중심 트렌드와 선택 분야로 연결하는 장거리 탐색 후보입니다.",
      evidence: `${topic.support}편의 최근 검색 근거가 있습니다.`,
      confidence: "low" as const
    })),
    graphBoundary: "통합 지식 그래프는 OpenAlex 메타데이터, 검색 세션 맥락, 생성 토픽의 명시 추론을 구분합니다. inferred=true 엣지는 확정적 학술 관계가 아니라 탐색 후보입니다."
  };
}

export function buildPersistentScholarlyMemory(params: BuildMemoryParams): PersistentScholarlyMemory {
  const sessionId = `scholarly-memory-${Date.now()}`;
  const priorRecords = params.priorRecords ?? [];
  const currentSession = makeCurrentRecord(params, sessionId);
  const memoryRecords = [currentSession, ...priorRecords].slice(0, maxMemoryRecords);
  const embeddings = buildEmbeddingItems(params, currentSession);
  const query = `${params.keywords.join(" ")} ${params.discipline} ${params.methodology} ${params.researcherProfile?.interests?.join(" ") ?? ""}`;
  const theoryQuery = `${params.synthesis.theories.slice(0, 4).map((item) => item.label).join(" ")} ${params.keywords.join(" ")}`;
  const graph = buildUnifiedGraph(params);
  const crossSessionRecall = searchSimilar(query, embeddings, 8, currentSession.sessionId);

  return {
    currentSession,
    priorSessionCount: priorRecords.length,
    storedTopicCount: memoryRecords.reduce((sum, record) => sum + record.generatedTopicTitles.length, 0),
    storedTheoryRelationshipCount: memoryRecords.reduce((sum, record) => sum + record.theoryRelationships.length, 0),
    memoryRecords: memoryRecords.slice(0, 8),
    vectorRetrieval: {
      embeddingModel: "local-hashing-v1",
      embeddingDimension,
      embeddingsGenerated: embeddings.length,
      semanticSearchResults: searchSimilar(query, embeddings, 8),
      theorySimilarityResults: searchSimilar(theoryQuery, embeddings.filter((item) => item.type === "theory" || item.type === "literature_summary"), 6),
      relatedTopicDiscoveries: searchSimilar(query, embeddings.filter((item) => item.type === "topic"), 8),
      crossSessionRecall,
      retrievalBoundary: "임베딩은 외부 API 없이 로컬 해시/토큰 벡터로 생성됩니다. 이는 경량 의미 검색이며 정교한 문장 임베딩이나 원문 의미 일치를 보장하지 않습니다."
    },
    unifiedKnowledgeGraph: graph,
    researchRecall: {
      repeatedOrSimilarTopics: crossSessionRecall.filter((item) => item.type === "topic").slice(0, 5),
      rememberedPriorIdeas: priorRecords.flatMap((record) => record.generatedTopicTitles).slice(0, 8),
      unexploredAdjacentPaths: graph.hiddenRelationshipCandidates.slice(0, 5),
      continuedResearchAgenda: [
        ...priorRecords.flatMap((record) => record.refinementHistory).slice(0, 4),
        ...params.topics.slice(0, 4).map((topic) => `후속 아젠다: ${topic.researchQuestion}`)
      ].slice(0, 8),
      oldSessionConnections: crossSessionRecall.slice(0, 6),
      recallBoundary: "회상 결과는 이전 세션 로컬 메모리와 현재 검색 결과의 유사도 기반입니다. 반복 주제 가능성은 사용자 검토가 필요합니다."
    },
    discoveryWorkflows: {
      semanticExplorationMode: searchSimilar(query, embeddings, 5).map((item) => `${item.label} (${item.type}, 유사도 ${item.similarity})`),
      relatedDomainsWorkflow: graph.multiHopDiscoveries.slice(0, 5),
      hiddenTheoryConnectionDiscovery: graph.hiddenRelationshipCandidates.slice(0, 5),
      interdisciplinaryExpansionSuggestions: graph.interdisciplinaryBridgeDiscoveries.slice(0, 5).map((item) => `${item.path.join(" → ")}: ${item.explanation}`),
      adjacentResearchOpportunities: graph.longRangeConceptExploration.slice(0, 5).map((item) => `${item.path.join(" → ")}: ${item.evidence}`)
    },
    persistence: {
      enabled: false,
      storage: "local-json",
      namespace: memoryNamespace,
      lastSavedAt: null,
      warning: "분석 함수 단독 실행에서는 저장하지 않습니다. API 경로에서 로컬 JSON 메모리로 저장됩니다."
    }
  };
}

export async function loadScholarlyMemoryRecords(): Promise<ScholarlyMemoryRecord[]> {
  try {
    const raw = await readFile(memoryPath(), "utf8");
    const parsed = JSON.parse(raw) as MemoryStore;
    return Array.isArray(parsed.records) ? parsed.records.slice(0, maxMemoryRecords) : [];
  } catch {
    return [];
  }
}

export async function saveScholarlyMemoryRecord(record: ScholarlyMemoryRecord): Promise<string> {
  const file = memoryPath();
  await mkdir(path.dirname(file), { recursive: true });
  const existing = await loadScholarlyMemoryRecords();
  const records = [record, ...existing.filter((item) => item.sessionId !== record.sessionId)].slice(0, maxMemoryRecords);
  const store: MemoryStore = { version: 1, records };
  await writeFile(file, JSON.stringify(store, null, 2), "utf8");
  return new Date().toISOString();
}
