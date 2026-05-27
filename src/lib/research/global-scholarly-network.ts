import type {
  AutonomousAcademicOperatingSystem,
  BibliometricAnalysis,
  DebateSignal,
  Discipline,
  GlobalAutonomousScholarlyNetwork,
  Methodology,
  PublicationIntelligence,
  RetrievedPaper,
  SelfEvolvingAcademicEcosystem,
  SelfImprovingAcademicIntelligence,
  Synthesis,
  TheoryGraph,
  Topic
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function topicEvidenceCoverage(topic: Topic, papers: RetrievedPaper[]): number {
  return clamp(2 + Math.min(5, topic.evidencePaperIds.length) + (papers.length >= 20 ? 2 : papers.length >= 10 ? 1 : 0));
}

function buildSelfEvaluation(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  graph: TheoryGraph;
  debates: DebateSignal[];
  methodology: Methodology;
}): GlobalAutonomousScholarlyNetwork["selfEvaluationWorkflows"] {
  return params.topics.slice(0, 5).map((topic) => {
    const evidenceCoverage = topicEvidenceCoverage(topic, params.papers);
    const graphSupport = params.graph.nodes.filter((node) =>
      [topic.coreTheory, ...topic.variables, ...topic.adjacentTheories].some((label) => label.toLowerCase() === node.label.toLowerCase())
    ).length;
    const methodologyFit = topic.methodologyRecommendations.find((item) => item.method === topic.recommendedMethodology)?.fit
      ?? topic.methodologyRecommendations[0]?.fit
      ?? topic.scores.feasibility;
    const weakReasoningChains = [
      topic.coreTheory ? "" : "핵심 이론이 명시되지 않아 이론-변수 연결이 약합니다.",
      topic.evidencePaperIds.length < 3 ? "근거 논문 수가 적어 일반화된 문헌 주장으로 쓰기 어렵습니다." : "",
      params.debates.length > 0 ? "상충/긴장 신호가 있어 원문 결과 방향을 비교해야 합니다." : "",
      topic.variables.length < 3 ? "변수/개념 구조가 단순해 가설 체계가 약할 수 있습니다." : ""
    ].filter(Boolean);
    const unsupportedTheoreticalAssumptions = [
      ...topic.adjacentTheories.filter((theory) => !params.graph.nodes.some((node) => node.label.toLowerCase() === theory.toLowerCase())).map((theory) => `${theory} 연결은 그래프 근거가 약해 원문 확인이 필요합니다.`),
      ...(topic.mediatorsModerators.length === 0 ? ["매개/조절 구조가 부족해 이론적 메커니즘이 약할 수 있습니다."] : [])
    ].slice(0, 4);
    return {
      topicTitle: topic.title,
      qualityScore: clamp((topic.scores.novelty + topic.scores.feasibility + topic.scores.publishability + evidenceCoverage + methodologyFit) / 5),
      evidenceCoverage,
      weakReasoningChains,
      unsupportedTheoreticalAssumptions,
      methodologyCritique: `${methodologyLabels[params.methodology]} 선택은 적합도 ${methodologyFit}/10입니다. 표본, 측정도구, 식별전략이 확보되지 않으면 방법론 주장은 약해질 수 있습니다.`,
      autonomousImprovementActions: [
        "근거 논문 ID가 연결된 주장만 핵심 주장으로 유지",
        graphSupport >= 3 ? "그래프에서 반복된 이론/개념을 우선 프레임으로 사용" : "그래프 지지가 약한 개념은 탐색 후보로 낮춰 표현",
        methodologyFit < 7 ? "방법론을 더 단순하거나 자료 접근성이 높은 설계로 재검토" : "현재 방법론을 유지하되 측정 타당도와 표본 크기 계획 보강",
        weakReasoningChains.length > 0 ? "약한 추론 체인을 문헌 검토 체크리스트로 전환" : "현재 논리 구조를 제안서 버전으로 승격"
      ],
      evaluationBoundary: "자기평가는 검색 메타데이터, 그래프 연결성, 기존 점수를 결합한 휴리스틱입니다. 원문 품질 평가나 심사 결과를 대체하지 않습니다."
    };
  });
}

function buildGlobalEcosystem(params: {
  discipline: Discipline;
  synthesis: Synthesis;
  publication: PublicationIntelligence;
  ecosystem: SelfEvolvingAcademicEcosystem;
  selfImproving: SelfImprovingAcademicIntelligence;
}): GlobalAutonomousScholarlyNetwork["globalAcademicEcosystemIntelligence"] {
  return {
    disciplineEcosystems: [
      {
        discipline: disciplineLabels[params.discipline],
        signal: `${params.synthesis.trends.length}개 트렌드와 ${params.synthesis.theories.length}개 이론 신호`,
        evidence: "현재 OpenAlex 검색 결과의 제목/초록/개념 필드에서 계산했습니다."
      },
      ...params.synthesis.relatedTheories.slice(0, 4).map((item) => ({
        discipline: item.label,
        signal: `인접 생태계 후보 · ${item.support}편`,
        evidence: item.paperIds.join(", ") || "paper id 부족"
      }))
    ],
    institutionEcosystems: params.ecosystem.institutionalTeamIntelligence.facultyExpertiseAlignment,
    journalConferenceEcosystems: [
      ...params.publication.journals.slice(0, 5).map((venue) => ({
        venue: venue.name,
        fitSignal: `topic fit ${venue.topicFit}/10 · methodology fit ${venue.methodologyFit}/10`,
        evidence: `${venue.impactTrendEstimate} ${venue.publishabilityReasoning}`
      })),
      ...params.publication.conferences.slice(0, 3).map((venue) => ({
        venue: venue.name,
        fitSignal: `topic fit ${venue.topicFit}/10 · methodology fit ${venue.methodologyFit}/10`,
        evidence: `${venue.impactTrendEstimate} ${venue.publishabilityReasoning}`
      }))
    ],
    fundingTrendProxies: params.ecosystem.ecosystemMonitoringFeeds.filter((feed) => feed.type === "funding_aligned_trend"),
    collaborationNetworkSignals: params.ecosystem.institutionalTeamIntelligence.collaborationOpportunityDiscovery,
    emergingInterdisciplinaryEcosystems: params.ecosystem.ecosystemMonitoringFeeds.filter((feed) => feed.type === "interdisciplinary_convergence"),
    ecosystemBoundary: "글로벌 생태계 지능은 현재 검색 집합의 분야·기관·출판원·협업 신호를 정리한 것입니다. 실제 전세계 커버리지, 펀딩 DB, 기관 내부 데이터는 연결하지 않습니다."
  };
}

function buildSignalDetection(params: {
  ecosystem: SelfEvolvingAcademicEcosystem;
  bibliometric: BibliometricAnalysis;
  graph: TheoryGraph;
  synthesis: Synthesis;
}): GlobalAutonomousScholarlyNetwork["advancedSignalDetection"] {
  const weakSignals = params.ecosystem.ecosystemMonitoringFeeds
    .filter((feed) => feed.priority !== "high")
    .slice(0, 6);
  const acceleratingMethodologies = params.ecosystem.ecosystemMonitoringFeeds
    .filter((feed) => feed.type === "emerging_methodology")
    .slice(0, 5);
  const futureHighImpactDomains = params.ecosystem.ecosystemMonitoringFeeds
    .filter((feed) => feed.type === "fast_growing_area" || feed.type === "interdisciplinary_convergence")
    .slice(0, 6);

  return {
    weakSignals,
    earlyInterdisciplinaryConvergence: params.ecosystem.selfEvolvingKnowledgeGraph.multiHopDiscovery.slice(0, 5),
    acceleratingMethodologies,
    hiddenConceptRelationships: params.ecosystem.selfEvolvingKnowledgeGraph.hiddenConceptDiscovery.slice(0, 6),
    underRecognizedOpportunities: [
      ...params.ecosystem.continuousLearning.gapRefinements.map((gap) => gap.refinedGap),
      ...params.synthesis.emergingTopics.slice(0, 4).map((item) => `${item.label}: 최근 문헌 ${item.support}편 기반 초기 기회 후보`)
    ].slice(0, 8),
    futureHighImpactDomains,
    signalBoundary: `약신호 탐지는 연구 성숙도 ${params.bibliometric.researchMaturity.score}/10, 그래프 약한 연결 ${params.graph.metrics.weakConnectionCount}개, emerging 연결 ${params.graph.metrics.emergingConnectionCount}개를 결합한 휴리스틱입니다.`
  };
}

function buildStrategies(params: {
  ecosystem: SelfEvolvingAcademicEcosystem;
  selfEvaluation: GlobalAutonomousScholarlyNetwork["selfEvaluationWorkflows"];
  discipline: Discipline;
  methodology: Methodology;
}): GlobalAutonomousScholarlyNetwork["autonomousResearchStrategies"] {
  const topBenchmark = params.ecosystem.researchBenchmarking[0];
  const topQuality = params.selfEvaluation[0];
  const evidence = topBenchmark?.evidence ?? topQuality?.evaluationBoundary ?? "대표 토픽 평가 부족";
  return [
    {
      audience: "graduate_student",
      strategyTitle: "좁고 검증 가능한 학위 연구 경로",
      recommendedMoves: ["핵심 변수 3개 이하로 축소", "접근 가능한 표본과 분석법 우선", "약한 이론 연결은 future work로 이동"],
      riskControls: ["과도한 인과 주장 금지", "근거 논문 ID가 없는 주장 제거"],
      evidence
    },
    {
      audience: "professor",
      strategyTitle: "이론 기여와 후속 연구 체인 강화",
      recommendedMoves: ["이론 계보와 경쟁 프레임워크 비교", "후속 연구 2-3편으로 확장", "기관 협업 신호와 연결"],
      riskControls: ["분야 밖 확장 주장은 보수적으로 표현", "예측/펀딩 정렬은 proxy로 라벨링"],
      evidence
    },
    {
      audience: "research_lab",
      strategyTitle: "랩 단위 데이터·방법론 포트폴리오",
      recommendedMoves: ["방법론 비교표 작성", "공통 데이터 수집 프로토콜 설계", "협업 기회 상위 3개 검토"],
      riskControls: ["표본 접근성과 윤리 심사 부담 사전 점검", "중복 토픽은 로컬 메모리로 표시"],
      evidence
    },
    {
      audience: "institution",
      strategyTitle: "기관 연구 방향 대시보드",
      recommendedMoves: ["학과 프로필과 faculty alignment 연결", "출판원 후보와 연구 클러스터 비교", "기관 dossier로 export"],
      riskControls: ["기관 내부 성과 데이터로 오인하지 않기", "OpenAlex 검색 집합 범위 명시"],
      evidence
    },
    {
      audience: "interdisciplinary_team",
      strategyTitle: `${disciplineLabels[params.discipline]} 중심 융합 탐색`,
      recommendedMoves: ["bridge concept를 한 개만 핵심 기여로 선택", "두 분야의 심사 기준을 따로 정리", "용어 정의를 초반에 고정"],
      riskControls: ["융합성을 과장하지 않기", "분야별 근거 논문 균형 확인"],
      evidence
    },
    {
      audience: "publication_agenda",
      strategyTitle: "장기 출판 아젠다",
      recommendedMoves: params.ecosystem.advancedWorkspaceEcosystem.longTermResearchMemory.slice(0, 3),
      riskControls: ["첫 논문은 실행가능성 우선", "두 번째 이후에 고참신성 변형 사용"],
      evidence
    },
    {
      audience: "funding_aligned_direction",
      strategyTitle: "펀딩 정렬 후보 탐색",
      recommendedMoves: ["성장 주제 신호를 실제 공모문과 대조", "사회적/실무적 기여 문장 보강", `${methodologyLabels[params.methodology]}의 실행 예산과 자료 접근성 확인`],
      riskControls: ["펀딩 DB 직접 검증 전에는 funding-aligned proxy로만 표시", "미래 hot topic 보장 표현 금지"],
      evidence
    }
  ];
}

function buildQualityAssurance(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  selfEvaluation: GlobalAutonomousScholarlyNetwork["selfEvaluationWorkflows"];
  autonomousOS: AutonomousAcademicOperatingSystem;
  graph: TheoryGraph;
}): GlobalAutonomousScholarlyNetwork["researchQualityAssurance"] {
  const paperIds = new Set(params.papers.map((paper) => paper.id));
  const avgEvidence = average(params.selfEvaluation.map((item) => item.evidenceCoverage));
  return {
    evidenceConfidenceEstimates: params.selfEvaluation.map((item) => ({
      target: item.topicTitle,
      confidence: item.evidenceCoverage >= 8 ? "high" : item.evidenceCoverage >= 5 ? "medium" : "low",
      evidence: `근거 coverage ${item.evidenceCoverage}/10, quality ${item.qualityScore}/10.`
    })),
    hallucinationRiskFlags: params.selfEvaluation.map((item) => ({
      target: item.topicTitle,
      risk: item.unsupportedTheoreticalAssumptions.length >= 3 ? "high" : item.weakReasoningChains.length >= 2 ? "medium" : "low",
      reason: [...item.unsupportedTheoreticalAssumptions, ...item.weakReasoningChains].slice(0, 2).join(" ") || "현재 구조에서는 낮은 위험입니다."
    })),
    unsupportedClaimChecks: params.selfEvaluation.flatMap((item) => item.unsupportedTheoreticalAssumptions).slice(0, 8),
    citationConsistencyChecks: params.topics.slice(0, 5).map((topic) => {
      const missing = topic.evidencePaperIds.filter((id) => !paperIds.has(id));
      return missing.length === 0
        ? `${topic.title}: 연결된 근거 paper id가 현재 검색 결과 안에 있습니다.`
        : `${topic.title}: 현재 검색 결과에 없는 paper id ${missing.join(", ")}가 있어 확인 필요.`;
    }),
    reasoningChainValidation: [
      ...params.autonomousOS.scholarlyReasoning.causalVsExploratoryReasoning,
      ...params.selfEvaluation.flatMap((item) => item.weakReasoningChains)
    ].slice(0, 8),
    methodologicalPlausibilityValidation: params.selfEvaluation.map((item) => item.methodologyCritique),
    qaBoundary: `QA는 평균 evidence coverage ${avgEvidence.toFixed(1)}/10과 그래프 엣지 ${params.graph.edges.length}개를 기반으로 위험을 표시합니다. 원문 citation audit나 표절/팩트체크 도구가 아닙니다.`
  };
}

export function buildGlobalAutonomousScholarlyNetwork(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  graph: TheoryGraph;
  debates: DebateSignal[];
  bibliometric: BibliometricAnalysis;
  publication: PublicationIntelligence;
  selfImproving: SelfImprovingAcademicIntelligence;
  ecosystem: SelfEvolvingAcademicEcosystem;
  autonomousOS: AutonomousAcademicOperatingSystem;
  discipline: Discipline;
  methodology: Methodology;
}): GlobalAutonomousScholarlyNetwork {
  const selfEvaluationWorkflows = buildSelfEvaluation({
    topics: params.topics,
    papers: params.papers,
    graph: params.graph,
    debates: params.debates,
    methodology: params.methodology
  });
  return {
    networkRunId: `global-network-${Date.now()}`,
    selfEvaluationWorkflows,
    autonomousScholarlyEvolution: {
      theoryRelationshipRefinements: params.ecosystem.continuousLearning.theoryRelationshipUpdates,
      topicScoringModelUpdates: params.ecosystem.continuousLearning.topicScoringEvolution,
      forecastingLogicAdaptations: params.ecosystem.continuousLearning.forecastingModelAdaptations,
      gapDetectionImprovements: params.ecosystem.continuousLearning.gapRefinements,
      priorOutcomeLearning: [
        `로컬 prior session ${params.ecosystem.advancedWorkspaceEcosystem.longTermResearchMemory.length}개 장기 기억 신호를 추천에 반영`,
        "성공/실패 결과 라벨은 아직 외부에서 입력받지 않으므로 중복·coverage·benchmark를 proxy로 사용"
      ],
      longTermRecommendationOptimizations: params.ecosystem.longTermTrajectoryViews.map((view) => `${view.trajectory}: ${view.nextMilestones.join(" → ")}`),
      evolutionBoundary: "자율 진화는 현재 세션과 로컬 메모리의 휴리스틱 업데이트입니다. 실제 성공/실패 학습 데이터셋이나 자동 모델 재학습은 포함하지 않습니다."
    },
    globalAcademicEcosystemIntelligence: buildGlobalEcosystem({
      discipline: params.discipline,
      synthesis: params.synthesis,
      publication: params.publication,
      ecosystem: params.ecosystem,
      selfImproving: params.selfImproving
    }),
    advancedSignalDetection: buildSignalDetection({
      ecosystem: params.ecosystem,
      bibliometric: params.bibliometric,
      graph: params.graph,
      synthesis: params.synthesis
    }),
    autonomousResearchStrategies: buildStrategies({
      ecosystem: params.ecosystem,
      selfEvaluation: selfEvaluationWorkflows,
      discipline: params.discipline,
      methodology: params.methodology
    }),
    researchQualityAssurance: buildQualityAssurance({
      topics: params.topics,
      papers: params.papers,
      selfEvaluation: selfEvaluationWorkflows,
      autonomousOS: params.autonomousOS,
      graph: params.graph
    }),
    networkBoundary: "Global Autonomous Scholarly Intelligence Network는 현재 검색 결과, 로컬 메모리, 그래프, 평가 휴리스틱을 통합한 전략/QA 레이어입니다. 전세계 학술 데이터 전체, 실제 펀딩 DB, 미래 영향력, 게재 결과를 보장하지 않습니다."
  };
}
