import type {
  GraphEdge,
  GraphEdgeType,
  GraphNode,
  GraphNodeType,
  RelationshipInsight,
  RetrievedPaper,
  TheoryGraph,
  TrendAnalysis,
  TrendDatum
} from "./types";
import { methodologySignals, theorySignals } from "./domain";

const broadConcepts = new Set([
  "psychology",
  "education",
  "computer science",
  "artificial intelligence",
  "business",
  "medicine",
  "sociology",
  "philosophy",
  "political science"
]);

function textFor(paper: RetrievedPaper): string {
  return `${paper.title} ${paper.abstract} ${paper.concepts.join(" ")}`.toLowerCase();
}

function nodeId(type: GraphNodeType, label: string): string {
  return `${type}:${label.toLowerCase().replaceAll(/\s+/g, "-")}`;
}

function edgeId(source: string, target: string): string {
  return [source, target].sort().join("--");
}

function addNode(nodes: Map<string, GraphNode>, type: GraphNodeType, label: string, paperId: string) {
  const id = nodeId(type, label);
  const existing = nodes.get(id);
  if (existing) {
    if (!existing.paperIds.includes(paperId)) existing.paperIds.push(paperId);
    existing.support = existing.paperIds.length;
    return;
  }
  nodes.set(id, { id, label, type, support: 1, paperIds: [paperId] });
}

function addEdge(
  edges: Map<string, GraphEdge>,
  source: string,
  target: string,
  type: GraphEdgeType,
  paper: RetrievedPaper,
  totalPapers: number
) {
  if (source === target) return;
  const id = edgeId(source, target);
  const existing = edges.get(id);
  if (existing) {
    if (!existing.paperIds.includes(paper.id)) existing.paperIds.push(paper.id);
    if (paper.year !== null && !existing.years.includes(paper.year)) existing.years.push(paper.year);
    existing.weight = existing.paperIds.length;
    existing.density = existing.weight / Math.max(1, totalPapers);
    return;
  }
  edges.set(id, {
    id,
    source,
    target,
    type,
    weight: 1,
    density: 1 / Math.max(1, totalPapers),
    paperIds: [paper.id],
    averageCitations: paper.citedByCount,
    years: paper.year === null ? [] : [paper.year]
  });
}

function finalizeEdges(edges: Map<string, GraphEdge>, papers: RetrievedPaper[]): GraphEdge[] {
  const citationById = new Map(papers.map((paper) => [paper.id, paper.citedByCount]));
  return [...edges.values()]
    .map((edge) => {
      const citations = edge.paperIds.map((paperId) => citationById.get(paperId) ?? 0);
      return {
        ...edge,
        averageCitations: citations.length ? citations.reduce((sum, count) => sum + count, 0) / citations.length : 0,
        years: [...edge.years].sort((a, b) => a - b)
      };
    })
    .sort((a, b) => b.weight - a.weight || b.density - a.density);
}

function extractPaperEntities(paper: RetrievedPaper, keywords: string[]): Array<{ type: GraphNodeType; label: string }> {
  const lower = textFor(paper);
  const theories = theorySignals
    .filter((signal) => lower.includes(signal))
    .map((label) => ({ type: "theory" as const, label }));
  const methodologies = Object.entries(methodologySignals)
    .filter(([, signals]) => signals?.some((signal) => lower.includes(signal)))
    .map(([label]) => ({ type: "methodology" as const, label }));
  const concepts = paper.concepts
    .filter((concept) => concept.length >= 3 && !broadConcepts.has(concept.toLowerCase()))
    .slice(0, 7)
    .map((label) => ({ type: "concept" as const, label }));
  const variables = keywords
    .filter((keyword) => lower.includes(keyword.toLowerCase()))
    .map((label) => ({ type: "variable" as const, label }));

  const seen = new Set<string>();
  return [...theories, ...methodologies, ...concepts, ...variables].filter((entity) => {
    const key = entity.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function relationType(a: GraphNodeType, b: GraphNodeType): GraphEdgeType {
  if (a === "theory" && b === "theory") return "theory_cooccurrence";
  if (a === "methodology" || b === "methodology") return "methodology_link";
  if (a === "theory" || b === "theory") return "adjacent_framework";
  return "concept_bridge";
}

export function buildTheoryGraph(papers: RetrievedPaper[], keywords: string[]): TheoryGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  for (const paper of papers) {
    const entities = extractPaperEntities(paper, keywords);
    for (const entity of entities) addNode(nodes, entity.type, entity.label, paper.id);
    for (let i = 0; i < entities.length; i += 1) {
      for (let j = i + 1; j < entities.length; j += 1) {
        const source = nodeId(entities[i].type, entities[i].label);
        const target = nodeId(entities[j].type, entities[j].label);
        addEdge(edges, source, target, relationType(entities[i].type, entities[j].type), paper, papers.length);
      }
    }
  }

  const edgeList = finalizeEdges(edges, papers).slice(0, 80);
  const nodeList = [...nodes.values()].sort((a, b) => b.support - a.support).slice(0, 36);
  const possibleEdges = Math.max(1, (nodeList.length * (nodeList.length - 1)) / 2);
  const methodologyDiversity = nodeList.filter((node) => node.type === "methodology").length;
  const weakConnectionCount = edgeList.filter((edge) => edge.weight <= 2 && edge.density <= 0.12).length;
  const currentYear = new Date().getFullYear();
  const emergingConnectionCount = edgeList.filter((edge) => edge.years.some((year) => year >= currentYear - 3) && edge.weight <= 3).length;

  return {
    nodes: nodeList,
    edges: edgeList.filter((edge) => nodeList.some((node) => node.id === edge.source) && nodeList.some((node) => node.id === edge.target)),
    metrics: {
      density: edgeList.length / possibleEdges,
      weakConnectionCount,
      emergingConnectionCount,
      methodologyDiversity
    }
  };
}

function labelFor(graph: TheoryGraph, id: string): string {
  return graph.nodes.find((node) => node.id === id)?.label ?? id;
}

export function analyzeRelationships(graph: TheoryGraph, papers: RetrievedPaper[]): RelationshipInsight[] {
  const insights: RelationshipInsight[] = [];
  const currentYear = new Date().getFullYear();
  const theoryEdges = graph.edges.filter((edge) => edge.type === "theory_cooccurrence");
  const adjacentEdges = graph.edges.filter((edge) => edge.type === "adjacent_framework");
  const citationValues = graph.edges.map((edge) => edge.averageCitations).sort((a, b) => a - b);
  const medianCitation = citationValues[Math.floor(citationValues.length / 2)] ?? 0;

  for (const edge of theoryEdges.slice(0, 3)) {
    insights.push({
      type: "co_occurring_theories",
      title: `${labelFor(graph, edge.source)} - ${labelFor(graph, edge.target)} 이론 동시출현`,
      evidence: `검색 문헌 ${papers.length}편 중 ${edge.weight}편에서 함께 나타납니다. 이 수치는 관계 신호이며 인과 관계를 뜻하지 않습니다.`,
      confidence: edge.weight >= 3 ? "medium" : "low",
      paperIds: edge.paperIds
    });
  }

  for (const edge of adjacentEdges.slice(0, 4)) {
    insights.push({
      type: "adjacent_frameworks",
      title: `${labelFor(graph, edge.source)}와 ${labelFor(graph, edge.target)}의 인접 프레임워크`,
      evidence: `동일 문헌 내 공기반 출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}입니다.`,
      confidence: edge.weight >= 4 ? "medium" : "low",
      paperIds: edge.paperIds
    });
  }

  for (const edge of graph.edges.filter((item) => item.weight <= 2 && item.density <= 0.12).slice(0, 5)) {
    insights.push({
      type: "weak_connection",
      title: `${labelFor(graph, edge.source)} - ${labelFor(graph, edge.target)} 약한 연결`,
      evidence: `검색 집합에서 ${edge.weight}편만 이 조합을 포함합니다. 이는 덜 연결된 후보 신호이지 확정적 연구 갭은 아닙니다.`,
      confidence: "low",
      paperIds: edge.paperIds
    });
  }

  for (const edge of graph.edges.filter((item) => item.years.some((year) => year >= currentYear - 3) && item.weight <= 3).slice(0, 4)) {
    insights.push({
      type: "emerging_combination",
      title: `${labelFor(graph, edge.source)} - ${labelFor(graph, edge.target)} 부상 조합`,
      evidence: `최근 ${currentYear - 3}년 이후 문헌에 포함되지만 전체 검색 집합에서는 ${edge.weight}편에 머뭅니다.`,
      confidence: "low",
      paperIds: edge.paperIds
    });
  }

  for (const edge of graph.edges.filter((item) => item.averageCitations <= medianCitation && item.weight <= 3).slice(0, 3)) {
    insights.push({
      type: "weak_citation_cluster",
      title: `${labelFor(graph, edge.source)} - ${labelFor(graph, edge.target)} 낮은 인용 신호`,
      evidence: `연결 문헌의 평균 OpenAlex 인용 수가 ${edge.averageCitations.toFixed(1)}이며, 이번 검색 그래프의 중앙값 ${medianCitation.toFixed(1)} 이하입니다. 이는 인용 클러스터의 직접 분석이 아니라 메타데이터 기반 상대적 약한 인용 신호입니다.`,
      confidence: "low",
      paperIds: edge.paperIds
    });
  }

  if (graph.metrics.methodologyDiversity <= 2) {
    const methodNodes = graph.nodes.filter((node) => node.type === "methodology");
    insights.push({
      type: "methodology_gap",
      title: "방법론 다양성 부족",
      evidence: `검색 집합에서 감지된 방법론 유형은 ${methodNodes.length}개입니다: ${methodNodes.map((node) => node.label).join(", ") || "없음"}.`,
      confidence: "medium",
      paperIds: methodNodes.flatMap((node) => node.paperIds).slice(0, 8)
    });
  }

  return insights.slice(0, 18);
}

export function buildTrendAnalysis(papers: RetrievedPaper[], graph: TheoryGraph): TrendAnalysis {
  const currentYear = new Date().getFullYear();
  const candidateNodes = graph.nodes.filter((node) => node.type === "theory" || node.type === "concept" || node.type === "variable").slice(0, 14);
  const paperById = new Map(papers.map((paper) => [paper.id, paper]));
  const trends: TrendDatum[] = candidateNodes
    .map((node) => {
      const counts = new Map<number, number>();
      for (const paperId of node.paperIds) {
        const year = paperById.get(paperId)?.year;
        if (year === undefined || year === null) continue;
        counts.set(year, (counts.get(year) ?? 0) + 1);
      }
      const years = [...counts.entries()].sort(([a], [b]) => a - b).map(([year, count]) => ({ year, count }));
      const recentCount = years.filter((item) => item.year >= currentYear - 3).reduce((sum, item) => sum + item.count, 0);
      const priorCount = years.filter((item) => item.year < currentYear - 3).reduce((sum, item) => sum + item.count, 0);
      const direction: TrendDatum["direction"] = recentCount > priorCount ? "rising" : priorCount > recentCount ? "declining" : "stable";
      return { label: node.label, years, recentCount, priorCount, direction, paperIds: node.paperIds };
    })
    .filter((trend) => trend.years.length > 0)
    .sort((a, b) => b.recentCount + b.priorCount - (a.recentCount + a.priorCount));

  return {
    risingTopics: trends.filter((trend) => trend.direction === "rising").slice(0, 6),
    decliningTopics: trends.filter((trend) => trend.direction === "declining").slice(0, 6),
    frequencyOverTime: trends.slice(0, 10)
  };
}
