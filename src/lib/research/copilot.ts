import type {
  CopilotIntelligence,
  Gap,
  MethodologyRecommendation,
  RecommendedMethod,
  RelationshipInsight,
  ResearchPlan,
  RetrievedPaper,
  Synthesis,
  TheoryGraph,
  Topic,
  TopicComparison,
  TrendAnalysis,
  Discipline,
  Methodology
} from "./types";
import { getDomainIntelligence, methodologyLabels, recommendedMethodsForDomain } from "./domain";

function clamp(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function supportEvidence(papers: RetrievedPaper[], paperIds: string[]): string {
  const count = new Set(paperIds).size;
  return `검색 문헌 ${papers.length}편 중 관련 근거 ${count}편을 사용한 추론입니다.`;
}

const allRecommendedMethods: RecommendedMethod[] = [
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
  "network analysis",
  "grounded theory",
  "thematic analysis",
  "discourse analysis",
  "narrative inquiry",
  "phenomenology",
  "ethnography",
  "case study",
  "content analysis",
  "mixed methods",
  "systematic review",
  "scoping review",
  "meta-analysis",
  "bibliometric analysis",
  "scientometric analysis"
];

function methodBaseFit(method: RecommendedMethod, variableCount: number, density: number, graph: TheoryGraph): number {
  const lowMaturity = density <= 12 || graph.metrics.weakConnectionCount >= 8;
  const reviewReady = density >= 18;
  const quantitativeReady = variableCount >= 3 && density >= 8;
  if (["SEM", "PLS-SEM"].includes(method)) return variableCount >= 4 && density >= 12 ? 8 : 5;
  if (["regression", "multilevel modeling", "panel analysis", "longitudinal analysis", "econometrics", "time-series analysis", "Bayesian analysis"].includes(method)) return quantitativeReady ? 8 : 5;
  if (["experimental design", "quasi-experimental design", "causal inference"].includes(method)) return density >= 10 ? 7 : 5;
  if (method === "network analysis") return graph.edges.length >= 20 ? 8 : 5;
  if (["grounded theory", "thematic analysis", "discourse analysis", "narrative inquiry", "phenomenology", "ethnography", "case study", "content analysis"].includes(method)) return lowMaturity ? 8 : 6;
  if (method === "mixed methods") return graph.metrics.methodologyDiversity <= 2 && variableCount >= 3 ? 8 : 6;
  if (["systematic review", "scoping review", "bibliometric analysis", "scientometric analysis"].includes(method)) return reviewReady ? 8 : 5;
  if (method === "meta-analysis") return density >= 25 ? 8 : 4;
  return 5;
}

function fitMethod(method: RecommendedMethod, topic: Topic, papers: RetrievedPaper[], graph: TheoryGraph, discipline?: Discipline, selectedMethodology?: Methodology): MethodologyRecommendation {
  const density = papers.length;
  const variableCount = topic.variables.length;
  const methodSupport = graph.nodes.find((node) => node.type === "methodology" && node.label.toLowerCase().includes(method.split(" ")[0].toLowerCase()))?.support ?? 0;
  const domain = discipline ? getDomainIntelligence(discipline) : null;
  const domainBoost = domain?.preferredMethodologies.includes(method) ? 1.5 : 0;
  const selectedBoost = selectedMethodology === method ? 3 : 0;
  const fit = methodBaseFit(method, variableCount, density, graph) + Math.min(1, methodSupport / 3) + domainBoost + selectedBoost;
  const rationale =
    method === "SEM" || method === "PLS-SEM"
      ? "잠재변수, 매개/조절 관계, 복수 구성개념을 동시에 검증하기 좋습니다."
      : ["regression", "multilevel modeling", "panel analysis", "longitudinal analysis", "econometrics", "time-series analysis", "Bayesian analysis"].includes(method)
        ? "명확한 변수 구조와 반복/패널/시계열 자료가 있을 때 설명력과 검증 가능성이 높습니다."
        : ["experimental design", "quasi-experimental design", "causal inference"].includes(method)
          ? "인과적 질문을 다룰 때 유용하지만 식별전략과 윤리적 실행 가능성을 함께 검토해야 합니다."
          : ["grounded theory", "thematic analysis", "discourse analysis", "narrative inquiry", "phenomenology", "ethnography", "case study", "content analysis"].includes(method)
            ? "현상 설명이 덜 성숙하거나 맥락 이해가 중요한 경우 개념화와 해석을 강화할 수 있습니다."
            : method === "mixed methods"
              ? "정량적 관계 검증과 질적 설명 보강을 함께 설계할 수 있습니다."
              : "문헌이 어느 정도 축적된 영역에서 연구 흐름, 한계, 지식 구조를 체계적으로 정리할 수 있습니다.";

  return {
    method,
    fit: clamp(fit),
    rationale,
    evidence: `${supportEvidence(papers, topic.evidencePaperIds)} 변수/개념 ${variableCount}개, 그래프 방법론 다양성 ${graph.metrics.methodologyDiversity}, 그래프 밀도 ${graph.metrics.density.toFixed(2)}, 분야 규범 ${domain?.label ?? "일반"}${selectedMethodology ? `, 선택 방법 ${methodologyLabels[selectedMethodology]}` : ""}을 반영했습니다.`,
    risks:
      method === "SEM" || method === "PLS-SEM" || method === "meta-analysis"
        ? ["충분한 표본 또는 동질적인 효과 연구가 부족하면 실행 가능성이 떨어집니다.", "측정모형과 포함 기준을 사전에 엄격히 정의해야 합니다."]
        : ["근거 강도가 낮은 연결을 과도하게 일반화하면 안 됩니다.", "원문 검토 없이 메타데이터 신호만으로 결론을 확정하면 위험합니다."]
  };
}

export function recommendMethodologies(topic: Topic, papers: RetrievedPaper[], graph: TheoryGraph, discipline?: Discipline, selectedMethodology?: Methodology): MethodologyRecommendation[] {
  const domainMethods = discipline ? recommendedMethodsForDomain(discipline) : [];
  const selected = selectedMethodology && allRecommendedMethods.includes(selectedMethodology as RecommendedMethod) ? [selectedMethodology as RecommendedMethod] : [];
  const methods = [...new Set([...selected, ...domainMethods, ...allRecommendedMethods])];
  return methods
    .map((method) => fitMethod(method, topic, papers, graph, discipline, selectedMethodology))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 6);
}

export function buildResearchPlan(topic: Topic, synthesis: Synthesis, papers: RetrievedPaper[], graph: TheoryGraph, discipline?: Discipline): ResearchPlan {
  const core = topic.coreTheory;
  const adjacent = topic.adjacentTheories[0] ?? topic.variables[1] ?? "학습 경험";
  const outcome = topic.variables.at(-1) ?? "연구 결과";
  const strongestTrend = synthesis.trends[0]?.label ?? "주요 연구 동향";
  const hasQuantSignals = graph.nodes.some((node) => node.type === "methodology" && ["quantitative", "survey", "regression"].includes(node.label.toLowerCase()));
  const domain = discipline ? getDomainIntelligence(discipline) : null;

  return {
    researchQuestions: [
      `${core}와 ${adjacent}는 ${outcome}에 어떤 방식으로 연결되는가?`,
      `검색 문헌에서 약하게 연결된 개념 조합은 어떤 조건에서 더 설명력이 높아지는가?`
    ],
    hypothesesPropositions: hasQuantSignals
      ? [
          `${core}는 ${outcome}에 정적인 영향을 미칠 것이다.`,
          `${adjacent}는 ${core}와 ${outcome}의 관계를 매개하거나 조절할 것이다.`
        ]
      : [`참여자 경험에서 ${core}는 ${strongestTrend}를 설명하는 핵심 범주로 나타날 것이다.`],
    conceptualModel: `${core} -> ${topic.mediatorsModerators[0] ?? adjacent} -> ${outcome}; ${topic.mediatorsModerators[1] ?? strongestTrend}는 조절 가능성으로 검토`,
    sampleDataRecommendations: [
      domain ? `${domain.label} 분야에서는 ${domain.typicalDatasetsSamples.slice(0, 2).join(", ")} 자료가 자주 쓰입니다.` : "분야 적합 표본과 자료 구조를 먼저 확정하세요.",
      papers.length >= 15 ? "문헌 기반 척도 후보를 정리한 뒤 설문 표본을 확보하는 설계가 적합합니다." : "초기 탐색 인터뷰 또는 사례 기반 자료 수집으로 개념 구조를 먼저 안정화하는 편이 안전합니다.",
      "OpenAlex 검색 결과에서 반복 등장한 개념을 측정 변수 후보로 삼되, 실제 척도는 원문 검토로 확인해야 합니다."
    ],
    dataCollectionMethods: domain?.typicalDatasetsSamples ?? ["설문", "로그 데이터", "인터뷰", "체계적 문헌 코딩 시트"],
    futureExpansionDirections: [
      ...(domain?.methodologicalExpectations.slice(0, 1).map((item) => `${domain.label} 분야 기대사항(${item})을 반영한 후속 설계`) ?? []),
      "국가, 교육 단계, AI 도구 유형별 다집단 비교",
      "종단 설계로 자기효능감 변화와 성과 간 방향성 검증",
      "질적 후속 연구로 약한 그래프 연결의 맥락 요인 탐색"
    ]
  };
}

export function compareTopics(topics: Topic[]): TopicComparison[] {
  return topics.map((topic) => {
    const literatureSupportStrength = clamp((topic.evidencePaperIds.length / 3) * 5 + topic.scores.publishability / 2);
    const recommendation =
      topic.scores.novelty >= 7 && topic.scores.saturation <= 6
        ? "high_novelty"
        : topic.scores.feasibility >= 8 && literatureSupportStrength >= 7
          ? "safer"
          : "balanced";
    return {
      topicTitle: topic.title,
      novelty: topic.scores.novelty,
      feasibility: topic.scores.feasibility,
      publishability: topic.scores.publishability,
      literatureSupportStrength,
      dataAccessibility: topic.scores.dataAvailability,
      saturation: topic.scores.saturation,
      recommendation,
      rationale:
        recommendation === "safer"
          ? "문헌 근거와 실행 가능성이 상대적으로 높아 안정적인 방향입니다."
          : recommendation === "high_novelty"
            ? "포화도가 낮고 참신성이 높아 도전적이지만 검증 부담이 큽니다."
            : "참신성과 실행 가능성의 균형이 있는 방향입니다."
    };
  });
}

export function buildCopilotIntelligence(
  topics: Topic[],
  synthesis: Synthesis,
  graph: TheoryGraph,
  relationships: RelationshipInsight[],
  trends: TrendAnalysis,
  gaps: Gap[],
  papers: RetrievedPaper[]
): CopilotIntelligence {
  const comparisons = compareTopics(topics);
  const bestSafe = comparisons.find((comparison) => comparison.recommendation === "safer") ?? comparisons[0];
  const bestNovel = comparisons.find((comparison) => comparison.recommendation === "high_novelty") ?? comparisons.at(-1) ?? comparisons[0];
  const theoryRecommendations = [
    synthesis.theories[0]?.label,
    synthesis.theories[1]?.label,
    relationships.find((relationship) => relationship.type === "adjacent_frameworks")?.title,
    trends.risingTopics[0]?.label
  ].filter((value): value is string => Boolean(value));
  const methodologyAlternatives = topics[0] ? topics[0].methodologyRecommendations : [];

  return {
    summary: `검색 문헌 ${papers.length}편, 이론 노드 ${graph.nodes.filter((node) => node.type === "theory").length}개, 관계 인사이트 ${relationships.length}개를 바탕으로 코파일럿 제안을 생성했습니다.`,
    saferDirection: bestSafe ? `${bestSafe.topicTitle}: ${bestSafe.rationale}` : "안정적 방향을 계산할 토픽이 없습니다.",
    highNoveltyDirection: bestNovel ? `${bestNovel.topicTitle}: ${bestNovel.rationale}` : "고참신성 방향을 계산할 토픽이 없습니다.",
    theoryRecommendations: [...new Set(theoryRecommendations)].slice(0, 5),
    methodologyAlternatives,
    comparisons,
    starterMessages: [
      {
        title: "아이디어 정제",
        message: "현재 키워드는 연구 가능하지만, 핵심 이론과 결과 변수를 명확히 분리하면 더 강한 연구문제로 바뀝니다.",
        evidence: `상위 이론 신호: ${synthesis.theories.slice(0, 3).map((item) => item.label).join(", ") || "없음"}`
      },
      {
        title: "안전한 방향",
        message: bestSafe?.rationale ?? "비교 가능한 토픽이 충분하지 않습니다.",
        evidence: bestSafe ? bestSafe.topicTitle : "토픽 생성 결과 부족"
      },
      {
        title: "고참신성 방향",
        message: bestNovel?.rationale ?? "비교 가능한 토픽이 충분하지 않습니다.",
        evidence: gaps[0]?.evidence ?? "검색 집합 기반 갭 신호 없음"
      }
    ]
  };
}
