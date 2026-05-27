import type {
  Discipline,
  EvidenceItem,
  Gap,
  Methodology,
  ScholarlyMemoryRecord,
  ResearcherProfile,
  ResearchStrategy,
  ResearchIntelligenceResult,
  RetrievedPaper,
  Scores,
  Synthesis,
  RelationshipInsight,
  TheoryGraph,
  Topic
} from "./types";
import { methodologies } from "./types";
import { analyzeRelationships, buildTheoryGraph, buildTrendAnalysis } from "./graph";
import { buildCopilotIntelligence, buildResearchPlan, recommendMethodologies } from "./copilot";
import { buildResearchDesignGuidance, disciplineLabels, getDomainIntelligence, getMethodologySignals, methodologyLabels, theorySignals } from "./domain";
import {
  buildBibliometricAnalysis,
  buildCitationIntelligence,
  buildLiteratureMap,
  buildLiteratureReviewDraft,
  buildResearchRoadmap,
  detectDebates
} from "./bibliometrics";
import {
  buildCompetitionIntelligence,
  buildDatasetIntelligence,
  buildExportBundle,
  buildLongTermRoadmap,
  buildPublicationIntelligence,
  orderGapsByStrategy,
  tuneTopicForStrategy
} from "./strategy";
import {
  buildAutonomousExploration,
  buildDeepResearchSynthesis,
  buildMultiAgentWorkflow,
  buildResearchForecast,
  buildResearchMemorySeed
} from "./agents";
import { buildAcademicResearchOS } from "./operating-system";
import { buildSelfImprovingAcademicIntelligence } from "./self-improving";
import { buildAgenticResearchLoop } from "./refinement-loop";
import { buildPersistentScholarlyMemory } from "./scholarly-memory";
import { buildPredictiveAcademicIntelligence } from "./predictive-intelligence";
import { buildAutonomousAcademicOS } from "./autonomous-os";
import { buildSelfEvolvingAcademicEcosystem } from "./self-evolving-ecosystem";

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

const gapFocusKo: Record<Gap["type"], string> = {
  underexplored_intersection: "덜 탐색된 교차점",
  sparse_theory_combination: "희소 이론 조합",
  weak_methodology_coverage: "방법론 보완",
  emerging_immature_domain: "초기 부상 영역"
};

function textFor(paper: RetrievedPaper): string {
  return `${paper.title} ${paper.abstract} ${paper.concepts.join(" ")}`.toLowerCase();
}

function topEvidence(labels: string[], papers: RetrievedPaper[], limit = 6): EvidenceItem[] {
  const items = labels
    .map((label) => {
      const paperIds = papers.filter((paper) => textFor(paper).includes(label.toLowerCase())).map((paper) => paper.id);
      return { label, paperIds, support: paperIds.length };
    })
    .filter((item) => item.support > 0)
    .sort((a, b) => b.support - a.support || a.label.localeCompare(b.label));
  return items.slice(0, limit);
}

function conceptFrequency(papers: RetrievedPaper[]): EvidenceItem[] {
  const counts = new Map<string, Set<string>>();
  for (const paper of papers) {
    for (const concept of paper.concepts) {
      const normalized = concept.trim();
      if (normalized.length < 3) continue;
      if (!counts.has(normalized)) counts.set(normalized, new Set());
      counts.get(normalized)?.add(paper.id);
    }
  }
  return [...counts.entries()]
    .filter(([label]) => !broadConcepts.has(label.toLowerCase()))
    .map(([label, paperIds]) => ({ label, paperIds: [...paperIds], support: paperIds.size }))
    .sort((a, b) => b.support - a.support)
    .slice(0, 8);
}

function dedupeEvidence(items: EvidenceItem[]): EvidenceItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sentenceEvidence(papers: RetrievedPaper[], patterns: RegExp[], fallbackLabels: string[]): EvidenceItem[] {
  const matched = fallbackLabels.map((label) => ({ label, paperIds: new Set<string>() }));
  for (const paper of papers) {
    const sentences = paper.abstract.split(/(?<=[.!?])\s+/).slice(-4);
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      patterns.forEach((pattern, index) => {
        if (pattern.test(lower)) matched[index].paperIds.add(paper.id);
      });
    }
  }
  return matched
    .map((item) => ({ label: item.label, paperIds: [...item.paperIds], support: item.paperIds.size }))
    .filter((item) => item.support > 0);
}

export function synthesizeLiterature(papers: RetrievedPaper[]): Synthesis {
  const theories = topEvidence(theorySignals, papers);
  const trends = conceptFrequency(papers);
  const limitations = sentenceEvidence(
    papers,
    [/future research|future work|limited|limitation|small sample|cross-sectional|generaliz/],
    ["초록에 명시된 한계 및 후속 연구 언급"]
  );
  const relatedTheories = trends.filter((trend) => !theories.some((theory) => theory.label.toLowerCase() === trend.label.toLowerCase())).slice(0, 6);
  const currentYear = new Date().getFullYear();
  const emergingTopics = dedupeEvidence(conceptFrequency(papers.filter((paper) => paper.year !== null && paper.year >= currentYear - 4))).slice(0, 6);

  return { theories, trends, limitations, relatedTheories, emergingTopics };
}

function methodCoverage(papers: RetrievedPaper[]): Record<Methodology, number> {
  return Object.fromEntries(
    methodologies.map((method) => [
      method,
      papers.filter((paper) => getMethodologySignals(method).some((signal) => textFor(paper).includes(signal))).length
    ])
  ) as Record<Methodology, number>;
}

function isQuantitativeMethod(methodology: Methodology): boolean {
  return [
    "quantitative",
    "SEM",
    "PLS-SEM",
    "regression",
    "multilevel modeling",
    "panel analysis",
    "longitudinal analysis",
    "experimental design",
    "quasi-experimental design",
    "causal inference",
    "econometrics",
    "Bayesian analysis",
    "time-series analysis",
    "network analysis"
  ].includes(methodology);
}

function isReviewMethod(methodology: Methodology): boolean {
  return ["systematic review", "scoping review", "meta-analysis", "bibliometric analysis", "scientometric analysis"].includes(methodology);
}

export function detectGaps(
  keywords: string[],
  methodology: Methodology,
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  graph?: TheoryGraph,
  relationships: RelationshipInsight[] = []
): Gap[] {
  const gaps: Gap[] = [];
  const queryIntersection = keywords.map((keyword) => keyword.toLowerCase());
  const intersectionPapers = papers.filter((paper) => queryIntersection.every((keyword) => textFor(paper).includes(keyword)));

  if (papers.length > 0 && intersectionPapers.length <= Math.max(2, Math.floor(papers.length * 0.2))) {
    gaps.push({
      type: "underexplored_intersection",
      claim: `${keywords.join(", ")}의 전체 교차 주제는 개별 주제에 비해 검색된 문헌 집합에서 상대적으로 덜 나타납니다.`,
      evidence: `검색된 ${papers.length}편 중 ${intersectionPapers.length}편이 제목, 초록, 개념 필드에서 입력 키워드를 모두 언급합니다.`,
      confidence: intersectionPapers.length === 0 ? "medium" : "low",
      paperIds: intersectionPapers.map((paper) => paper.id)
    });
  }

  const topTheories = synthesis.theories.slice(0, 3);
  if (topTheories.length >= 2) {
    const paired = papers.filter((paper) => topTheories.slice(0, 2).every((theory) => textFor(paper).includes(theory.label.toLowerCase())));
    if (paired.length <= 1) {
      gaps.push({
        type: "sparse_theory_combination",
        claim: `${topTheories[0].label}와 ${topTheories[1].label}의 조합은 검색된 근거 안에서 드물게 함께 나타납니다.`,
        evidence: `검색된 문헌 중 ${paired.length}편이 두 이론 라벨을 모두 포함합니다.`,
        confidence: "low",
        paperIds: paired.map((paper) => paper.id)
      });
    }
  }

  const coverage = methodCoverage(papers);
  if (coverage[methodology] <= Math.max(1, Math.floor(papers.length * 0.15))) {
    gaps.push({
      type: "weak_methodology_coverage",
      claim: `${methodologyLabels[methodology]} 설계는 검색된 제목과 초록에서 비교적 적게 나타납니다.`,
      evidence: `검색된 ${papers.length}편 중 ${coverage[methodology]}편이 명시적인 ${methodologyLabels[methodology]} 방법론 신호를 포함합니다.`,
      confidence: "medium",
      paperIds: papers.filter((paper) => getMethodologySignals(methodology).some((signal) => textFor(paper).includes(signal))).map((paper) => paper.id)
    });
  }

  if (isQuantitativeMethod(methodology)) {
    const causalSignals = ["experiment", "randomized", "longitudinal", "panel data", "field trial", "causal"];
    const causalPapers = papers.filter((paper) => causalSignals.some((signal) => textFor(paper).includes(signal)));
    if (causalPapers.length <= Math.max(2, Math.floor(papers.length * 0.3))) {
      gaps.push({
        type: "weak_methodology_coverage",
        claim: "인과적 또는 종단적 양적 연구 설계가 검색된 메타데이터에서 비교적 적게 나타납니다.",
        evidence: `검색된 ${papers.length}편 중 ${causalPapers.length}편이 인과, 실험, 무작위배정, 패널자료, 현장실험, 종단 연구 신호를 명시적으로 포함합니다.`,
        confidence: "medium",
        paperIds: causalPapers.map((paper) => paper.id)
      });
    }
  }

  const emerging = synthesis.emergingTopics.find((topic) => topic.support > 0 && topic.support <= 3);
  if (emerging) {
    gaps.push({
      type: "emerging_immature_domain",
      claim: `${emerging.label}는 최근 문헌에 나타나지만 이번 검색 집합에서는 근거 수가 제한적입니다.`,
      evidence: `최근 검색 문헌 중 ${emerging.support}편이 이 개념을 포함합니다.`,
      confidence: "low",
      paperIds: emerging.paperIds
    });
  }

  if (graph) {
    const lowDensityEdges = graph.edges.filter((edge) => edge.weight <= 2 && edge.density <= 0.12);
    if (lowDensityEdges.length > 0) {
      const edge = lowDensityEdges[0];
      const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      gaps.push({
        type: "sparse_theory_combination",
        claim: `${source}와 ${target}의 연결은 그래프에서 낮은 공출현 밀도를 보입니다.`,
        evidence: `검색 문헌 ${papers.length}편 기준 공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}입니다.`,
        confidence: "low",
        paperIds: edge.paperIds
      });
    }

    const weakCitation = relationships.find((insight) => insight.type === "weak_citation_cluster");
    if (weakCitation) {
      gaps.push({
        type: "emerging_immature_domain",
        claim: "일부 연결 조합은 낮은 인용 신호를 보여 성숙도가 낮을 가능성이 있습니다.",
        evidence: `${weakCitation.title}: ${weakCitation.evidence}`,
        confidence: "low",
        paperIds: weakCitation.paperIds
      });
    }

    if (graph.metrics.methodologyDiversity <= 2) {
      gaps.push({
        type: "weak_methodology_coverage",
        claim: "이 검색 집합은 방법론 다양성이 제한적입니다.",
        evidence: `그래프에서 감지된 방법론 노드가 ${graph.metrics.methodologyDiversity}개입니다.`,
        confidence: "medium",
        paperIds: graph.nodes.filter((node) => node.type === "methodology").flatMap((node) => node.paperIds).slice(0, 8)
      });
    }
  }

  const seen = new Set<string>();
  return gaps.filter((gap) => {
    const key = `${gap.type}:${gap.claim}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function scoreTopic(papers: RetrievedPaper[], gap: Gap, methodology: Methodology): Scores {
  const availabilityBoost = isReviewMethod(methodology) ? papers.length / 4 : papers.length / 6;
  const saturationBase = gap.paperIds.length / Math.max(1, papers.length);
  return {
    novelty: clampScore(7 + (gap.confidence === "medium" ? 1 : 0) - Math.min(gap.paperIds.length, 3)),
    feasibility: clampScore(5 + availabilityBoost),
    publishability: clampScore(5 + Math.min(papers.filter((paper) => paper.year && paper.year >= new Date().getFullYear() - 5).length / 4, 3)),
    dataAvailability: clampScore(4 + availabilityBoost),
    saturation: clampScore(10 - saturationBase * 10)
  };
}

export function generateTopics(
  keywords: string[],
  discipline: Discipline,
  methodology: Methodology,
  strategy: ResearchStrategy,
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  gaps: Gap[],
  graph?: TheoryGraph
): Topic[] {
  const primaryTheory = synthesis.theories[0]?.label ?? synthesis.trends[0]?.label ?? keywords[0];
  const secondaryConcept =
    synthesis.relatedTheories.find((item) => {
      const label = item.label.toLowerCase();
      return !label.includes(discipline.toLowerCase()) && !label.includes("education") && !keywords.some((keyword) => label.includes(keyword.toLowerCase()));
    })?.label ??
    synthesis.relatedTheories[0]?.label ??
    keywords[1] ??
    "learning outcomes";
  const usableGaps = orderGapsByStrategy(gaps.length > 0 ? gaps : [
    {
      type: "underexplored_intersection" as const,
      claim: `검색된 근거는 ${keywords.join(", ")} 주변의 탐색적 주제 생성을 뒷받침하지만, 강한 연구 갭은 탐지되지 않았습니다.`,
      evidence: "이 보조 추론은 검색된 개념에 기반하며, 확정적인 문헌 갭 주장으로 해석하면 안 됩니다.",
      confidence: "low" as const,
      paperIds: papers.slice(0, 3).map((paper) => paper.id)
    }
  ], strategy);

  return usableGaps.slice(0, 4).map((gap, index) => {
    const context = keywords.join(", ");
    const disciplineLabel = disciplineLabels[discipline];
    const methodologyLabel = methodologyLabels[methodology];
    const adjacentTheories = [
      ...synthesis.theories.slice(1, 4).map((item) => item.label),
      ...synthesis.relatedTheories.slice(0, 3).map((item) => item.label)
    ].filter((value, position, values) => values.indexOf(value) === position);
    const variables = [primaryTheory, secondaryConcept, ...keywords].filter((value, position, values) => values.indexOf(value) === position).slice(0, 6);
    const mediatorsModerators = [secondaryConcept, synthesis.trends[0]?.label, synthesis.trends[1]?.label]
      .filter((value): value is string => Boolean(value))
      .filter((value, position, values) => values.indexOf(value) === position)
      .slice(0, 3);
    const scores = scoreTopic(papers, gap, methodology);
    const baseTopic: Topic = {
      title: `${disciplineLabel} 맥락에서 ${primaryTheory}와 ${secondaryConcept}의 관계: ${context}에 관한 ${methodologyLabel} (${gapFocusKo[gap.type]})`,
      rationale: `${gap.claim} 이 주제는 OpenAlex 메타데이터에서 생성한 추론이며, 투고 전 원문 검토로 반드시 검증해야 합니다.`,
      researchQuestion: `${disciplineLabel} 맥락에서 ${primaryTheory}와 ${secondaryConcept}는 ${context} 관련 결과에 어떤 영향을 미치는가?`,
      hypotheses:
        isQuantitativeMethod(methodology)
          ? [
              `${primaryTheory}는 ${keywords.at(-1) ?? context} 관련 핵심 결과와 정적 관계를 보일 것이다.`,
              `${secondaryConcept}는 ${primaryTheory}와 핵심 결과 간 관계를 매개하거나 조절할 것이다.`
            ]
          : [`참여자들은 ${primaryTheory}가 ${context} 경험을 형성하는 요인이라고 설명할 것이다.`],
      recommendedMethodology: methodology,
      variables,
      coreTheory: primaryTheory,
      adjacentTheories,
      mediatorsModerators,
      methodologyRecommendations: [],
      expectedContribution: `${primaryTheory} 중심 설명과 ${secondaryConcept} 인접 개념을 연결해 이론적 설명 범위를 확장할 수 있습니다.`,
      risksLimitations: [
        "OpenAlex 메타데이터와 초록 기반 추론이므로 원문 검토 전에는 확정적 갭으로 주장하면 안 됩니다.",
        "변수 간 방향성과 측정 타당도는 실제 척도 검토와 연구설계로 재검증해야 합니다.",
        scores.saturation <= 4 ? "포화도가 낮아 참신성은 높지만 선행연구 기반이 약할 수 있습니다." : "문헌 지지가 있는 편이지만 차별화 논리를 더 선명하게 만들어야 합니다."
      ],
      publicationSuitabilityEstimate:
        scores.publishability >= 8
          ? "출판 적합성 높음: 최근 문헌성과 실행 가능성이 비교적 좋습니다."
          : scores.publishability >= 6
            ? "출판 적합성 중간: 이론적 차별화와 방법론 정교화가 필요합니다."
            : "출판 적합성 낮음: 선행연구 지지와 데이터 확보 계획을 보강해야 합니다.",
      researchPlan: {
        researchQuestions: [],
        hypothesesPropositions: [],
        conceptualModel: "",
        sampleDataRecommendations: [],
        dataCollectionMethods: [],
        futureExpansionDirections: []
      },
      researchDesignGuidance: {
        recommendedSampleType: "",
        estimatedSampleSizeGuidance: "",
        suggestedAnalysisMethod: methodologyLabel,
        dataCollectionApproaches: [],
        journalConferenceDirections: [],
        methodologyRisks: []
      },
      datasetIntelligence: buildDatasetIntelligence(discipline, methodology, strategy, papers),
      academicContribution: `검색 문헌에서 약하게 연결된 교차점을 검증합니다: ${gap.evidence}`,
      practicalContribution: `${disciplineLabel} 현장에서 어떤 개념이 측정 가능하고 실행 가능하며 개입 설계에 적합한지 판단하는 데 도움을 줄 수 있습니다.`,
      scores,
      evidencePaperIds: gap.paperIds.length > 0 ? gap.paperIds : papers.slice(index, index + 3).map((paper) => paper.id),
      inferenceNotice: "생성된 추론입니다. 연결된 근거는 신호와 빈도만 뒷받침하며, 사람의 검토 없이 연구 갭을 증명하지 않습니다."
    };
    const completedTopic = graph
      ? {
          ...baseTopic,
          methodologyRecommendations: recommendMethodologies(baseTopic, papers, graph, discipline, methodology),
          researchPlan: buildResearchPlan(baseTopic, synthesis, papers, graph, discipline),
          researchDesignGuidance: buildResearchDesignGuidance(baseTopic, discipline, methodology)
        }
      : baseTopic;
    return tuneTopicForStrategy(completedTopic, strategy);
  });
}

export function buildResearchIntelligenceResult(
  keywords: string[],
  discipline: Discipline,
  methodology: Methodology,
  papers: RetrievedPaper[],
  strategy: ResearchStrategy = "beginner-safe research",
  researcherProfile?: Partial<ResearcherProfile>,
  priorMemoryRecords: ScholarlyMemoryRecord[] = []
): ResearchIntelligenceResult {
  const synthesis = synthesizeLiterature(papers);
  const theoryGraph = buildTheoryGraph(papers, keywords);
  const relationshipAnalysis = analyzeRelationships(theoryGraph, papers);
  const trendAnalysis = buildTrendAnalysis(papers, theoryGraph);
  const citationIntelligence = buildCitationIntelligence(papers);
  const bibliometricAnalysis = buildBibliometricAnalysis(papers, synthesis);
  const literatureMap = buildLiteratureMap(papers, synthesis, theoryGraph);
  const debateAnalysis = detectDebates(papers, synthesis, bibliometricAnalysis);
  const gaps = detectGaps(keywords, methodology, papers, synthesis, theoryGraph, relationshipAnalysis);
  const topics = generateTopics(keywords, discipline, methodology, strategy, papers, synthesis, gaps, theoryGraph);
  const copilot = buildCopilotIntelligence(topics, synthesis, theoryGraph, relationshipAnalysis, trendAnalysis, gaps, papers);
  const literatureReviewDraft = buildLiteratureReviewDraft(papers, synthesis, gaps, literatureMap, trendAnalysis, debateAnalysis);
  const researchRoadmap = buildResearchRoadmap(papers, synthesis, gaps, citationIntelligence, bibliometricAnalysis, literatureMap);
  const publicationIntelligence = buildPublicationIntelligence(papers, methodology, strategy);
  const datasetIntelligence = buildDatasetIntelligence(discipline, methodology, strategy, papers);
  const longTermResearchRoadmap = buildLongTermRoadmap(topics, synthesis, strategy);
  const competitionIntelligence = buildCompetitionIntelligence(synthesis, trendAnalysis, bibliometricAnalysis);
  const exportBundle = buildExportBundle(topics, papers, publicationIntelligence);
  const multiAgentWorkflow = buildMultiAgentWorkflow(
    papers,
    synthesis,
    citationIntelligence,
    gaps,
    topics,
    debateAnalysis,
    researchRoadmap,
    discipline,
    methodology,
    strategy
  );
  const autonomousExploration = buildAutonomousExploration(synthesis, theoryGraph, literatureMap, gaps, topics, discipline);
  const deepResearchSynthesis = buildDeepResearchSynthesis(synthesis, literatureMap, debateAnalysis, topics);
  const researchForecast = buildResearchForecast(competitionIntelligence, trendAnalysis, researchRoadmap, bibliometricAnalysis);
  const researchMemorySeed = buildResearchMemorySeed(topics, theoryGraph, literatureMap, strategy);
  const academicResearchOS = buildAcademicResearchOS(
    topics,
    papers,
    synthesis,
    literatureReviewDraft,
    citationIntelligence,
    debateAnalysis,
    gaps,
    bibliometricAnalysis,
    publicationIntelligence,
    competitionIntelligence,
    discipline,
    methodology,
    strategy
  );
  const selfImprovingIntelligence = buildSelfImprovingAcademicIntelligence({
    profile: researcherProfile,
    discipline,
    methodology,
    strategy,
    papers,
    synthesis,
    graph: theoryGraph,
    trendAnalysis,
    gaps,
    topics,
    bibliometricAnalysis,
    competitionIntelligence,
    researchForecast,
    researchRoadmap,
    academicResearchOS,
    authorInfluence: citationIntelligence.authorInfluence,
    interdisciplinaryBridges: literatureMap.interdisciplinaryBridges,
    longRangeConceptDiscovery: [
      ...autonomousExploration.adjacentTheoryPaths,
      ...autonomousExploration.emergingConceptPaths,
      ...autonomousExploration.weakDomainExpansionPaths
    ]
  });
  const agenticResearchLoop = buildAgenticResearchLoop({
    topics,
    graph: theoryGraph,
    synthesis,
    bibliometricAnalysis,
    gaps,
    methodology,
    discipline,
    researcherProfile
  });
  const persistentScholarlyMemory = buildPersistentScholarlyMemory({
    keywords,
    discipline,
    methodology,
    strategy,
    researcherProfile,
    papers,
    synthesis,
    graph: theoryGraph,
    gaps,
    topics,
    bibliometricAnalysis,
    datasetIntelligence,
    priorRecords: priorMemoryRecords
  });
  const predictiveAcademicIntelligence = buildPredictiveAcademicIntelligence({
    topics,
    papers,
    synthesis,
    trendAnalysis,
    competitionIntelligence,
    bibliometricAnalysis,
    graph: theoryGraph,
    publicationIntelligence,
    persistentMemory: persistentScholarlyMemory,
    methodology,
    discipline,
    strategy
  });
  const autonomousAcademicOS = buildAutonomousAcademicOS({
    topics,
    papers,
    synthesis,
    gaps,
    debates: debateAnalysis,
    academicOS: academicResearchOS,
    multiAgentWorkflow,
    predictive: predictiveAcademicIntelligence,
    memory: persistentScholarlyMemory,
    selfImproving: selfImprovingIntelligence,
    competition: competitionIntelligence,
    bibliometric: bibliometricAnalysis,
    discipline,
    methodology,
    strategy
  });
  const selfEvolvingAcademicEcosystem = buildSelfEvolvingAcademicEcosystem({
    papers,
    synthesis,
    graph: theoryGraph,
    trendAnalysis,
    gaps,
    topics,
    competition: competitionIntelligence,
    bibliometric: bibliometricAnalysis,
    predictive: predictiveAcademicIntelligence,
    memory: persistentScholarlyMemory,
    selfImproving: selfImprovingIntelligence,
    autonomousOS: autonomousAcademicOS,
    strategy
  });
  const domainIntelligence = getDomainIntelligence(discipline);

  return {
    query: { keywords, discipline, methodology, strategy },
    papers,
    synthesis,
    theoryGraph,
    relationshipAnalysis,
    trendAnalysis,
    citationIntelligence,
    bibliometricAnalysis,
    literatureMap,
    literatureReviewDraft,
    debateAnalysis,
    researchRoadmap,
    publicationIntelligence,
    datasetIntelligence,
    longTermResearchRoadmap,
    competitionIntelligence,
    exportBundle,
    multiAgentWorkflow,
    autonomousExploration,
    deepResearchSynthesis,
    researchForecast,
    researchMemorySeed,
    academicResearchOS,
    selfImprovingIntelligence,
    agenticResearchLoop,
    persistentScholarlyMemory,
    predictiveAcademicIntelligence,
    autonomousAcademicOS,
    selfEvolvingAcademicEcosystem,
    copilot,
    domainIntelligence,
    gaps,
    topics,
    diagnostics: {
      retrievedCount: papers.length,
      source: "OpenAlex",
      generatedAt: new Date().toISOString(),
      warnings: papers.length === 0 ? ["이 질의로 OpenAlex에서 검색된 논문이 없습니다."] : []
    }
  };
}
