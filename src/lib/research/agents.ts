import type {
  AutonomousExploration,
  BibliometricAnalysis,
  CitationIntelligence,
  DeepResearchSynthesis,
  DebateSignal,
  Discipline,
  Gap,
  LiteratureMap,
  Methodology,
  MultiAgentWorkflow,
  ResearchCompetitionIntelligence,
  ResearchForecast,
  ResearchMemorySeed,
  ResearchRoadmap,
  ResearchStrategy,
  RetrievedPaper,
  Synthesis,
  TheoryGraph,
  Topic,
  TrendAnalysis
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";
import { strategyLabels } from "./strategy";

function topLabels(items: Array<{ label: string }>, limit = 3): string {
  return items.slice(0, limit).map((item) => item.label).join(", ") || "명시 신호 부족";
}

function titleList(topics: Topic[], limit = 3): string[] {
  return topics.slice(0, limit).map((topic) => topic.title);
}

export function buildMultiAgentWorkflow(
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  citation: CitationIntelligence,
  gaps: Gap[],
  topics: Topic[],
  debates: DebateSignal[],
  roadmap: ResearchRoadmap,
  discipline: Discipline,
  methodology: Methodology,
  strategy: ResearchStrategy
): MultiAgentWorkflow {
  const runId = `agent-run-${Date.now()}`;
  return {
    runId,
    pipeline: [
      {
        role: "literature_retrieval",
        name: "Literature Retrieval Agent",
        status: papers.length > 0 ? "completed" : "limited",
        inputSummary: `키워드 기반 OpenAlex 검색, 분야 ${disciplineLabels[discipline]}, 전략 ${strategyLabels[strategy]}`,
        outputSummary: `${papers.length}편의 검색 문헌 메타데이터를 정규화했습니다.`,
        evidence: "OpenAlex Works API 결과만 사용했습니다.",
        handoffTo: ["theory_extraction", "citation_intelligence"]
      },
      {
        role: "theory_extraction",
        name: "Theory Extraction Agent",
        status: synthesis.theories.length > 0 ? "completed" : "limited",
        inputSummary: "검색 문헌의 제목, 초록, 개념 필드",
        outputSummary: `이론/프레임워크 후보: ${topLabels(synthesis.theories)}.`,
        evidence: `${synthesis.theories.length}개 이론 신호와 ${synthesis.trends.length}개 개념 신호.`,
        handoffTo: ["research_gap_analysis", "topic_generation"]
      },
      {
        role: "citation_intelligence",
        name: "Citation Intelligence Agent",
        status: citation.network.nodes.length > 0 ? "completed" : "limited",
        inputSummary: "OpenAlex 인용 수, referenced_works, related_works",
        outputSummary: `인용/공통참고문헌 엣지 ${citation.network.edges.length}개와 클러스터 ${citation.researchClusters.length}개를 구성했습니다.`,
        evidence: "검색된 메타데이터 내부 관계만 사용했으며 완전한 인용망이라고 주장하지 않습니다.",
        handoffTo: ["research_gap_analysis", "roadmap_planning"]
      },
      {
        role: "research_gap_analysis",
        name: "Research Gap Agent",
        status: gaps.length > 0 ? "completed" : "limited",
        inputSummary: "이론 신호, 그래프 밀도, 방법론 커버리지, 최근성",
        outputSummary: `${gaps.length}개의 갭 후보를 생성했습니다.`,
        evidence: gaps[0]?.evidence ?? "명시 갭 신호 부족.",
        handoffTo: ["methodology_recommendation", "topic_generation"]
      },
      {
        role: "methodology_recommendation",
        name: "Methodology Recommendation Agent",
        status: topics.some((topic) => topic.methodologyRecommendations.length > 0) ? "completed" : "limited",
        inputSummary: `선택 방법론 ${methodologyLabels[methodology]}와 분야 규범`,
        outputSummary: `${topics[0]?.methodologyRecommendations.slice(0, 3).map((item) => item.method).join(", ") || "추천 부족"} 후보를 제안했습니다.`,
        evidence: topics[0]?.methodologyRecommendations[0]?.evidence ?? "방법론 근거 부족.",
        handoffTo: ["topic_generation"]
      },
      {
        role: "topic_generation",
        name: "Topic Generation Agent",
        status: topics.length > 0 ? "completed" : "limited",
        inputSummary: "갭 후보, 이론 신호, 방법론 추천, 전략 모드",
        outputSummary: `${topics.length}개의 연구주제 후보를 생성했습니다.`,
        evidence: topics[0]?.inferenceNotice ?? "생성 추론.",
        handoffTo: ["roadmap_planning"]
      },
      {
        role: "contradiction_detection",
        name: "Contradiction Detection Agent",
        status: debates.length > 0 ? "completed" : "limited",
        inputSummary: "초록의 명시적 모순/논쟁 표현과 방법론·이론 다양성",
        outputSummary: `${debates.length}개의 논쟁/긴장 후보를 표시했습니다.`,
        evidence: debates[0]?.evidence ?? "명시 논쟁 신호 부족.",
        handoffTo: ["roadmap_planning"]
      },
      {
        role: "roadmap_planning",
        name: "Roadmap Planning Agent",
        status: roadmap.recommendedNextStepStudies.length > 0 ? "completed" : "limited",
        inputSummary: "토픽, 갭, 클러스터, 성장/포화 신호",
        outputSummary: `${roadmap.recommendedNextStepStudies.length}개의 다음 단계 연구 후보를 구성했습니다.`,
        evidence: roadmap.recommendedNextStepStudies[0]?.evidence ?? "로드맵 근거 부족.",
        handoffTo: []
      }
    ],
    collaborationSummary: "전문 에이전트들은 OpenAlex 검색 결과를 공통 근거로 공유하고, 이론 추출 → 인용/계량 분석 → 갭 분석 → 방법론 추천 → 주제 생성 → 논쟁 점검 → 로드맵 계획 순서로 산출물을 넘깁니다.",
    evidenceBoundary: "이 워크플로우는 검색된 메타데이터와 규칙 기반 추론을 사용합니다. 원문 전문, 비공개 인용 데이터, 저널 심사 결과는 사용하지 않습니다."
  };
}

export function buildAutonomousExploration(
  synthesis: Synthesis,
  graph: TheoryGraph,
  literatureMap: LiteratureMap,
  gaps: Gap[],
  topics: Topic[],
  discipline: Discipline
): AutonomousExploration {
  const weakEdges = graph.edges.filter((edge) => edge.weight <= 2).slice(0, 4);
  const adjacentTheoryPaths = literatureMap.interdisciplinaryBridges.slice(0, 4).map((bridge) => ({
    seed: bridge.source,
    path: [bridge.source, bridge.target, disciplineLabels[discipline]],
    rationale: "문헌지도에서 약하거나 인접한 연결로 나타난 이론/개념을 따라 확장합니다.",
    evidence: bridge.evidence,
    confidence: bridge.confidence,
    paperIds: bridge.paperIds
  }));
  const emergingConceptPaths = synthesis.emergingTopics.slice(0, 4).map((topic) => ({
    seed: topic.label,
    path: [topic.label, synthesis.trends[0]?.label ?? "core topic", synthesis.theories[0]?.label ?? "theory review"],
    rationale: "최근 문헌에서 감지된 개념을 중심 주제와 이론 검토로 연결합니다.",
    evidence: `최근 검색 문헌 ${topic.support}편에서 감지되었습니다.`,
    confidence: "low" as const,
    paperIds: topic.paperIds
  }));
  const weakDomainExpansionPaths = weakEdges.map((edge) => {
    const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
    const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
    return {
      seed: source,
      path: [source, target, "targeted follow-up study"],
      rationale: "낮은 공출현 연결을 후속 연구의 탐색 경로로 제안합니다.",
      evidence: `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}.`,
      confidence: "low" as const,
      paperIds: edge.paperIds
    };
  });
  return {
    adjacentTheoryPaths,
    emergingConceptPaths,
    weakDomainExpansionPaths,
    refinedResearchGoals: topics.slice(0, 3).map((topic) => `${topic.coreTheory}와 ${topic.variables.slice(1, 3).join(", ")}의 관계를 ${disciplineLabels[discipline]} 맥락에서 검증하기`),
    specializedDirections: gaps.slice(0, 4).map((gap) => `${gap.claim} → ${gap.evidence}`)
  };
}

export function buildDeepResearchSynthesis(
  synthesis: Synthesis,
  literatureMap: LiteratureMap,
  debates: DebateSignal[],
  topics: Topic[]
): DeepResearchSynthesis {
  return {
    structuredTheorySynthesis: literatureMap.dominantFrameworks.slice(0, 5).map((item) => `${item.label}: 검색 문헌 ${item.support}편에서 감지된 이론/프레임워크 신호입니다.`),
    competingFrameworkAnalysis: literatureMap.competingFrameworks.length > 0
      ? literatureMap.competingFrameworks.map((item) => `${item.frameworks.join(" vs ")}: ${item.evidence}`)
      : ["검색 메타데이터만으로 명확한 경쟁 프레임워크 관계를 주장하기 어렵습니다."],
    unresolvedDebateSummaries: debates.length > 0
      ? debates.map((debate) => `${debate.claim} ${debate.evidence}`)
      : ["명시적인 미해결 논쟁 신호는 충분하지 않습니다. 원문 검토에서 결과 방향과 측정 차이를 확인해야 합니다."],
    interdisciplinaryConnectionAnalysis: literatureMap.interdisciplinaryBridges.slice(0, 5).map((bridge) => `${bridge.source} ↔ ${bridge.target}: ${bridge.evidence}`),
    conceptualIntegrationProposals: topics.slice(0, 4).map((topic) => `${topic.coreTheory}를 중심으로 ${topic.adjacentTheories.slice(0, 2).join(", ") || "인접 개념"}를 연결하고 ${topic.mediatorsModerators.slice(0, 2).join(", ") || "매개/조절 후보"}를 검증하는 통합모형`),
    evidenceBoundary: `이 딥 합성은 ${topLabels(synthesis.trends)} 등 검색 메타데이터에서 반복된 신호를 종합한 생성 서술입니다. 원문 인용문이나 확정적 이론사 주장은 포함하지 않습니다.`
  };
}

export function buildResearchForecast(
  competition: ResearchCompetitionIntelligence,
  trendAnalysis: TrendAnalysis,
  roadmap: ResearchRoadmap,
  bibliometric: BibliometricAnalysis
): ResearchForecast {
  return {
    emergingHighGrowthAreas: competition.rapidlyGrowingAreas.slice(0, 4),
    likelyFutureResearchTrends: [
      ...roadmap.futureTrendForecasts.slice(0, 3),
      ...trendAnalysis.risingTopics.slice(0, 2).map((trend) => ({
        title: `${trend.label} 후속 성장 가능성`,
        rationale: "검색 집합 내부에서 최근 출현 수가 이전 출현 수보다 높습니다.",
        evidence: `최근 ${trend.recentCount}, 이전 ${trend.priorCount}.`,
        paperIds: trend.paperIds
      }))
    ],
    oversaturatedAreas: competition.oversaturatedTopics.slice(0, 4),
    decliningThemes: competition.decliningResearchTrends.slice(0, 4),
    interdisciplinaryOpportunityZones: roadmap.unexploredInterdisciplinaryCombinations.slice(0, 4),
    forecastBoundary: `예측은 검색 결과 ${bibliometric.publicationTrends.reduce((sum, point) => sum + point.paperCount, 0)}편의 연도·빈도·최근성 기반 휴리스틱입니다. 외부 펀딩, 정책, 학회 CFP, 심사 동향은 반영하지 않았습니다.`
  };
}

export function buildResearchMemorySeed(
  topics: Topic[],
  graph: TheoryGraph,
  literatureMap: LiteratureMap,
  strategy: ResearchStrategy
): ResearchMemorySeed {
  return {
    sessionId: `memory-${Date.now()}`,
    savedTheoryGraphNodeCount: graph.nodes.length,
    savedLiteratureMapItems:
      literatureMap.foundationalTheories.length + literatureMap.dominantFrameworks.length + literatureMap.interdisciplinaryBridges.length + literatureMap.theoryEvolutionTimeline.length,
    priorGeneratedTopicTitles: titleList(topics, 6),
    refinementHistory: [`초기 전략 모드: ${strategyLabels[strategy]}`, "검색 근거 기반 토픽 생성", "방법론/출판/데이터 추천 반영"],
    evolvingResearchAgenda: topics.slice(0, 4).map((topic, index) => `Paper ${index + 1}: ${topic.researchQuestion}`),
    comparisonSnapshot: topics.slice(0, 5).map((topic) => ({
      title: topic.title,
      novelty: topic.scores.novelty,
      feasibility: topic.scores.feasibility,
      publishability: topic.scores.publishability
    }))
  };
}
