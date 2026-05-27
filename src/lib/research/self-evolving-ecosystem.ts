import type {
  AutonomousAcademicOperatingSystem,
  BibliometricAnalysis,
  Gap,
  PersistentScholarlyMemory,
  PredictiveAcademicIntelligence,
  ResearchCompetitionIntelligence,
  ResearchStrategy,
  RetrievedPaper,
  SelfEvolvingAcademicEcosystem,
  SelfImprovingAcademicIntelligence,
  Synthesis,
  TheoryGraph,
  Topic,
  TrendAnalysis
} from "./types";
import { strategyLabels } from "./strategy";

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function graphLabel(graph: TheoryGraph, id: string): string {
  return graph.nodes.find((node) => node.id === id)?.label ?? id;
}

function currentYear(): number {
  return new Date().getFullYear();
}

function buildContinuousLearning(params: {
  papers: RetrievedPaper[];
  graph: TheoryGraph;
  gaps: Gap[];
  topics: Topic[];
  trendAnalysis: TrendAnalysis;
  predictive: PredictiveAcademicIntelligence;
  memory: PersistentScholarlyMemory;
}): SelfEvolvingAcademicEcosystem["continuousLearning"] {
  const recentPapers = params.papers.filter((paper) => (paper.year ?? 0) >= currentYear() - 3);
  const theoryRelationshipUpdates = params.graph.edges
    .slice()
    .sort((a, b) => {
      const bRecent = b.years.some((year) => year >= currentYear() - 4) ? 1 : 0;
      const aRecent = a.years.some((year) => year >= currentYear() - 4) ? 1 : 0;
      return bRecent - aRecent || a.density - b.density || b.weight - a.weight;
    })
    .slice(0, 8)
    .map((edge) => ({
      source: graphLabel(params.graph, edge.source),
      target: graphLabel(params.graph, edge.target),
      previousSignal: edge.weight <= 1 ? "희소 연결" : `공출현 ${edge.weight}회`,
      updatedSignal: edge.years.some((year) => year >= currentYear() - 4) ? "최근 문헌에서 재감지된 연결" : "계속 추적할 기존 연결",
      evidence: `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}, 연도 ${edge.years.slice(-4).join(", ") || "부족"}.`,
      paperIds: edge.paperIds
    }));

  const topicScoringEvolution = params.topics.slice(0, 5).map((topic) => {
    const predictiveScore = params.predictive.advancedEvaluation.find((item) => item.topicTitle === topic.title)?.overall ?? topic.scores.publishability;
    const memoryBoost = params.memory.researchRecall.repeatedOrSimilarTopics.some((item) => item.label.toLowerCase().includes(topic.title.toLowerCase().slice(0, 24))) ? -1 : 1;
    const evolvedScore = clamp((topic.scores.novelty + topic.scores.feasibility + predictiveScore) / 3 + memoryBoost);
    return {
      topicTitle: topic.title,
      previousScore: clamp((topic.scores.novelty + topic.scores.feasibility + topic.scores.publishability) / 3),
      evolvedScore,
      reason: `예측 평가 ${predictiveScore}/10, 로컬 메모리 중복 신호 ${memoryBoost < 0 ? "있음" : "낮음"}을 반영했습니다.`
    };
  });

  return {
    ingestionWorkflow: [
      {
        step: "retrieve",
        status: "completed",
        evidence: `현재 실행에서 OpenAlex 논문 ${params.papers.length}편을 수집했고 최근 ${recentPapers.length}편을 업데이트 후보로 표시했습니다.`,
        nextAction: "다음 실행에서 동일 키워드 검색 결과와 비교"
      },
      {
        step: "compare",
        status: params.memory.priorSessionCount > 0 ? "completed" : "ready",
        evidence: `로컬 메모리 이전 세션 ${params.memory.priorSessionCount}개와 현재 세션을 비교할 수 있습니다.`,
        nextAction: "반복/유사 토픽과 새 연결을 분리"
      },
      {
        step: "update_graph",
        status: "completed",
        evidence: `이론 그래프 엣지 ${params.graph.edges.length}개와 통합 지식 그래프 엣지 ${params.memory.unifiedKnowledgeGraph.edges.length}개를 연결했습니다.`,
        nextAction: "약한 연결과 최근 연결을 우선 검토"
      },
      {
        step: "refine_gaps",
        status: params.gaps.length > 0 ? "completed" : "needs_review",
        evidence: `갭 후보 ${params.gaps.length}개를 문헌 밀도와 그래프 연결성으로 재표현했습니다.`,
        nextAction: "원문 검토 후 더 강한 연구 필요성 주장으로 다룰지 결정"
      },
      {
        step: "rescore_topics",
        status: topicScoringEvolution.length > 0 ? "completed" : "needs_review",
        evidence: `토픽 ${topicScoringEvolution.length}개를 예측 평가와 메모리 중복 신호로 재점수화했습니다.`,
        nextAction: "점수 변화가 큰 토픽을 우선 개선"
      },
      {
        step: "refresh_forecast",
        status: "ready",
        evidence: `상승 토픽 ${params.trendAnalysis.risingTopics.length}개와 hot topic 후보 ${params.predictive.forecasting.likelyFutureHotTopics.length}개를 갱신 후보로 표시했습니다.`,
        nextAction: "반복 실행 또는 예약 작업에서 변화량을 기록"
      }
    ],
    theoryRelationshipUpdates,
    gapRefinements: params.gaps.slice(0, 6).map((gap) => ({
      originalGap: gap.claim,
      refinedGap: `${gap.claim} 단, 현재 검색 집합의 ${gap.type} 신호로만 표시하고 원문 기반 체계적 검토 전에는 단정하지 않습니다.`,
      evidence: gap.evidence,
      confidence: gap.confidence
    })),
    topicScoringEvolution,
    interdisciplinaryBridgeDetections: [
      ...params.memory.unifiedKnowledgeGraph.interdisciplinaryBridgeDiscoveries,
      ...params.memory.unifiedKnowledgeGraph.longRangeConceptExploration
    ].slice(0, 6),
    forecastingModelAdaptations: [
      `최근 문헌 비중 ${recentPapers.length}/${params.papers.length}을 상승 신호 가중치로 기록`,
      `그래프 밀도 ${params.graph.metrics.density.toFixed(2)}와 약한 연결 ${params.graph.metrics.weakConnectionCount}개를 갭 보정 신호로 사용`,
      `로컬 메모리 ${params.memory.priorSessionCount}개 세션을 중복/연속 연구 아젠다 판별에 사용`,
      "외부 펀딩 데이터나 실제 미래 인용값은 사용하지 않음"
    ],
    learningBoundary: "Continuous Scholarly Learning은 현재 실행과 로컬 메모리를 비교하는 스냅샷 기반 학습 루프입니다. 백그라운드 자동 수집, 외부 펀딩 DB 연동, 미래 예측 정확도를 보장하지 않습니다."
  };
}

function buildKnowledgeGraph(
  continuousLearning: SelfEvolvingAcademicEcosystem["continuousLearning"],
  memory: PersistentScholarlyMemory,
  selfImproving: SelfImprovingAcademicIntelligence
): SelfEvolvingAcademicEcosystem["selfEvolvingKnowledgeGraph"] {
  return {
    ecosystemNodes: memory.unifiedKnowledgeGraph.nodes,
    ecosystemEdges: memory.unifiedKnowledgeGraph.edges,
    dynamicRelationshipUpdates: continuousLearning.theoryRelationshipUpdates,
    multiHopDiscovery: memory.unifiedKnowledgeGraph.multiHopDiscoveries.slice(0, 8),
    hiddenConceptDiscovery: [
      ...memory.unifiedKnowledgeGraph.hiddenRelationshipCandidates,
      ...memory.unifiedKnowledgeGraph.longRangeConceptExploration
    ].slice(0, 8),
    evolvingTheoryLineage: selfImproving.advancedKnowledgeGraph.theoryEvolutionChains.slice(0, 8).map((chain) => ({
      theory: chain.theory,
      lineage: chain.chain,
      evidence: chain.evidence,
      paperIds: chain.paperIds
    })),
    graphEvolutionSummary: `생태계 그래프는 노드 ${memory.unifiedKnowledgeGraph.nodes.length}개, 엣지 ${memory.unifiedKnowledgeGraph.edges.length}개, 동적 관계 업데이트 ${continuousLearning.theoryRelationshipUpdates.length}개를 포함합니다.`,
    graphBoundary: "Self-evolving graph는 검색 메타데이터, 로컬 메모리, 생성 토픽의 명시 추론을 구분합니다. inferred 엣지와 hidden discovery는 검증 전 탐색 후보입니다."
  };
}

function buildMonitoringFeeds(params: {
  predictive: PredictiveAcademicIntelligence;
  competition: ResearchCompetitionIntelligence;
  bibliometric: BibliometricAnalysis;
  selfImproving: SelfImprovingAcademicIntelligence;
  graph: TheoryGraph;
}): SelfEvolvingAcademicEcosystem["ecosystemMonitoringFeeds"] {
  return [
    ...params.competition.rapidlyGrowingAreas.slice(0, 3).map((item) => ({
      type: "fast_growing_area" as const,
      label: item.label,
      priority: item.level === "high" ? "high" as const : "medium" as const,
      evidence: item.evidence,
      generatedInterpretation: "빠르게 커지는 영역일 수 있으나 검색 집합 내부 신호입니다.",
      suggestedAction: "차별화된 이론 조합 또는 데이터 맥락을 고정하세요.",
      paperIds: item.paperIds
    })),
    ...params.competition.oversaturatedTopics.slice(0, 3).map((item) => ({
      type: "oversaturated_domain" as const,
      label: item.label,
      priority: item.level === "high" ? "high" as const : "medium" as const,
      evidence: item.evidence,
      generatedInterpretation: "반복 등장하는 주제라 기본 프레이밍은 경쟁이 높을 수 있습니다.",
      suggestedAction: "표본, 방법론, 이론 조합 중 하나를 좁게 차별화하세요.",
      paperIds: item.paperIds
    })),
    ...params.predictive.forecasting.likelyFutureHotTopics.slice(0, 3).map((item) => ({
      type: "funding_aligned_trend" as const,
      label: item.label,
      priority: item.score >= 7 ? "medium" as const : "low" as const,
      evidence: item.evidence,
      generatedInterpretation: "정책/펀딩 적합 가능성은 직접 검증하지 않았고, 성장 주제 신호만 표시합니다.",
      suggestedAction: "실제 공모, CFP, 정책 문서는 별도로 확인하세요.",
      paperIds: item.evidencePaperIds
    })),
    ...params.selfImproving.institutionalIntelligence.institutionalTrends.slice(0, 3).map((item) => ({
      type: "institutional_shift" as const,
      label: item.institution,
      priority: item.paperCount >= 3 ? "medium" as const : "low" as const,
      evidence: `${item.paperCount}편, 총 인용 ${item.totalCitations}회.`,
      generatedInterpretation: "검색 결과 안에서 기관 활동 신호가 보입니다.",
      suggestedAction: "공저자·기관 협업 가능성을 검토하세요.",
      paperIds: item.paperIds
    })),
    ...params.predictive.forecasting.futureMethodologyTrends.slice(0, 3).map((item) => ({
      type: "emerging_methodology" as const,
      label: item.label,
      priority: item.score >= 7 ? "medium" as const : "low" as const,
      evidence: item.evidence,
      generatedInterpretation: item.generatedForecast,
      suggestedAction: "선택 방법론의 분야 규범과 표본 요건을 비교하세요.",
      paperIds: item.evidencePaperIds
    })),
    ...params.predictive.forecasting.acceleratingInterdisciplinaryAreas.slice(0, 3).map((item) => ({
      type: "interdisciplinary_convergence" as const,
      label: item.label,
      priority: "medium" as const,
      evidence: item.evidence,
      generatedInterpretation: item.generatedForecast,
      suggestedAction: "두 분야의 심사 기대치를 분리해 기여문장을 작성하세요.",
      paperIds: item.evidencePaperIds
    })),
    {
      type: "publication_surge" as const,
      label: params.bibliometric.researchMaturity.stage,
      priority: params.graph.metrics.emergingConnectionCount > 2 ? "medium" as const : "low" as const,
      evidence: params.bibliometric.researchMaturity.evidence,
      generatedInterpretation: "문헌 성숙도와 새 연결 수를 함께 본 생태계 수준 알림입니다.",
      suggestedAction: "성숙 영역은 검증 연구로, 초기 영역은 탐색 연구로 포지셔닝하세요.",
      paperIds: []
    }
  ].slice(0, 14);
}

function buildBenchmarks(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  predictive: PredictiveAcademicIntelligence;
  graph: TheoryGraph;
  synthesis: Synthesis;
  strategy: ResearchStrategy;
}): SelfEvolvingAcademicEcosystem["researchBenchmarking"] {
  const avgCitations = average(params.papers.map((paper) => paper.citedByCount));
  return params.topics.slice(0, 5).map((topic) => {
    const prediction = params.predictive.publicationOutcomes.find((item) => item.topicTitle === topic.title);
    const evaluation = params.predictive.advancedEvaluation.find((item) => item.topicTitle === topic.title);
    const literatureDensity = clamp(3 + Math.min(5, topic.evidencePaperIds.length) + (params.papers.length >= 20 ? 2 : 0));
    const methodologicalRigorNormFit = evaluation?.methodologicalRigor ?? topic.methodologyRecommendations[0]?.fit ?? 5;
    const journalExpectationFit = prediction?.journalConferenceFit ?? topic.scores.publishability;
    const interdisciplinaryNovelty = clamp(topic.adjacentTheories.length + params.graph.metrics.emergingConnectionCount + (params.strategy === "interdisciplinary innovation" ? 2 : 4));
    const likelyCitationPotential = prediction?.citationPotential ?? clamp(3 + avgCitations / 20 + topic.scores.novelty / 2);
    const longTermScalability = evaluation?.longTermResearchScalability ?? clamp(topic.researchPlan.futureExpansionDirections.length + 4);
    return {
      topicTitle: topic.title,
      literatureDensity,
      methodologicalRigorNormFit,
      journalExpectationFit,
      interdisciplinaryNovelty,
      likelyCitationPotential,
      longTermScalability,
      overallBenchmark: clamp((literatureDensity + methodologicalRigorNormFit + journalExpectationFit + interdisciplinaryNovelty + likelyCitationPotential + longTermScalability) / 6),
      reasoning: [
        `문헌 밀도는 토픽 근거 ${topic.evidencePaperIds.length}편과 전체 검색 ${params.papers.length}편을 반영했습니다.`,
        `저널 기대 적합은 출판 추정 신호를 사용했으며 실제 aims & scope 검증은 별도입니다.`,
        `인용 잠재력은 평균 OpenAlex 인용 ${avgCitations.toFixed(1)}회와 참신성 신호를 약하게 결합했습니다.`
      ],
      evidence: `상위 이론 신호: ${params.synthesis.theories.slice(0, 3).map((item) => item.label).join(", ") || "부족"}. 전략: ${strategyLabels[params.strategy]}.`
    };
  });
}

function buildAgentCoordination(params: {
  topics: Topic[];
  autonomousOS: AutonomousAcademicOperatingSystem;
  selfImproving: SelfImprovingAcademicIntelligence;
}): SelfEvolvingAcademicEcosystem["adaptiveAgentCoordination"] {
  const firstTopic = params.topics[0];
  const methods = firstTopic?.methodologyRecommendations ?? [];
  return {
    theoryDebates: params.selfImproving.advancedKnowledgeGraph.theoryEvolutionChains.slice(0, 4).map((chain) => ({
      positionA: `${chain.theory} 중심 설명`,
      positionB: `${chain.chain.at(-1) ?? "인접 개념"}와 통합 설명`,
      resolution: "핵심 이론은 유지하되 인접 이론은 매개/조절 또는 맥락 변수로 낮춰 검증합니다.",
      evidence: chain.evidence
    })),
    methodologyComparisons: methods.slice(0, 3).map((method, index) => {
      const other = methods[index + 1] ?? methods[0];
      return {
        methodA: method.method,
        methodB: other.method,
        recommendation: method.fit >= other.fit ? `${method.method} 우선` : `${other.method} 우선`,
        tradeoff: method.risks[0] ?? "방법론 선택 전 자료 구조와 표본 규모를 확인해야 합니다.",
        evidence: method.evidence
      };
    }),
    proposalCritiques: [
      ...params.selfImproving.mentorMode.critique.slice(0, 4),
      ...params.autonomousOS.scholarlyReasoning.contradictionResolutionWorkflow.slice(0, 2)
    ],
    iterativePlanImprovements: params.autonomousOS.optimizationControls.slice(0, 6).map((control) => `${control.objective}: ${control.recommendedMove}`),
    coordinationBoundary: "에이전트 조정은 구조화된 비평/비교 워크플로입니다. 독립 에이전트가 외부 문헌을 새로 검증했다는 뜻은 아니며, 기존 검색 근거 안에서 개선안을 제안합니다."
  };
}

function buildWorkspaceEcosystem(params: {
  memory: PersistentScholarlyMemory;
  autonomousOS: AutonomousAcademicOperatingSystem;
  selfImproving: SelfImprovingAcademicIntelligence;
}): SelfEvolvingAcademicEcosystem["advancedWorkspaceEcosystem"] {
  return {
    persistentWorkspaceStatus: params.memory.persistence.enabled
      ? `${params.memory.persistence.namespace}에 로컬 메모리 저장`
      : "현재 세션 스냅샷 기반, 브라우저/로컬 저장소에서 이어가기 가능",
    teamCollaborationHub: params.autonomousOS.workspaceCollaboration.collaborators,
    versionedProposalEvolution: params.autonomousOS.workspaceCollaboration.proposalVersions,
    longTermResearchMemory: [
      ...params.memory.researchRecall.continuedResearchAgenda,
      ...params.autonomousOS.researchPlanner.longTermRoadmap
    ].slice(0, 8),
    crossProjectKnowledgeSharing: params.memory.vectorRetrieval.crossSessionRecall.slice(0, 6).map((item) => `${item.label} · 유사도 ${item.similarity}`),
    exportableInstitutionalDossier: [
      ...params.autonomousOS.workspaceCollaboration.exportableDossierSections,
      "Institutional trend profile",
      "Faculty expertise alignment",
      "Collaboration opportunity map"
    ],
    workspaceBoundary: "협업 허브는 연구 운영 정보를 구조화해 보여주는 MVP입니다. 실시간 권한 관리, 클라우드 공동 편집, 기관 공식 보고 자동 제출은 포함하지 않습니다."
  };
}

export function buildSelfEvolvingAcademicEcosystem(params: {
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  graph: TheoryGraph;
  trendAnalysis: TrendAnalysis;
  gaps: Gap[];
  topics: Topic[];
  competition: ResearchCompetitionIntelligence;
  bibliometric: BibliometricAnalysis;
  predictive: PredictiveAcademicIntelligence;
  memory: PersistentScholarlyMemory;
  selfImproving: SelfImprovingAcademicIntelligence;
  autonomousOS: AutonomousAcademicOperatingSystem;
  strategy: ResearchStrategy;
}): SelfEvolvingAcademicEcosystem {
  const continuousLearning = buildContinuousLearning({
    papers: params.papers,
    graph: params.graph,
    gaps: params.gaps,
    topics: params.topics,
    trendAnalysis: params.trendAnalysis,
    predictive: params.predictive,
    memory: params.memory
  });

  return {
    ecosystemRunId: `self-evolving-${Date.now()}`,
    continuousLearning,
    selfEvolvingKnowledgeGraph: buildKnowledgeGraph(continuousLearning, params.memory, params.selfImproving),
    ecosystemMonitoringFeeds: buildMonitoringFeeds({
      predictive: params.predictive,
      competition: params.competition,
      bibliometric: params.bibliometric,
      selfImproving: params.selfImproving,
      graph: params.graph
    }),
    researchBenchmarking: buildBenchmarks({
      topics: params.topics,
      papers: params.papers,
      predictive: params.predictive,
      graph: params.graph,
      synthesis: params.synthesis,
      strategy: params.strategy
    }),
    adaptiveAgentCoordination: buildAgentCoordination({
      topics: params.topics,
      autonomousOS: params.autonomousOS,
      selfImproving: params.selfImproving
    }),
    institutionalTeamIntelligence: {
      departmentResearchProfiling: params.selfImproving.institutionalIntelligence.departmentResearchMap,
      labGroupCollaborationMapping: params.selfImproving.institutionalIntelligence.labGroupAlignment,
      facultyExpertiseAlignment: params.selfImproving.institutionalIntelligence.facultyExpertiseMatches,
      strategicResearchDashboard: params.selfImproving.institutionalIntelligence.strategicPlanningDashboard,
      collaborationOpportunityDiscovery: params.selfImproving.institutionalIntelligence.collaborationOpportunities,
      institutionalBoundary: params.selfImproving.institutionalIntelligence.evidenceBoundary
    },
    advancedWorkspaceEcosystem: buildWorkspaceEcosystem({
      memory: params.memory,
      autonomousOS: params.autonomousOS,
      selfImproving: params.selfImproving
    }),
    longTermTrajectoryViews: params.autonomousOS.researchPlanner.longTermRoadmap.slice(0, 5).map((item, index) => ({
      trajectory: `Trajectory ${index + 1}`,
      currentPosition: params.topics[index % Math.max(1, params.topics.length)]?.title ?? "대표 연구 아젠다",
      nextMilestones: [
        params.autonomousOS.researchPlanner.milestoneTracking[index % params.autonomousOS.researchPlanner.milestoneTracking.length]?.milestone ?? "문헌 검토",
        item
      ],
      evidence: params.autonomousOS.researchPlanner.plannerBoundary
    })),
    ecosystemBoundary: "Self-Evolving Academic Intelligence Ecosystem은 현재 OpenAlex 검색, 로컬 메모리, 그래프/예측/기관 지능 모듈을 통합한 적응형 운영 레이어입니다. 실제 지속 실행 스케줄러, 기관 공식 데이터 연동, 예측 정확도, 연구 성과를 보장하지 않습니다."
  };
}
