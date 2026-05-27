import type {
  AutonomousAcademicOperatingSystem,
  DebateSignal,
  Gap,
  GlobalAutonomousScholarlyNetwork,
  RelationshipInsight,
  RetrievedPaper,
  Synthesis,
  TheoryGraph,
  Topic,
  TrustedAcademicIntelligenceInfrastructure,
  VerifiableReasoningTrace
} from "./types";

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function confidenceFromScore(score: number): "low" | "medium" | "high" {
  return score >= 8 ? "high" : score >= 5 ? "medium" : "low";
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function paperSummary(papers: RetrievedPaper[], ids: string[]): VerifiableReasoningTrace["supportingPapers"] {
  const idSet = new Set(ids);
  return papers
    .filter((paper) => idSet.has(paper.id))
    .slice(0, 6)
    .map((paper) => ({
      id: paper.id,
      title: paper.title,
      year: paper.year,
      source: paper.source
    }));
}

function buildTopicTraces(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  global: GlobalAutonomousScholarlyNetwork;
}): VerifiableReasoningTrace[] {
  return params.topics.slice(0, 5).map((topic, index) => {
    const evaluation = params.global.selfEvaluationWorkflows.find((item) => item.topicTitle === topic.title);
    const confidenceScore = clamp(((evaluation?.qualityScore ?? topic.scores.publishability) + (evaluation?.evidenceCoverage ?? topic.scores.dataAvailability)) / 2);
    return {
      id: `trace-topic-${index + 1}`,
      targetType: "topic",
      target: topic.title,
      conclusion: topic.researchQuestion,
      traceSteps: [
        {
          step: "retrieved_evidence",
          summary: `${topic.evidencePaperIds.length}개 근거 paper id가 토픽에 연결되었습니다.`,
          evidencePaperIds: topic.evidencePaperIds,
          confidence: confidenceFromScore(topic.evidencePaperIds.length + 4)
        },
        {
          step: "extracted_signal",
          summary: `핵심 이론 ${topic.coreTheory || "부족"}와 변수 ${topic.variables.slice(0, 4).join(", ")}를 추출했습니다.`,
          evidencePaperIds: topic.evidencePaperIds,
          confidence: topic.coreTheory ? "medium" : "low"
        },
        {
          step: "generated_inference",
          summary: topic.inferenceNotice,
          evidencePaperIds: topic.evidencePaperIds,
          confidence: confidenceFromScore(topic.scores.novelty)
        },
        {
          step: "scored_decision",
          summary: `품질 ${evaluation?.qualityScore ?? topic.scores.publishability}/10, 근거 coverage ${evaluation?.evidenceCoverage ?? topic.scores.dataAvailability}/10.`,
          evidencePaperIds: topic.evidencePaperIds,
          confidence: confidenceFromScore(confidenceScore)
        },
        {
          step: "human_review_needed",
          summary: "연구자가 원문, 척도, 표본 접근성, 윤리 조건을 확인해야 합니다.",
          evidencePaperIds: topic.evidencePaperIds,
          confidence: "medium"
        }
      ],
      supportingPapers: paperSummary(params.papers, topic.evidencePaperIds),
      supportingTheories: unique([topic.coreTheory, ...topic.adjacentTheories, ...params.synthesis.theories.slice(0, 3).map((item) => item.label)]),
      confidenceScore,
      evidencePathSummary: `papers → theories/concepts → generated topic → QA score의 경로입니다. 원문 검토 전 확정 주장이 아닙니다.`
    };
  });
}

function buildGapTraces(gaps: Gap[], papers: RetrievedPaper[]): VerifiableReasoningTrace[] {
  return gaps.slice(0, 5).map((gap, index) => {
    const confidenceScore = gap.confidence === "high" ? 8 : gap.confidence === "medium" ? 6 : 4;
    return {
      id: `trace-gap-${index + 1}`,
      targetType: "gap",
      target: gap.claim,
      conclusion: gap.evidence,
      traceSteps: [
        {
          step: "retrieved_evidence",
          summary: `${gap.paperIds.length}개 paper id가 갭 신호 계산에 사용되었습니다.`,
          evidencePaperIds: gap.paperIds,
          confidence: gap.confidence
        },
        {
          step: "generated_inference",
          summary: `${gap.type} 유형의 gap candidate로 생성되었습니다.`,
          evidencePaperIds: gap.paperIds,
          confidence: gap.confidence
        },
        {
          step: "human_review_needed",
          summary: "체계적 문헌고찰 전에는 실제 연구 갭으로 단정하지 않습니다.",
          evidencePaperIds: gap.paperIds,
          confidence: "medium"
        }
      ],
      supportingPapers: paperSummary(papers, gap.paperIds),
      supportingTheories: [],
      confidenceScore,
      evidencePathSummary: "검색 집합의 빈도/연결성 신호에서 gap candidate가 생성되었습니다."
    };
  });
}

function buildRelationshipTraces(relationships: RelationshipInsight[], papers: RetrievedPaper[], graph: TheoryGraph): VerifiableReasoningTrace[] {
  return relationships.slice(0, 5).map((relationship, index) => {
    const confidenceScore = relationship.confidence === "high" ? 8 : relationship.confidence === "medium" ? 6 : 4;
    return {
      id: `trace-relationship-${index + 1}`,
      targetType: "theory_relationship",
      target: relationship.title,
      conclusion: relationship.evidence,
      traceSteps: [
        {
          step: "retrieved_evidence",
          summary: `${relationship.paperIds.length}편에서 관계 신호가 계산되었습니다.`,
          evidencePaperIds: relationship.paperIds,
          confidence: relationship.confidence
        },
        {
          step: "extracted_signal",
          summary: `관계 유형 ${relationship.type}, 그래프 엣지 ${graph.edges.length}개 맥락에서 해석했습니다.`,
          evidencePaperIds: relationship.paperIds,
          confidence: relationship.confidence
        }
      ],
      supportingPapers: paperSummary(papers, relationship.paperIds),
      supportingTheories: graph.nodes.filter((node) => node.type === "theory").slice(0, 4).map((node) => node.label),
      confidenceScore,
      evidencePathSummary: "관계는 공출현/메타데이터 기반 추론이며 인과 또는 확정적 이론 연결이 아닙니다."
    };
  });
}

function buildDecisionExplanations(params: {
  topics: Topic[];
  gaps: Gap[];
  relationships: RelationshipInsight[];
  global: GlobalAutonomousScholarlyNetwork;
  traces: VerifiableReasoningTrace[];
}): TrustedAcademicIntelligenceInfrastructure["transparentDecisions"] {
  const firstTopic = params.topics[0];
  const firstEvaluation = firstTopic ? params.global.selfEvaluationWorkflows.find((item) => item.topicTitle === firstTopic.title) : null;
  return [
    ...(firstTopic ? [{
      decisionType: "topic_ranking" as const,
      decision: firstTopic.title,
      why: `참신성 ${firstTopic.scores.novelty}, 실행가능성 ${firstTopic.scores.feasibility}, QA 품질 ${firstEvaluation?.qualityScore ?? "미계산"}를 반영했습니다.`,
      evidenceInfluence: firstTopic.evidencePaperIds,
      relatedTraceIds: params.traces.filter((trace) => trace.target === firstTopic.title).map((trace) => trace.id),
      confidence: confidenceFromScore(firstEvaluation?.qualityScore ?? firstTopic.scores.publishability)
    }] : []),
    ...params.topics.slice(0, 3).flatMap((topic) => topic.methodologyRecommendations.slice(0, 1).map((method) => ({
      decisionType: "methodology_recommendation" as const,
      decision: `${topic.title}: ${method.method}`,
      why: method.rationale,
      evidenceInfluence: topic.evidencePaperIds,
      relatedTraceIds: params.traces.filter((trace) => trace.target === topic.title).map((trace) => trace.id),
      confidence: confidenceFromScore(method.fit)
    }))),
    ...params.relationships.slice(0, 3).map((relationship) => ({
      decisionType: "theory_relationship" as const,
      decision: relationship.title,
      why: relationship.evidence,
      evidenceInfluence: relationship.paperIds,
      relatedTraceIds: params.traces.filter((trace) => trace.target === relationship.title).map((trace) => trace.id),
      confidence: relationship.confidence
    })),
    ...params.gaps.slice(0, 3).map((gap) => ({
      decisionType: "gap_detection" as const,
      decision: gap.claim,
      why: gap.evidence,
      evidenceInfluence: gap.paperIds,
      relatedTraceIds: params.traces.filter((trace) => trace.target === gap.claim).map((trace) => trace.id),
      confidence: gap.confidence
    })),
    ...params.global.advancedSignalDetection.futureHighImpactDomains.slice(0, 2).map((signal) => ({
      decisionType: "forecast_influence" as const,
      decision: signal.label,
      why: signal.generatedInterpretation,
      evidenceInfluence: signal.paperIds,
      relatedTraceIds: [],
      confidence: signal.priority === "high" ? "high" as const : signal.priority === "medium" ? "medium" as const : "low" as const
    }))
  ];
}

function buildAudits(params: {
  topics: Topic[];
  global: GlobalAutonomousScholarlyNetwork;
}): TrustedAcademicIntelligenceInfrastructure["autonomousResearchAudits"] {
  return params.topics.slice(0, 5).map((topic, index) => {
    const evaluation = params.global.selfEvaluationWorkflows.find((item) => item.topicTitle === topic.title);
    const confidence = params.global.researchQualityAssurance.evidenceConfidenceEstimates.find((item) => item.target === topic.title);
    return {
      auditId: `audit-${index + 1}`,
      target: topic.title,
      theoryCoherence: clamp(topic.coreTheory ? 7 + Math.min(2, topic.adjacentTheories.length) : 4),
      evidenceStrength: evaluation?.evidenceCoverage ?? topic.scores.dataAvailability,
      methodologyValidity: clamp(topic.methodologyRecommendations[0]?.fit ?? topic.scores.feasibility),
      noveltyJustification: topic.scores.novelty,
      interdisciplinaryPlausibility: clamp(4 + topic.adjacentTheories.length),
      publicationFeasibility: topic.scores.publishability,
      findings: [
        `근거 신뢰도 ${confidence?.confidence ?? "medium"}: ${confidence?.evidence ?? "근거 평가 부족"}`,
        ...(evaluation?.weakReasoningChains.slice(0, 2) ?? []),
        ...(evaluation?.unsupportedTheoreticalAssumptions.slice(0, 2) ?? [])
      ],
      requiredHumanChecks: [
        "원문에서 이론/변수 정의 확인",
        "측정도구와 표본 접근성 확인",
        "저널 aims & scope와 방법론 기대치 확인"
      ]
    };
  });
}

function buildHumanWorkflow(params: {
  topics: Topic[];
  audits: TrustedAcademicIntelligenceInfrastructure["autonomousResearchAudits"];
  global: GlobalAutonomousScholarlyNetwork;
}): TrustedAcademicIntelligenceInfrastructure["humanInTheLoop"] {
  return {
    feedbackIntegration: [
      "리뷰어 코멘트를 topic rationale, methodology critique, evidence confidence에 반영",
      "사용자 override는 다음 세션의 로컬 메모리/워크스페이스에 저장할 수 있는 후보로 표시",
      "거절된 제안은 unsupported claim과 methodology risk 항목으로 재학습 proxy 처리"
    ],
    expertOverrides: params.topics.slice(0, 4).map((topic) => ({
      target: topic.title,
      editableDecision: "topic priority / methodology / theory framing",
      currentRecommendation: topic.recommendedMethodology
    })),
    collaborativeReviewQueue: [
      { reviewerRole: "researcher", item: "research question", requestedAction: "주장 범위와 실무 맥락 확인" },
      { reviewerRole: "advisor", item: "theory coherence", requestedAction: "핵심 이론과 인접 이론의 역할 분리" },
      { reviewerRole: "methodologist", item: "methodology validity", requestedAction: "표본·측정·분석 설계 검토" },
      { reviewerRole: "domain_expert", item: "evidence lineage", requestedAction: "원문과 메타데이터 신호 불일치 확인" },
      { reviewerRole: "institution_admin", item: "workspace governance", requestedAction: "기관 공유 범위와 권한 확인" }
    ],
    proposalApprovalStates: params.audits.map((audit) => ({
      proposal: audit.target,
      status: audit.evidenceStrength >= 7 && audit.methodologyValidity >= 7 ? "approved_candidate" : "needs_review",
      reason: `evidence ${audit.evidenceStrength}/10, methodology ${audit.methodologyValidity}/10`
    })),
    reviewerCommentPrompts: [
      "이 연구질문이 원문 근거보다 과도하게 강한가?",
      "방법론이 변수 구조와 표본 접근성에 맞는가?",
      "출판 가능성 설명이 보장처럼 읽히지 않는가?",
      "인접 이론 연결이 탐색 후보와 핵심 주장으로 분리되어 있는가?"
    ],
    reviewBoundary: "Human-in-the-loop 기능은 리뷰 워크플로 초안입니다. 실제 계정 권한, 전자서명, 기관 IRB 승인 시스템은 구현하지 않습니다."
  };
}

function buildInfrastructure(): TrustedAcademicIntelligenceInfrastructure["scalableInfrastructure"] {
  return {
    ingestionPipelinePlan: [
      "OpenAlex incremental query snapshot 저장",
      "검색 결과 diff로 새 논문/새 개념/새 출판원 감지",
      "retracted title filter와 source metadata validation 유지"
    ],
    scheduledUpdatePlan: [
      "주간 키워드 재검색 작업으로 확장 가능",
      "변화량은 reasoning trace와 audit history에 append",
      "현재 MVP는 사용자가 실행할 때 계산하는 방식"
    ],
    institutionWorkspaceModel: [
      "project/workspace/reviewer role 분리",
      "기관 dossier export와 review queue 분리",
      "민감한 내부 성과 데이터는 저장하지 않음"
    ],
    longTermPersistencePlan: [
      "로컬 JSON memory namespace 유지",
      "추후 vector DB/graph DB로 교체 가능한 타입 경계 유지",
      "trace id와 evidence paper id를 장기 식별자로 사용"
    ],
    multiUserCollaborationModel: [
      "reviewer role 기반 코멘트 큐",
      "expert override와 approval state 기록",
      "실시간 동시편집은 현재 범위 밖"
    ],
    roleBasedEnvironments: [
      { role: "student", permissions: ["view traces", "request review", "save workspace"] },
      { role: "researcher", permissions: ["edit proposal", "override topic priority", "export dossier"] },
      { role: "advisor", permissions: ["approve candidate", "comment on theory", "request revision"] },
      { role: "lab_admin", permissions: ["view lab dashboard", "assign reviewers", "compare projects"] },
      { role: "institution_admin", permissions: ["view institution summary", "export aggregate dossier"] }
    ],
    infrastructureBoundary: "대규모 인프라는 확장 설계와 로컬 MVP 모델입니다. 실제 멀티테넌트 인증, 예약 실행 서버, 기관 SSO, 클라우드 권한 관리는 포함하지 않습니다."
  };
}

export function buildTrustedAcademicIntelligenceInfrastructure(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  gaps: Gap[];
  relationships: RelationshipInsight[];
  graph: TheoryGraph;
  debates: DebateSignal[];
  autonomousOS: AutonomousAcademicOperatingSystem;
  global: GlobalAutonomousScholarlyNetwork;
}): TrustedAcademicIntelligenceInfrastructure {
  const reasoningTraces = [
    ...buildTopicTraces({ topics: params.topics, papers: params.papers, synthesis: params.synthesis, global: params.global }),
    ...buildGapTraces(params.gaps, params.papers),
    ...buildRelationshipTraces(params.relationships, params.papers, params.graph)
  ];
  const autonomousResearchAudits = buildAudits({ topics: params.topics, global: params.global });
  return {
    trustedRunId: `trusted-${Date.now()}`,
    reasoningTraces,
    evidenceLineageViews: reasoningTraces.filter((trace) => trace.supportingPapers.length > 0),
    governanceReliability: {
      hallucinationDetection: params.global.researchQualityAssurance.hallucinationRiskFlags,
      unsupportedClaimDetection: params.global.researchQualityAssurance.unsupportedClaimChecks,
      citationConsistencyValidation: params.global.researchQualityAssurance.citationConsistencyChecks,
      methodologyPlausibilityChecks: params.global.researchQualityAssurance.methodologicalPlausibilityValidation,
      contradictionAwareness: params.debates.length > 0
        ? params.debates.slice(0, 6).map((debate) => `${debate.claim}: ${debate.evidence}`)
        : ["명시적 contradiction/debate 신호가 부족합니다. 원문 검토에서 결과 방향을 확인하세요."],
      outputConfidenceScores: params.global.researchQualityAssurance.evidenceConfidenceEstimates,
      governanceBoundary: params.global.researchQualityAssurance.qaBoundary
    },
    transparentDecisions: buildDecisionExplanations({
      topics: params.topics,
      gaps: params.gaps,
      relationships: params.relationships,
      global: params.global,
      traces: reasoningTraces
    }),
    autonomousResearchAudits,
    humanInTheLoop: buildHumanWorkflow({ topics: params.topics, audits: autonomousResearchAudits, global: params.global }),
    scalableInfrastructure: buildInfrastructure(),
    trustBoundary: "Trusted infrastructure는 evidence id, reasoning trace, QA 휴리스틱, human review queue를 연결한 검증 보조 레이어입니다. 원문 전문 감사, 실제 기관 권한 관리, 자동 승인, 예측 정확도 보장을 수행하지 않습니다."
  };
}
