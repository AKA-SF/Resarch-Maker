import type {
  BibliometricAnalysis,
  CitationIntelligence,
  CitationNetworkEdge,
  CitationPaperSignal,
  DebateSignal,
  EvidenceItem,
  Gap,
  InterdisciplinaryBridge,
  KeywordCooccurrence,
  LiteratureMap,
  LiteratureReviewDraft,
  LiteratureReviewSection,
  PublicationTrendPoint,
  ResearchCluster,
  ResearchRoadmap,
  RetrievedPaper,
  Synthesis,
  TheoryGraph,
  TopicEvolution,
  TrendAnalysis
} from "./types";
import { theorySignals } from "./domain";

const disciplineSignals = [
  "education",
  "psychology",
  "business",
  "management",
  "marketing",
  "finance",
  "economics",
  "sociology",
  "political science",
  "public policy",
  "communication",
  "media",
  "human-computer interaction",
  "computer science",
  "information systems",
  "public health",
  "nursing",
  "law",
  "environmental studies",
  "sustainability",
  "engineering",
  "data science"
];

function currentYear(): number {
  return new Date().getFullYear();
}

function clamp(value: number, min = 1, max = 10): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function textFor(paper: RetrievedPaper): string {
  return `${paper.title} ${paper.abstract} ${paper.concepts.join(" ")}`.toLowerCase();
}

function paperTitleMap(papers: RetrievedPaper[]): Map<string, RetrievedPaper> {
  return new Map(papers.map((paper) => [paper.id, paper]));
}

function paperSignal(paper: RetrievedPaper, reason: string): CitationPaperSignal {
  return {
    paperId: paper.id,
    title: paper.title,
    year: paper.year,
    citedByCount: paper.citedByCount,
    authors: paper.authors,
    source: paper.source,
    url: paper.url,
    reason
  };
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

function topConceptsForPaper(paper: RetrievedPaper, limit = 6): string[] {
  return paper.concepts.filter((concept) => concept.length >= 3).slice(0, limit);
}

function sharedCount(a: string[], b: string[]): number {
  const set = new Set(a);
  return b.filter((item) => set.has(item)).length;
}

function topEvidenceByCount(counts: Map<string, Set<string>>, limit: number): EvidenceItem[] {
  return [...counts.entries()]
    .map(([label, paperIds]) => ({ label, paperIds: [...paperIds], support: paperIds.size }))
    .sort((a, b) => b.support - a.support || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function buildCitationIntelligence(papers: RetrievedPaper[]): CitationIntelligence {
  const byId = paperTitleMap(papers);
  const citationCounts = papers.map((paper) => paper.citedByCount);
  const highThreshold = percentile(citationCounts, 0.75);
  const averageCitations = citationCounts.length ? citationCounts.reduce((sum, count) => sum + count, 0) / citationCounts.length : 0;
  const yearNow = currentYear();

  const highlyCitedPapers = papers
    .filter((paper) => paper.citedByCount >= highThreshold && paper.citedByCount > 0)
    .sort((a, b) => b.citedByCount - a.citedByCount)
    .slice(0, 6)
    .map((paper) => paperSignal(paper, `이번 검색 집합의 상위 인용 분위 기준(${highThreshold}회 이상)에 해당합니다.`));

  const seminalPapers = papers
    .filter((paper) => paper.year !== null && paper.year <= yearNow - 7 && paper.citedByCount >= Math.max(highThreshold, averageCitations))
    .sort((a, b) => b.citedByCount - a.citedByCount)
    .slice(0, 6)
    .map((paper) => paperSignal(paper, "출판 후 시간이 지났고 이번 검색 집합에서 상대적으로 높은 OpenAlex 인용 수를 보입니다."));

  const emergingPapers = papers
    .filter((paper) => paper.year !== null && paper.year >= yearNow - 3)
    .sort((a, b) => b.citedByCount - a.citedByCount || (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 6)
    .map((paper) => paperSignal(paper, "최근 3년 내 출판된 문헌입니다. 인용 수는 최신성 때문에 직접 비교에 주의해야 합니다."));

  const nodes = papers.slice(0, 18).map((paper) => ({
    id: paper.id,
    title: paper.title,
    year: paper.year,
    citedByCount: paper.citedByCount
  }));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edgeMap = new Map<string, CitationNetworkEdge>();

  for (let i = 0; i < papers.length; i += 1) {
    for (let j = i + 1; j < papers.length; j += 1) {
      const a = papers[i];
      const b = papers[j];
      if (!nodeIds.has(a.id) || !nodeIds.has(b.id)) continue;
      const directAtoB = a.referencedWorks.includes(b.id);
      const directBtoA = b.referencedWorks.includes(a.id);
      const related = a.relatedWorks.includes(b.id) || b.relatedWorks.includes(a.id);
      const sharedReferences = sharedCount(a.referencedWorks, b.referencedWorks);
      if (directAtoB || directBtoA) {
        edgeMap.set(pairKey(a.id, b.id), {
          id: pairKey(a.id, b.id),
          source: directAtoB ? a.id : b.id,
          target: directAtoB ? b.id : a.id,
          type: "direct_citation",
          weight: 1,
          evidence: "OpenAlex referenced_works 필드에서 검색 결과 내 직접 인용 관계가 확인되었습니다."
        });
      } else if (sharedReferences >= 3) {
        edgeMap.set(pairKey(a.id, b.id), {
          id: pairKey(a.id, b.id),
          source: a.id,
          target: b.id,
          type: "shared_references",
          weight: sharedReferences,
          evidence: `두 문헌이 OpenAlex referenced_works 기준 공통 참고문헌 ${sharedReferences}개를 공유합니다. 이는 공통참고문헌/서지결합 신호입니다.`
        });
      } else if (related) {
        edgeMap.set(pairKey(a.id, b.id), {
          id: pairKey(a.id, b.id),
          source: a.id,
          target: b.id,
          type: "related_work",
          weight: 1,
          evidence: "OpenAlex related_works 필드에서 관련 문헌 관계가 확인되었습니다."
        });
      }
    }
  }

  const networkEdges = [...edgeMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 40);
  const coCitationSignals = networkEdges
    .filter((edge) => edge.type === "shared_references")
    .slice(0, 8)
    .map((edge) => ({
      title: `${byId.get(edge.source)?.title ?? edge.source} / ${byId.get(edge.target)?.title ?? edge.target}`,
      paperIds: [edge.source, edge.target],
      sharedReferenceCount: edge.weight,
      evidence: `${edge.evidence} 원문 참고문헌 전체의 공동인용 분석은 아니며, 검색 결과 내 OpenAlex 참고문헌 메타데이터 기반입니다.`,
      confidence: edge.weight >= 8 ? "medium" as const : "low" as const
    }));

  const authorMap = new Map<string, { paperIds: Set<string>; citations: number }>();
  for (const paper of papers) {
    for (const author of paper.authors) {
      const item = authorMap.get(author) ?? { paperIds: new Set<string>(), citations: 0 };
      item.paperIds.add(paper.id);
      item.citations += paper.citedByCount;
      authorMap.set(author, item);
    }
  }
  const authorInfluence = [...authorMap.entries()]
    .map(([author, item]) => ({
      author,
      paperIds: [...item.paperIds],
      paperCount: item.paperIds.size,
      totalCitations: item.citations,
      averageCitations: item.citations / Math.max(1, item.paperIds.size)
    }))
    .sort((a, b) => b.totalCitations - a.totalCitations || b.paperCount - a.paperCount)
    .slice(0, 8);

  const clusterMap = new Map<string, RetrievedPaper[]>();
  for (const paper of papers) {
    const clusterLabel = topConceptsForPaper(paper, 1)[0] ?? "Unclassified";
    clusterMap.set(clusterLabel, [...(clusterMap.get(clusterLabel) ?? []), paper]);
  }
  const researchClusters: ResearchCluster[] = [...clusterMap.entries()]
    .map(([label, clusterPapers], index) => ({
      id: `cluster-${index + 1}`,
      label,
      paperIds: clusterPapers.map((paper) => paper.id),
      paperCount: clusterPapers.length,
      totalCitations: clusterPapers.reduce((sum, paper) => sum + paper.citedByCount, 0),
      dominantKeywords: [...new Set(clusterPapers.flatMap((paper) => topConceptsForPaper(paper, 4)))].slice(0, 6),
      evidence: `${clusterPapers.length}편이 대표 OpenAlex 개념 '${label}' 주변에 묶였습니다. 이는 경량 클러스터링이며 확정적 학파 분류가 아닙니다.`
    }))
    .sort((a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations)
    .slice(0, 8);

  return {
    network: {
      nodes,
      edges: networkEdges,
      metrics: {
        directCitationEdges: networkEdges.filter((edge) => edge.type === "direct_citation").length,
        sharedReferenceEdges: networkEdges.filter((edge) => edge.type === "shared_references").length,
        relatedWorkEdges: networkEdges.filter((edge) => edge.type === "related_work").length,
        averageCitations
      }
    },
    highlyCitedPapers,
    seminalPapers,
    emergingPapers,
    coCitationSignals,
    authorInfluence,
    researchClusters
  };
}

export function buildBibliometricAnalysis(papers: RetrievedPaper[], synthesis: Synthesis): BibliometricAnalysis {
  const yearNow = currentYear();
  const pairMap = new Map<string, { source: string; target: string; paperIds: Set<string> }>();
  for (const paper of papers) {
    const concepts = topConceptsForPaper(paper, 7);
    for (let i = 0; i < concepts.length; i += 1) {
      for (let j = i + 1; j < concepts.length; j += 1) {
        const key = pairKey(concepts[i], concepts[j]);
        const current = pairMap.get(key) ?? { source: concepts[i], target: concepts[j], paperIds: new Set<string>() };
        current.paperIds.add(paper.id);
        pairMap.set(key, current);
      }
    }
  }
  const keywordCooccurrences: KeywordCooccurrence[] = [...pairMap.values()]
    .map((item) => ({ source: item.source, target: item.target, weight: item.paperIds.size, paperIds: [...item.paperIds] }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);

  const trendMap = new Map<number, { citations: number; paperIds: string[] }>();
  for (const paper of papers) {
    if (paper.year === null) continue;
    const item = trendMap.get(paper.year) ?? { citations: 0, paperIds: [] };
    item.citations += paper.citedByCount;
    item.paperIds.push(paper.id);
    trendMap.set(paper.year, item);
  }
  const publicationTrends: PublicationTrendPoint[] = [...trendMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, item]) => ({ year, paperCount: item.paperIds.length, totalCitations: item.citations, paperIds: item.paperIds }));

  const topicEvolution: TopicEvolution[] = [...synthesis.trends, ...synthesis.theories]
    .slice(0, 12)
    .map((item) => {
      const years = item.paperIds
        .map((paperId) => papers.find((paper) => paper.id === paperId)?.year)
        .filter((year): year is number => typeof year === "number")
        .sort((a, b) => a - b);
      const recentCount = years.filter((year) => year >= yearNow - 3).length;
      const earlyCount = years.length - recentCount;
      return {
        label: item.label,
        firstYear: years[0] ?? null,
        latestYear: years.at(-1) ?? null,
        earlyCount,
        recentCount,
        trajectory: recentCount > earlyCount ? "rising" as const : earlyCount > recentCount ? "declining" as const : "stable" as const,
        paperIds: item.paperIds
      };
    });

  const collaborationMap = new Map<string, { source: string; target: string; paperIds: Set<string> }>();
  for (const paper of papers) {
    const authors = paper.authors.slice(0, 5);
    for (let i = 0; i < authors.length; i += 1) {
      for (let j = i + 1; j < authors.length; j += 1) {
        const key = pairKey(authors[i], authors[j]);
        const item = collaborationMap.get(key) ?? { source: authors[i], target: authors[j], paperIds: new Set<string>() };
        item.paperIds.add(paper.id);
        collaborationMap.set(key, item);
      }
    }
  }
  const authorCollaborations = [...collaborationMap.values()]
    .map((item) => ({ source: item.source, target: item.target, weight: item.paperIds.size, paperIds: [...item.paperIds] }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);

  const institutionMap = new Map<string, { countries: Set<string>; paperIds: Set<string>; citations: number; recent: number }>();
  const countryMap = new Map<string, { paperIds: Set<string>; citations: number; recent: number }>();
  for (const paper of papers) {
    for (const institution of paper.institutions) {
      const item = institutionMap.get(institution) ?? { countries: new Set<string>(), paperIds: new Set<string>(), citations: 0, recent: 0 };
      paper.countries.forEach((country) => item.countries.add(country));
      item.paperIds.add(paper.id);
      item.citations += paper.citedByCount;
      if (paper.year !== null && paper.year >= yearNow - 3) item.recent += 1;
      institutionMap.set(institution, item);
    }
    for (const country of paper.countries) {
      const item = countryMap.get(country) ?? { paperIds: new Set<string>(), citations: 0, recent: 0 };
      item.paperIds.add(paper.id);
      item.citations += paper.citedByCount;
      if (paper.year !== null && paper.year >= yearNow - 3) item.recent += 1;
      countryMap.set(country, item);
    }
  }

  const institutionTrends = [...institutionMap.entries()]
    .map(([institution, item]) => ({
      institution,
      countries: [...item.countries],
      paperCount: item.paperIds.size,
      recentCount: item.recent,
      totalCitations: item.citations,
      paperIds: [...item.paperIds]
    }))
    .sort((a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations)
    .slice(0, 10);

  const countryTrends = [...countryMap.entries()]
    .map(([country, item]) => ({
      country,
      paperCount: item.paperIds.size,
      recentCount: item.recent,
      totalCitations: item.citations,
      paperIds: [...item.paperIds]
    }))
    .sort((a, b) => b.paperCount - a.paperCount || b.totalCitations - a.totalCitations)
    .slice(0, 10);

  const recentShare = papers.filter((paper) => paper.year !== null && paper.year >= yearNow - 3).length / Math.max(1, papers.length);
  const averageCitations = papers.reduce((sum, paper) => sum + paper.citedByCount, 0) / Math.max(1, papers.length);
  const maturityScore = clamp(papers.length / 3 + averageCitations / 20 + (1 - recentShare) * 3);
  const stage = maturityScore >= 8 ? "saturated" : maturityScore >= 6 ? "maturing" : maturityScore >= 4 ? "developing" : "emerging";
  const topConceptShare = synthesis.trends[0]?.support ? synthesis.trends[0].support / Math.max(1, papers.length) : 0;
  const saturationScore = clamp(topConceptShare * 8 + averageCitations / 35);
  const saturationLevel = saturationScore >= 8 ? "high" : saturationScore >= 5 ? "moderate" : "low";

  return {
    keywordCooccurrences,
    publicationTrends,
    topicEvolution,
    authorCollaborations,
    institutionTrends,
    countryTrends,
    researchMaturity: {
      stage,
      score: maturityScore,
      evidence: `검색 문헌 ${papers.length}편, 최근 3년 비중 ${(recentShare * 100).toFixed(0)}%, 평균 OpenAlex 인용 ${averageCitations.toFixed(1)}회를 결합한 휴리스틱입니다.`
    },
    saturation: {
      level: saturationLevel,
      score: saturationScore,
      evidence: `상위 개념 '${synthesis.trends[0]?.label ?? "없음"}'의 검색 집합 내 비중 ${(topConceptShare * 100).toFixed(0)}%와 평균 인용 수를 사용한 포화도 신호입니다.`
    }
  };
}

export function buildLiteratureMap(papers: RetrievedPaper[], synthesis: Synthesis, graph: TheoryGraph): LiteratureMap {
  const foundationalTheories = synthesis.theories
    .map((item) => ({
      ...item,
      support: item.paperIds.filter((paperId) => (papers.find((paper) => paper.id === paperId)?.citedByCount ?? 0) > 0).length || item.support
    }))
    .sort((a, b) => b.support - a.support)
    .slice(0, 6);
  const adjacentCounts = new Map<string, Set<string>>();
  for (const paper of papers) {
    const lower = textFor(paper);
    for (const discipline of disciplineSignals) {
      if (lower.includes(discipline)) {
        const item = adjacentCounts.get(discipline) ?? new Set<string>();
        item.add(paper.id);
        adjacentCounts.set(discipline, item);
      }
    }
  }
  const adjacentDisciplines = topEvidenceByCount(adjacentCounts, 8);
  const competingFrameworks =
    synthesis.theories.length >= 2
      ? [
          {
            frameworks: synthesis.theories.slice(0, 3).map((item) => item.label),
            evidence: "여러 이론 라벨이 검색 집합에서 병렬로 나타납니다. 이는 경쟁 설명 가능성을 탐색하라는 신호이며 실제 논쟁은 원문 확인이 필요합니다.",
            confidence: "low" as const,
            paperIds: synthesis.theories.slice(0, 3).flatMap((item) => item.paperIds).slice(0, 8)
          }
        ]
      : [];

  const interdisciplinaryBridges: InterdisciplinaryBridge[] = graph.edges
    .filter((edge) => edge.type === "adjacent_framework" || edge.type === "concept_bridge")
    .slice(0, 8)
    .map((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      return {
        source,
        target,
        evidence: `검색 그래프에서 공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}입니다.`,
        confidence: edge.weight >= 4 ? "medium" : "low",
        paperIds: edge.paperIds
      };
    });

  const theoryEvolutionTimeline = papers
    .flatMap((paper) => {
      const lower = textFor(paper);
      return theorySignals
        .filter((theory) => lower.includes(theory))
        .map((theory) => ({
          year: paper.year,
          label: theory,
          evidence: paper.title,
          paperIds: [paper.id]
        }));
    })
    .filter((item): item is { year: number; label: string; evidence: string; paperIds: string[] } => item.year !== null)
    .sort((a, b) => a.year - b.year)
    .slice(0, 12);

  return {
    foundationalTheories,
    dominantFrameworks: synthesis.theories.slice(0, 6),
    competingFrameworks,
    adjacentDisciplines,
    interdisciplinaryBridges,
    theoryEvolutionTimeline
  };
}

function section(title: string, evidence: string[], inferredSynthesis: string, generatedNarrative: string): LiteratureReviewSection {
  return { title, retrievedEvidence: evidence, inferredSynthesis, generatedNarrative };
}

function evidenceTitles(papers: RetrievedPaper[], paperIds: string[], limit = 4): string[] {
  const byId = paperTitleMap(papers);
  return paperIds.map((paperId) => byId.get(paperId)?.title).filter((title): title is string => Boolean(title)).slice(0, limit);
}

export function detectDebates(papers: RetrievedPaper[], synthesis: Synthesis, bibliometric: BibliometricAnalysis): DebateSignal[] {
  const signals: DebateSignal[] = [];
  const contradictionPatterns = [/conflict/, /contradict/, /inconsistent/, /mixed findings/, /however/, /whereas/, /debate/, /controvers/];
  const explicitPapers = papers.filter((paper) => contradictionPatterns.some((pattern) => pattern.test(textFor(paper))));
  if (explicitPapers.length > 0) {
    signals.push({
      type: "inconsistent_empirical_evidence",
      claim: "일부 초록이 상반·혼재·논쟁 신호를 명시합니다.",
      evidence: `검색 문헌 ${explicitPapers.length}편에서 conflict, inconsistent, mixed findings, however, debate 등 명시적 표현이 감지되었습니다.`,
      confidence: "low",
      paperIds: explicitPapers.slice(0, 8).map((paper) => paper.id)
    });
  }

  const methodFamilies = bibliometric.keywordCooccurrences
    .filter((item) => /survey|experiment|review|regression|model|analysis/i.test(`${item.source} ${item.target}`))
    .slice(0, 3);
  if (methodFamilies.length > 0) {
    signals.push({
      type: "methodological_disagreement",
      claim: "검색 집합 안에서 서로 다른 연구 설계 신호가 병존합니다.",
      evidence: `방법론 관련 키워드 공출현 ${methodFamilies.length}개가 감지되었습니다. 이는 직접적인 학술 논쟁이 아니라 설계 비교가 필요한 신호입니다.`,
      confidence: "low",
      paperIds: [...new Set(methodFamilies.flatMap((item) => item.paperIds))].slice(0, 8)
    });
  }

  if (synthesis.theories.length >= 2) {
    signals.push({
      type: "competing_theoretical_explanations",
      claim: "복수 이론 프레임워크가 동일 검색 집합에서 설명 후보로 나타납니다.",
      evidence: `${synthesis.theories.slice(0, 3).map((item) => item.label).join(", ")}가 검색 문헌에서 감지되었습니다. 경쟁 관계 자체는 원문 검토가 필요합니다.`,
      confidence: "low",
      paperIds: synthesis.theories.slice(0, 3).flatMap((item) => item.paperIds).slice(0, 8)
    });
  }

  return signals.slice(0, 6);
}

export function buildLiteratureReviewDraft(
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  gaps: Gap[],
  literatureMap: LiteratureMap,
  trendAnalysis: TrendAnalysis,
  debates: DebateSignal[]
): LiteratureReviewDraft {
  const topPapers = [...papers].sort((a, b) => b.citedByCount - a.citedByCount).slice(0, 5).map((paper) => paper.title);
  const introductionOverview = section(
    "Introduction overview",
    topPapers,
    `검색된 OpenAlex 문헌 ${papers.length}편을 기준으로 ${synthesis.trends.slice(0, 3).map((item) => item.label).join(", ") || "주요 개념"}이 반복적으로 나타납니다.`,
    "이 문헌 집합은 입력 키워드 주변의 기술·학습·심리적 구성개념을 연결하는 연구 흐름을 보여준다. 아래 문단은 검색 메타데이터에서 추출한 근거와 규칙 기반 종합을 바탕으로 작성된 초안이며, 원문 검토 전 최종 문헌고찰로 사용하면 안 된다."
  );
  const thematicGrouping = synthesis.trends.slice(0, 4).map((theme) =>
    section(
      theme.label,
      evidenceTitles(papers, theme.paperIds),
      `${theme.support}편이 이 주제 신호를 포함합니다.`,
      `${theme.label} 관련 문헌은 연구문제의 핵심 맥락을 구성한다. 이 주제는 다른 이론·방법론 신호와 함께 해석될 때 연구모형의 변수 또는 배경 요인으로 활용될 수 있다.`
    )
  );
  const theorySynthesis = section(
    "Theory synthesis",
    evidenceTitles(papers, literatureMap.dominantFrameworks.flatMap((item) => item.paperIds)),
    `주요 이론 신호: ${literatureMap.dominantFrameworks.map((item) => `${item.label}(${item.support})`).join(", ") || "명시 신호 부족"}.`,
    "지배적 프레임워크는 검색된 제목·초록·개념 필드에서 반복적으로 등장한 이론 라벨을 중심으로 구성된다. 서로 다른 프레임워크의 관계는 공출현 신호이며, 실제 이론 통합 가능성은 원문과 측정모형을 검토해야 한다."
  );
  const trendDiscussion = section(
    "Trend discussion",
    evidenceTitles(papers, trendAnalysis.risingTopics.flatMap((item) => item.paperIds)),
    `상승 주제 ${trendAnalysis.risingTopics.length}개, 하락 주제 ${trendAnalysis.decliningTopics.length}개가 검색 집합 안에서 감지되었습니다.`,
    "최근 출판연도에 더 많이 나타나는 주제는 후속 연구 기회가 될 수 있으나, 검색 집합 크기와 최신 논문의 인용 지연을 함께 고려해야 한다."
  );
  const contradictionAnalysis = section(
    "Contradiction and debate analysis",
    evidenceTitles(papers, debates.flatMap((debate) => debate.paperIds)),
    debates.length > 0 ? debates.map((debate) => debate.claim).join(" ") : "명시적인 상반 주장이나 논쟁 신호는 검색 메타데이터에서 충분히 확인되지 않았습니다.",
    debates.length > 0
      ? "검색 문헌은 방법론, 이론 설명, 또는 경험적 결과 해석에서 추가 검토가 필요한 긴장을 포함한다. 이 신호는 논쟁의 존재를 확정하지 않고, 원문 비교가 필요한 지점을 표시한다."
      : "현재 검색 결과만으로는 학술적 논쟁을 주장하기 어렵다. 문헌고찰에서는 '논쟁 부재'가 아니라 '검색 메타데이터에서 명시 신호 부족'으로 표현하는 편이 안전하다."
  );
  const gapSummary = section(
    "Gap summary",
    evidenceTitles(papers, gaps.flatMap((gap) => gap.paperIds)),
    gaps.map((gap) => gap.evidence).join(" "),
    "연구 갭은 검색 집합 내 빈도, 공출현 밀도, 방법론 다양성, 최근성 신호를 종합한 후보이다. 이는 체계적 문헌고찰의 결론이 아니라 후속 검토를 위한 우선순위 목록으로 해석해야 한다."
  );
  const futureResearchDirections = section(
    "Future research directions",
    evidenceTitles(papers, synthesis.emergingTopics.flatMap((item) => item.paperIds)),
    `부상 주제: ${synthesis.emergingTopics.map((item) => item.label).join(", ") || "명시 신호 부족"}.`,
    "후속 연구는 부상 주제와 약한 이론 연결을 결합하되, 충분한 표본·자료 접근성·측정 타당도를 확보하는 방향으로 설계되어야 한다."
  );
  const allSections = [introductionOverview, ...thematicGrouping, theorySynthesis, trendDiscussion, contradictionAnalysis, gapSummary, futureResearchDirections];
  const exportMarkdown = allSections
    .map((item) => `## ${item.title}\n\n**Retrieved evidence**\n${item.retrievedEvidence.map((evidence) => `- ${evidence}`).join("\n") || "- 명시 근거 부족"}\n\n**Inferred synthesis**\n${item.inferredSynthesis}\n\n**Generated narrative**\n${item.generatedNarrative}`)
    .join("\n\n");

  return {
    introductionOverview,
    thematicGrouping,
    theorySynthesis,
    trendDiscussion,
    contradictionAnalysis,
    gapSummary,
    futureResearchDirections,
    exportMarkdown
  };
}

export function buildResearchRoadmap(
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  gaps: Gap[],
  citationIntelligence: CitationIntelligence,
  bibliometric: BibliometricAnalysis,
  literatureMap: LiteratureMap
): ResearchRoadmap {
  const safeEvidence = papers.slice(0, 4).map((paper) => paper.id);
  const rising = bibliometric.topicEvolution.filter((topic) => topic.trajectory === "rising");
  return {
    beginnerSafeTopics: synthesis.trends.slice(0, 3).map((trend) => ({
      title: `${trend.label} 중심의 재현 가능한 확장 연구`,
      rationale: "검색 문헌에서 반복적으로 나타나는 개념이므로 선행연구 기반을 확보하기 쉽습니다.",
      evidence: `${trend.support}편에서 감지된 주제 신호입니다.`,
      paperIds: trend.paperIds
    })),
    highImpactHighRiskTopics: gaps.slice(0, 3).map((gap) => ({
      title: gap.claim,
      rationale: "낮은 빈도 또는 약한 연결 신호가 있어 참신성은 있으나 원문 검토와 설계 정교화가 필요합니다.",
      evidence: gap.evidence,
      paperIds: gap.paperIds
    })),
    futureTrendForecasts: rising.slice(0, 3).map((topic) => ({
      title: `${topic.label}의 단기 성장 가능성 점검`,
      rationale: "최근 3년 출현 수가 이전 출현 수보다 높은 검색 집합 내부 신호입니다.",
      evidence: `최근 ${topic.recentCount}회, 이전 ${topic.earlyCount}회 감지되었습니다.`,
      paperIds: topic.paperIds
    })),
    recommendedNextStepStudies: citationIntelligence.researchClusters.slice(0, 3).map((cluster) => ({
      title: `${cluster.label} 클러스터의 비교 연구`,
      rationale: "클러스터 내 문헌을 기준으로 변수와 방법론을 정리하면 후속 실증 설계로 이동하기 쉽습니다.",
      evidence: cluster.evidence,
      paperIds: cluster.paperIds
    })),
    unexploredInterdisciplinaryCombinations: literatureMap.interdisciplinaryBridges.slice(0, 3).map((bridge) => ({
      title: `${bridge.source}와 ${bridge.target}의 융합 연구`,
      rationale: "공출현은 있으나 강한 연결이라고 단정할 수 없어 탐색적 융합 주제로 적합합니다.",
      evidence: bridge.evidence,
      paperIds: bridge.paperIds.length > 0 ? bridge.paperIds : safeEvidence
    }))
  };
}
