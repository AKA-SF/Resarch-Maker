import type {
  AdaptiveOptimizationControl,
  AcademicResearchOS,
  AutonomousAcademicOperatingSystem,
  AutonomousMonitoringAlert,
  BibliometricAnalysis,
  DebateSignal,
  Discipline,
  Gap,
  Methodology,
  MultiAgentWorkflow,
  PersistentScholarlyMemory,
  PredictiveAcademicIntelligence,
  ResearchCompetitionIntelligence,
  ResearchStrategy,
  RetrievedPaper,
  SelfImprovingAcademicIntelligence,
  Synthesis,
  Topic
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";
import { strategyLabels } from "./strategy";

function primaryTopic(topics: Topic[]): Topic | null {
  return topics[0] ?? null;
}

function short(text: string, limit = 420): string {
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function buildWorkflowStages(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  academicOS: AcademicResearchOS;
  predictive: PredictiveAcademicIntelligence;
  gaps: Gap[];
  methodology: Methodology;
}): AutonomousAcademicOperatingSystem["workflowStages"] {
  const topic = primaryTopic(params.topics);
  return [
    {
      id: "topic_generation",
      label: "Topic Generation",
      status: params.topics.length > 0 ? "completed" : "blocked",
      ownerAgent: "topic_generation",
      inputSummary: `검색 문헌 ${params.papers.length}편과 갭 ${params.gaps.length}개`,
      outputSummary: `${params.topics.length}개 연구주제 후보 생성`,
      evidenceBoundary: topic?.inferenceNotice ?? "토픽 근거 부족",
      nextAction: "대표 토픽을 제안서 초안으로 연결"
    },
    {
      id: "proposal_generation",
      label: "Proposal Builder",
      status: params.academicOS.proposalDraft.abstract ? "completed" : "needs_review",
      ownerAgent: "operating_system",
      inputSummary: topic?.title ?? "대표 토픽 없음",
      outputSummary: short(params.academicOS.proposalDraft.title, 120),
      evidenceBoundary: params.academicOS.proposalDraft.evidenceBoundary,
      nextAction: "문제 진술과 연구목표를 원문 검토로 보강"
    },
    {
      id: "literature_synthesis",
      label: "Literature Synthesis",
      status: params.academicOS.literatureWorkspace.annotations.length > 0 ? "completed" : "needs_review",
      ownerAgent: "theory_extraction",
      inputSummary: "검색 논문, 클러스터, 문헌고찰 초안",
      outputSummary: `${params.academicOS.literatureWorkspace.annotations.length}개 주석과 ${params.academicOS.literatureWorkspace.paperClusters.length}개 클러스터`,
      evidenceBoundary: params.academicOS.literatureWorkspace.evidenceStrengthSummary,
      nextAction: "상위 근거 논문 원문을 확인하고 주제별 문단으로 편집"
    },
    {
      id: "methodology_planning",
      label: "Methodology Planning",
      status: topic?.methodologyRecommendations.length ? "completed" : "needs_review",
      ownerAgent: "methodology_recommendation",
      inputSummary: `선택 방법론 ${methodologyLabels[params.methodology]}`,
      outputSummary: topic?.methodologyRecommendations.slice(0, 3).map((item) => `${item.method} ${item.fit}/10`).join(", ") || "방법론 추천 부족",
      evidenceBoundary: topic?.methodologyRecommendations[0]?.evidence ?? "방법론 근거 부족",
      nextAction: "표본, 측정도구, 분석 절차를 1페이지 설계로 고정"
    },
    {
      id: "optimization",
      label: "Adaptive Optimization",
      status: params.predictive.optimizationVariants.length > 0 ? "ready" : "needs_review",
      ownerAgent: "operating_system",
      inputSummary: "예측 평가, 출판 추정, 사용자 전략",
      outputSummary: `${params.predictive.optimizationVariants.length}개 전략 변형 생성`,
      evidenceBoundary: params.predictive.predictionBoundary,
      nextAction: "목표에 맞는 최적화 모드를 선택해 제안서 버전 갱신"
    },
    {
      id: "production_export",
      label: "Production & Export",
      status: "ready",
      ownerAgent: "roadmap_planning",
      inputSummary: "제안서, 문헌고찰, 방법론, 시뮬레이션",
      outputSummary: "연구 dossier 섹션을 내보낼 준비 완료",
      evidenceBoundary: "내보내기 산출물은 생성 초안이며 최종 인용과 원문 검증이 필요합니다.",
      nextAction: "Markdown/PDF로 export하고 지도교수/공동연구자 검토 진행"
    }
  ];
}

function buildProductionPipeline(academicOS: AcademicResearchOS, discipline: Discipline): AutonomousAcademicOperatingSystem["productionPipeline"] {
  const proposal = academicOS.proposalDraft;
  return {
    literatureReviewDraft: short(`${proposal.literatureSynthesis}\n\n문헌고찰은 검색 근거와 생성 서술을 분리해 작성해야 합니다.`, 900),
    conceptualFrameworkDraft: `${academicOS.conceptualFramework.modelTitle}\n${academicOS.conceptualFramework.theoryIntegrationDiagram}\n${academicOS.conceptualFramework.evidenceBoundary}`,
    methodologySectionDraft: short(`${proposal.methodologyPlan}\n표본과 분석 절차는 원문 척도 검토, IRB/윤리, 데이터 접근성을 확인한 뒤 확정합니다.`, 900),
    discussionContributionDraft: short(`${proposal.expectedContribution}\n${academicOS.writingIntelligence.discussionSuggestions.join(" ")}`, 900),
    futureResearchSection: short(proposal.futureWorkDirections.join(" "), 900),
    conferenceAbstractDraft: short(`${proposal.title}. ${proposal.abstract} 본 연구는 ${disciplineLabels[discipline]} 분야의 이론적·실무적 기여를 제안하며, 검색 근거 기반의 연구계획 초안으로 제시된다.`, 900),
    productionBoundary: "생산 파이프라인의 글은 AI-assisted draft입니다. 논문·인용·결과를 새로 만들지 않으며 원문 확인과 연구자 편집이 필요합니다."
  };
}

function buildPlanner(academicOS: AcademicResearchOS, predictive: PredictiveAcademicIntelligence, memory: PersistentScholarlyMemory): AutonomousAcademicOperatingSystem["researchPlanner"] {
  const thesis = academicOS.workflowAutomation.thesisDissertationPlan;
  const agenda = academicOS.workflowAutomation.multiPaperAgendaConstruction;
  return {
    dissertationThesisPlan: thesis.map((item, index) => ({
      study: item.title,
      dependsOn: index === 0 ? [] : [thesis[index - 1]?.title ?? "previous chapter"],
      milestone: item.rationale,
      status: index <= 1 ? "ready" : "planned"
    })),
    multiPaperAgenda: agenda.map((item, index) => ({
      study: item.title,
      dependsOn: index === 0 ? ["문헌고찰 초안"] : [agenda[index - 1]?.title ?? "previous paper"],
      milestone: item.rationale,
      status: "planned"
    })),
    publicationSequencing: predictive.strategySimulations.slice(0, 4).map((scenario) => `${scenario.scenario}: ${scenario.recommendedMoves.join(" → ")}`),
    longTermRoadmap: [
      ...memory.researchRecall.continuedResearchAgenda.slice(0, 4),
      ...predictive.impactIntelligence.downstreamResearchPathways.slice(0, 4)
    ].slice(0, 8),
    milestoneTracking: [
      { milestone: "키워드 기반 검색 완료", dueOrder: 1, evidence: `${memory.currentSession.keywords.join(", ")} 세션 저장`, status: "completed" },
      { milestone: "제안서 초안 생성", dueOrder: 2, evidence: academicOS.proposalDraft.evidenceBoundary, status: "completed" },
      { milestone: "방법론 설계 검토", dueOrder: 3, evidence: thesis[2]?.evidence ?? "방법론 지침 확인 필요", status: "ready" },
      { milestone: "투고/학회 전략 선택", dueOrder: 4, evidence: predictive.publicationOutcomes[0]?.warning ?? "출판 예측 부족", status: "needs_review" }
    ],
    plannerBoundary: "플래너는 dependency-aware 연구 운영 초안입니다. 실제 일정, IRB, 데이터 접근, 공동저자 합의는 사용자가 확정해야 합니다."
  };
}

function buildReasoning(
  academicOS: AcademicResearchOS,
  selfImproving: SelfImprovingAcademicIntelligence,
  debates: DebateSignal[],
  gaps: Gap[]
): AutonomousAcademicOperatingSystem["scholarlyReasoning"] {
  return {
    competingTheoryEvaluation: academicOS.reasoningWorkflow.theoryComparison,
    causalVsExploratoryReasoning: [
      academicOS.conceptualFramework.causalPathwayExplanation,
      "인과 질문은 실험/종단/준실험 식별전략이 있을 때만 강하게 주장하고, 그렇지 않으면 탐색적·설명적 설계로 표현합니다."
    ],
    methodologyTradeoffAnalysis: academicOS.reasoningWorkflow.methodologyTradeoffs,
    evidenceStrengthEstimation: [
      academicOS.literatureWorkspace.evidenceStrengthSummary,
      ...selfImproving.evaluationEngine.evaluatedTopics.slice(0, 2).map((item) => `${item.topicTitle}: 종합 ${item.overall}/10`)
    ],
    contradictionResolutionWorkflow: debates.length > 0
      ? debates.slice(0, 4).map((debate) => `${debate.claim} → 원문 결과 방향, 표본, 측정, 분석 방법을 비교해 해소합니다. 근거: ${debate.evidence}`)
      : ["명시 논쟁 신호가 부족합니다. 원문 검토에서 결과 방향과 측정 차이를 확인하세요."],
    interdisciplinarySynthesisReasoning: gaps.slice(0, 4).map((gap) => `${gap.claim} ${gap.evidence}`),
    reasoningBoundary: "추론 패널은 검색 메타데이터와 생성 분석을 연결한 reasoning aid입니다. 학술적 사실 확정이나 원문 결과 해석을 대체하지 않습니다."
  };
}

function buildMonitoringAlerts(
  predictive: PredictiveAcademicIntelligence,
  competition: ResearchCompetitionIntelligence,
  bibliometric: BibliometricAnalysis
): AutonomousMonitoringAlert[] {
  return [
    ...predictive.forecasting.emergingResearchDomains.slice(0, 3).map((item) => ({
      type: "emerging_topic" as const,
      label: item.label,
      severity: item.score >= 7 ? "act" as const : "watch" as const,
      evidence: item.evidence,
      suggestedAction: "원문 3-5편을 확인하고 연구문제에 포함할지 판단하세요."
    })),
    ...predictive.forecasting.risingTheoriesFrameworks.slice(0, 2).map((item) => ({
      type: "rising_theory" as const,
      label: item.label,
      severity: "watch" as const,
      evidence: item.evidence,
      suggestedAction: "이론 정의와 경쟁 프레임워크를 비교하세요."
    })),
    ...competition.rapidlyGrowingAreas.slice(0, 2).map((item) => ({
      type: "publication_surge" as const,
      label: item.label,
      severity: item.level === "high" ? "act" as const : "watch" as const,
      evidence: item.evidence,
      suggestedAction: "차별화 포인트를 빠르게 고정하세요."
    })),
    ...predictive.forecasting.decliningSaturatedTopics.slice(0, 2).map((item) => ({
      type: "declining_saturated_domain" as const,
      label: item.label,
      severity: "watch" as const,
      evidence: item.evidence,
      suggestedAction: "포화 프레이밍을 피하고 표본/방법론 차별화를 추가하세요."
    })),
    {
      type: "methodology_shift" as const,
      label: bibliometric.researchMaturity.stage,
      severity: bibliometric.researchMaturity.score >= 7 ? "watch" as const : "info" as const,
      evidence: bibliometric.researchMaturity.evidence,
      suggestedAction: "분야 성숙도에 맞춰 탐색/검증/리뷰 설계를 선택하세요."
    }
  ].slice(0, 10);
}

function buildOptimizationControls(predictive: PredictiveAcademicIntelligence, strategy: ResearchStrategy): AutonomousAcademicOperatingSystem["optimizationControls"] {
  const variants = predictive.optimizationVariants;
  const controls: AdaptiveOptimizationControl[] = [
    {
      objective: "novelty",
      recommendedMove: variants.find((variant) => variant.variant === "novelty")?.strategy ?? "약한 이론 연결을 하나만 선택하세요.",
      expectedTradeoff: "문헌 지지 방어 부담 증가",
      evidence: predictive.forecasting.likelyFutureHotTopics[0]?.evidence ?? "hot topic 신호 부족",
      priority: strategy === "high-impact/high-risk research" ? 1 : 4
    },
    {
      objective: "publishability",
      recommendedMove: variants.find((variant) => variant.variant === "publication_likelihood")?.strategy ?? "범위와 방법론 적합도를 좁히세요.",
      expectedTradeoff: "참신성 일부 감소",
      evidence: predictive.publicationOutcomes[0]?.evidence ?? "출판 추정 부족",
      priority: strategy === "fast publishable topics" ? 1 : 2
    },
    {
      objective: "feasibility",
      recommendedMove: variants.find((variant) => variant.variant === "feasibility")?.strategy ?? "접근 가능한 데이터부터 선택하세요.",
      expectedTradeoff: "이론 야심 감소",
      evidence: predictive.advancedEvaluation[0]?.reasoning.join(" ") ?? "평가 근거 부족",
      priority: 2
    },
    {
      objective: "interdisciplinary_impact",
      recommendedMove: "핵심 분야 기여와 인접 분야 기여를 별도 문단으로 분리하세요.",
      expectedTradeoff: "심사자 기대치가 복잡해질 수 있음",
      evidence: predictive.impactIntelligence.potentialInterdisciplinaryInfluence[0]?.evidence ?? "융합 영향 신호 부족",
      priority: strategy === "interdisciplinary innovation" ? 1 : 5
    },
    {
      objective: "theoretical_rigor",
      recommendedMove: "경쟁 이론과 핵심 이론의 설명 범위를 비교표로 정리하세요.",
      expectedTradeoff: "초안 작성 시간이 증가",
      evidence: predictive.advancedEvaluation[0] ? `이론 정합성 ${predictive.advancedEvaluation[0].theoreticalCoherence}/10` : "평가 부족",
      priority: strategy === "theory-heavy research" ? 1 : 3
    },
    {
      objective: "practical_relevance",
      recommendedMove: "실무 의사결정, 데이터 수집 가능성, 적용 맥락을 기여문장에 포함하세요.",
      expectedTradeoff: "순수 이론 기여가 약해 보일 수 있음",
      evidence: predictive.advancedEvaluation[0] ? `실무 관련성 ${predictive.advancedEvaluation[0].practicalRelevance}/10` : "평가 부족",
      priority: strategy === "practitioner-oriented research" ? 1 : 4
    },
    {
      objective: "fast_publication",
      recommendedMove: "단일 데이터셋, 단일 분석, 명확한 결과변수 중심으로 축소하세요.",
      expectedTradeoff: "장기 확장성 일부 감소",
      evidence: predictive.publicationOutcomes[0]?.reasoning[0] ?? "출판 추정 부족",
      priority: strategy === "fast publishable topics" ? 1 : 3
    },
    {
      objective: "long_term_positioning",
      recommendedMove: "첫 논문은 안전하게, 두 번째 논문은 참신하게, 세 번째 논문은 융합 확장으로 배열하세요.",
      expectedTradeoff: "단기 초점이 흐려질 수 있음",
      evidence: predictive.comparativeScenarioAnalysis.join(" "),
      priority: 3
    }
  ];
  return controls.sort((a, b) => a.priority - b.priority);
}

function buildWorkspace(
  topics: Topic[],
  academicOS: AcademicResearchOS,
  memory: PersistentScholarlyMemory,
  strategy: ResearchStrategy
): AutonomousAcademicOperatingSystem["workspaceCollaboration"] {
  const topic = primaryTopic(topics);
  const projectTitle = topic?.title ?? academicOS.proposalDraft.title;
  return {
    projectId: `project-${memory.currentSession.sessionId}`,
    projectTitle,
    collaborators: ["사용자", "Retrieval Agent", "Synthesis Agent", "Methodology Agent", "Prediction Agent", "Operating System"],
    proposalVersions: [
      {
        version: "v1-topic",
        title: topic?.title ?? "초기 토픽",
        changeSummary: "초기 검색/갭 기반 토픽 생성",
        evidence: topic?.inferenceNotice ?? "토픽 근거 부족"
      },
      {
        version: "v2-proposal",
        title: academicOS.proposalDraft.title,
        changeSummary: "연구 제안서 초안, 문헌 합성, 방법론 계획 생성",
        evidence: academicOS.proposalDraft.evidenceBoundary
      },
      {
        version: "v3-strategy",
        title: `${strategyLabels[strategy]} 전략 버전`,
        changeSummary: "예측/최적화 신호를 반영할 준비 완료",
        evidence: "전략 버전은 선택 목표에 따라 재작성해야 합니다."
      }
    ],
    researchEvolutionHistory: [
      ...memory.currentSession.refinementHistory.slice(0, 4),
      ...memory.researchRecall.continuedResearchAgenda.slice(0, 4)
    ],
    exportableDossierSections: [
      "Executive research brief",
      "Proposal draft",
      "Literature synthesis",
      "Conceptual framework",
      "Methodology plan",
      "Optimization scenarios",
      "Monitoring alerts",
      "Evidence appendix"
    ],
    persistenceBoundary: "워크스페이스 메타데이터는 현재 결과와 로컬 메모리 기반입니다. 실시간 공동 편집/권한 관리는 포함하지 않습니다."
  };
}

export function buildAutonomousAcademicOS(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  gaps: Gap[];
  debates: DebateSignal[];
  academicOS: AcademicResearchOS;
  multiAgentWorkflow: MultiAgentWorkflow;
  predictive: PredictiveAcademicIntelligence;
  memory: PersistentScholarlyMemory;
  selfImproving: SelfImprovingAcademicIntelligence;
  competition: ResearchCompetitionIntelligence;
  bibliometric: BibliometricAnalysis;
  discipline: Discipline;
  methodology: Methodology;
  strategy: ResearchStrategy;
}): AutonomousAcademicOperatingSystem {
  const workflowStages = buildWorkflowStages({
    topics: params.topics,
    papers: params.papers,
    academicOS: params.academicOS,
    predictive: params.predictive,
    gaps: params.gaps,
    methodology: params.methodology
  });
  const completedStages = workflowStages.filter((stage) => stage.status === "completed").length;
  const readyStages = workflowStages.filter((stage) => stage.status === "ready").length;
  const needsReview = workflowStages.filter((stage) => stage.status === "needs_review").length;

  return {
    workflowRunId: `autonomous-os-${Date.now()}`,
    workflowStages,
    adaptiveStateSummary: `${disciplineLabels[params.discipline]} · ${methodologyLabels[params.methodology]} · ${strategyLabels[params.strategy]} 모드에서 ${completedStages}개 단계 완료, ${readyStages}개 단계 준비, ${needsReview}개 단계 검토 필요입니다.`,
    agentCoordination: params.multiAgentWorkflow,
    productionPipeline: buildProductionPipeline(params.academicOS, params.discipline),
    researchPlanner: buildPlanner(params.academicOS, params.predictive, params.memory),
    scholarlyReasoning: buildReasoning(params.academicOS, params.selfImproving, params.debates, params.gaps),
    monitoringAlerts: buildMonitoringAlerts(params.predictive, params.competition, params.bibliometric),
    optimizationControls: buildOptimizationControls(params.predictive, params.strategy),
    workspaceCollaboration: buildWorkspace(params.topics, params.academicOS, params.memory, params.strategy),
    progressDashboard: [
      { label: "Workflow", completed: completedStages + readyStages, total: workflowStages.length, status: needsReview > 0 ? "needs_review" : "on_track" },
      { label: "Production Drafts", completed: 6, total: 6, status: "on_track" },
      { label: "Planning", completed: params.academicOS.workflowAutomation.thesisDissertationPlan.length, total: Math.max(1, params.academicOS.workflowAutomation.thesisDissertationPlan.length), status: "on_track" },
      { label: "Monitoring", completed: params.predictive.forecasting.likelyFutureHotTopics.length, total: 6, status: "on_track" },
      { label: "Workspace Versions", completed: 3, total: 3, status: "on_track" }
    ],
    operatingBoundary: "Fully Autonomous Academic Operating System은 연구 워크플로우를 조율하고 초안을 생산하는 로컬/규칙 기반 운영 레이어입니다. 원문 검토, 실제 실험, IRB, 공동저자 의사결정, 투고 성공을 자동 수행하거나 보장하지 않습니다."
  };
}
