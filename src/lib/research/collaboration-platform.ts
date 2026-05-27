import type {
  AcademicResearchOS,
  BibliometricAnalysis,
  Discipline,
  FullAutonomousScholarlyCollaborationPlatform,
  FullResearchWorkflowCopilot,
  Methodology,
  PublicationIntelligence,
  RetrievedPaper,
  SimulatedPeerReview,
  Topic,
  TrustedAcademicIntelligenceInfrastructure
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";

function topTopic(topics: Topic[]): Topic | null {
  return topics[0] ?? null;
}

function topPapers(papers: RetrievedPaper[], limit = 4): RetrievedPaper[] {
  return [...papers].sort((a, b) => b.citedByCount - a.citedByCount || (b.year ?? 0) - (a.year ?? 0)).slice(0, limit);
}

function reviewReadiness(topic: Topic | null, audit: TrustedAcademicIntelligenceInfrastructure["autonomousResearchAudits"][number] | undefined): number {
  if (!topic) return 3;
  const auditScore = audit ? (audit.evidenceStrength + audit.methodologyValidity + audit.publicationFeasibility) / 3 : 5;
  return Math.max(1, Math.min(10, Math.round((topic.scores.publishability + topic.scores.feasibility + auditScore) / 3)));
}

function buildPeerReviews(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  trusted: TrustedAcademicIntelligenceInfrastructure;
  methodology: Methodology;
  publication: PublicationIntelligence;
}): SimulatedPeerReview[] {
  const papers = topPapers(params.papers, 3);
  const venue = params.publication.journals[0] ?? params.publication.conferences[0];
  return params.topics.slice(0, 3).flatMap((topic, index) => {
    const audit = params.trusted.autonomousResearchAudits.find((item) => item.target === topic.title) ?? params.trusted.autonomousResearchAudits[index];
    const baseEvidence = topic.evidencePaperIds.length ? topic.evidencePaperIds : papers.map((paper) => paper.id);
    const shared = {
      targetTitle: topic.title,
      evidencePaperIds: baseEvidence,
      unsupportedClaims: params.trusted.governanceReliability.unsupportedClaimDetection.slice(0, 3),
      publicationReadinessScore: reviewReadiness(topic, audit),
      simulationBoundary: "AI 피어리뷰 시뮬레이션입니다. 실제 심사자 의견, 게재 판단, 저널 공식 기준을 대체하지 않습니다."
    };
    return [
      {
        ...shared,
        reviewerMode: "harsh" as const,
        journalStyle: "strict methodology-first review",
        methodologyRigorCritique: [
          `${methodologyLabels[params.methodology]} 설계가 주장 범위와 맞는지 식별전략/표본/측정 타당도를 더 방어해야 합니다.`,
          audit ? `감사 점수 기준 방법론 타당도 ${audit.methodologyValidity}/10입니다. 낮은 항목은 제한점으로 먼저 인정하세요.` : "방법론 감사 근거가 제한되어 보수적 검토가 필요합니다."
        ],
        weakArguments: [
          "이론 연결이 토픽 생성 문장에만 머물면 기여가 약해 보입니다.",
          "실무적 함의가 자료 수집 가능성과 분리되어 있으면 심사자가 과장으로 볼 수 있습니다."
        ],
        noveltyContributionAssessment: `참신성 ${topic.scores.novelty}/10, 포화도 ${topic.scores.saturation}/10입니다. 새로움은 검색 근거 내 상대적 신호이며 분야 전체 새로움은 보장하지 않습니다.`,
        reviewerStyleFeedback: [
          "Major concern: 핵심 변수의 조작적 정의와 측정 근거를 더 명확히 제시해야 합니다.",
          "Major concern: 현재 초안은 인과 주장처럼 읽힐 위험이 있으므로 설계 한계를 더 직접적으로 써야 합니다.",
          "Minor concern: 제목과 연구질문에서 연구 맥락을 좁히면 독자가 기여를 더 빨리 이해할 수 있습니다."
        ],
        revisionStrategies: [
          "주장마다 근거 논문 ID 또는 측정/방법론 근거를 붙입니다.",
          "분석 전 가설, 변수, 제외 기준, 재현성 체크리스트를 표로 제시합니다.",
          "기여 문단을 이론, 방법론, 실무 기여로 분리합니다."
        ]
      },
      {
        ...shared,
        reviewerMode: "constructive" as const,
        journalStyle: "developmental reviewer",
        methodologyRigorCritique: [
          "현재 방법론 방향은 실행 가능하지만, 파일럿·신뢰도·타당도 점검 절차를 추가하면 설득력이 올라갑니다.",
          "데이터 접근성과 윤리 검토를 방법 섹션 초반에 배치하면 연구 실행성이 분명해집니다."
        ],
        weakArguments: [
          "문헌 갭을 단정하기보다 이번 검색 집합에서 관찰된 약한 연결로 표현하세요.",
          "매개/조절 변수를 하나로 좁혀 연구 범위를 관리하면 초안이 더 단단해집니다."
        ],
        noveltyContributionAssessment: `기여는 ${topic.coreTheory}와 ${topic.adjacentTheories.slice(0, 2).join(", ") || "인접 이론"}의 연결을 조심스럽게 명시할 때 가장 강합니다.`,
        reviewerStyleFeedback: [
          "이 논문은 교육 맥락과 AI 사용 경험을 연결하는 잠재력이 있습니다.",
          "연구질문을 한 문장 더 좁히고, 데이터 수집 계획을 구체화하면 투고 전 단계로 발전할 수 있습니다.",
          "한계 문단에 횡단면/자기보고/표본 편향 위험을 먼저 쓰면 신뢰도가 올라갑니다."
        ],
        revisionStrategies: [
          "초록 마지막 문장에 예상 기여를 한 가지로 압축합니다.",
          "방법 섹션에 파일럿 테스트와 누락자료 처리 계획을 추가합니다.",
          "심사자 응답표를 만들어 각 수정 사항과 원고 위치를 연결합니다."
        ]
      },
      {
        ...shared,
        reviewerMode: "journal_specific" as const,
        journalStyle: venue?.name ?? "retrieved venue style proxy unavailable",
        methodologyRigorCritique: [
          venue ? `${venue.name}는 이번 검색 결과에 실제 출처명으로 등장했습니다. 다만 aims & scope와 공식 심사 기준은 별도 확인이 필요합니다.` : "검색된 출판원 후보가 제한적이므로 저널별 문체 최적화는 보수적으로만 제안합니다.",
          `방법론 적합도 프록시: ${venue?.methodologyFit ?? "n/a"}. 이는 OpenAlex 검색 집합 기반 점수입니다.`
        ],
        weakArguments: [
          "대상 저널 독자에게 왜 이 연구가 지금 필요한지 첫 두 문단 안에서 설명해야 합니다.",
          "관련 분야를 너무 넓게 열거하면 저널 적합성이 흐려질 수 있습니다."
        ],
        noveltyContributionAssessment: venue ? `주제 적합도 프록시 ${venue.topicFit}/10입니다. 저널 공식 기준이 아니라 검색 결과 내 출처명 기반 추천입니다.` : "저널별 참신성 평가는 출처 후보 부족으로 낮은 신뢰도입니다.",
        reviewerStyleFeedback: [
          "Target fit note: 검색된 출처의 주제·방법론 흔적과 맞추되, 공식 투고 규정 확인 전에는 적합하다고 단정하지 마세요.",
          "Contribution note: 독자층에 맞춰 교육 실천, AI 시스템 설계, 자기효능감 이론 중 하나를 우선순위로 세우세요."
        ],
        revisionStrategies: [
          "대상 저널의 최근 논문 구조를 사람이 직접 확인한 뒤 섹션 순서를 맞춥니다.",
          "커버레터에는 검색 근거 기반 적합성만 쓰고 게재 가능성 보장은 쓰지 않습니다."
        ]
      }
    ];
  });
}

export function buildScholarlyCollaborationPlatform(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  publication: PublicationIntelligence;
  bibliometric: BibliometricAnalysis;
  trusted: TrustedAcademicIntelligenceInfrastructure;
  workflow: FullResearchWorkflowCopilot;
  academicOS: AcademicResearchOS;
  discipline: Discipline;
  methodology: Methodology;
}): FullAutonomousScholarlyCollaborationPlatform {
  const topic = topTopic(params.topics);
  const venues = [...params.publication.journals, ...params.publication.conferences].slice(0, 3);
  const influentialPapers = topPapers(params.papers);
  const primaryVenue = venues[0];

  return {
    collaborationRunId: `scholarly-collaboration-${Date.now()}`,
    peerReviewSimulations: buildPeerReviews({
      topics: params.topics,
      papers: params.papers,
      trusted: params.trusted,
      methodology: params.methodology,
      publication: params.publication
    }),
    publicationOptimization: venues.map((venue) => ({
      targetVenue: venue.name,
      venueEvidence: `${venue.name}은 검색된 OpenAlex 출처명에서 나온 후보입니다. 분류는 ${venue.classificationEvidence}`,
      formattingStyleExpectations: ["공식 author guideline 확인", "초록/키워드/참고문헌 형식 수동 검토", "표·그림·부록 요구사항 확인"],
      methodologicalAlignment: [
        `${methodologyLabels[params.methodology]} 방법론 적합도 프록시 ${venue.methodologyFit}/10`,
        "연구 설계와 데이터 한계를 methods와 limitations에 동시에 명시"
      ],
      contributionFraming: topic ? [topic.academicContribution, topic.practicalContribution, topic.expectedContribution] : ["검색 근거 기반 기여 문장 필요"],
      noveltyPositioning: topic ? [`참신성 ${topic.scores.novelty}/10은 현재 검색 집합의 상대 점수입니다.`, topic.inferenceNotice] : ["토픽 부족으로 참신성 위치 설정 불가"],
      interdisciplinaryRelevance: params.bibliometric.topicEvolution.slice(0, 3).map((item) => `${item.label}: ${item.trajectory}`),
      reviewerExpectationAlignment: params.trusted.humanInTheLoop.reviewerCommentPrompts.slice(0, 4),
      optimizationBoundary: "출판 최적화는 검색 출처와 휴리스틱 정렬입니다. 저널 공식 기준, 심사 결과, 게재 가능성을 보장하지 않습니다."
    })),
    collaborativeWorkspace: {
      projectRoles: [
        { role: "student", permissions: ["draft proposal", "add annotations", "request supervisor review"] },
        { role: "supervisor", permissions: ["approve milestones", "comment on arguments", "request revision"] },
        { role: "coauthor", permissions: ["edit manuscript sections", "compare versions", "respond to assigned comments"] },
        { role: "methodologist", permissions: ["review analysis plan", "flag validity risks", "approve reproducibility checklist"] },
        { role: "librarian", permissions: ["curate Zotero collections", "check citation metadata", "support search strategy"] }
      ],
      sharedLiteratureMaps: params.academicOS.literatureWorkspace.paperClusters.slice(0, 4).map((cluster) => `${cluster.label}: ${cluster.paperCount} papers`),
      collaborativeAnnotations: params.academicOS.literatureWorkspace.annotations.slice(0, 5).map((item) => `${item.title}: ${item.annotation}`),
      proposalCoEditingPlan: ["lock evidence table before writing claims", "assign intro/theory/method sections", "track unresolved comments", "require supervisor approval before submission"],
      versionComparison: [
        { version: "v0 topic brief", changeSummary: "initial topic and evidence links", reviewStatus: "draft" },
        { version: "v1 proposal", changeSummary: "adds theory, methods, and contribution framing", reviewStatus: "needs_review" },
        { version: "v2 manuscript plan", changeSummary: "adds reviewer simulation and reproducibility checklist", reviewStatus: "ready_for_supervisor" }
      ],
      supervisorStudentWorkflow: ["student drafts claim", "system links evidence", "supervisor marks unsupported claims", "student revises scope", "methodologist checks design", "submission readiness review"],
      collaborationBoundary: "협업 워크스페이스는 로컬 계획 모델입니다. 실제 다중 사용자 인증, 권한 집행, 비공개 문서 동기화는 수행하지 않습니다."
    },
    revisionIntelligence: {
      revisionSuggestions: params.trusted.autonomousResearchAudits.slice(0, 4).flatMap((audit) => audit.findings.slice(0, 1)),
      clarityImprovements: ["연구질문을 하나의 주요 결과변수 중심으로 다시 쓰기", "문헌 갭을 검색 집합 내 관찰로 표현하기", "이론·방법·실무 기여를 별도 문단으로 분리하기"],
      academicToneRefinements: ["단정형 표현을 evidence suggests / this study examines로 완화", "출판 가능성 대신 submission readiness로 표현", "예측 표현에는 휴리스틱 한계를 붙이기"],
      contributionStrengthening: topic ? [topic.academicContribution, topic.practicalContribution, "방법론적 기여는 검증 전 계획 수준으로만 표현"] : ["대표 토픽 부족"],
      reviewerResponseDrafts: ["We thank the reviewer for this point and have clarified the construct definition in the revised theory section.", "We narrowed the claim to the retrieved evidence set and added a limitation note.", "We added a reproducibility checklist and data preprocessing plan."],
      rebuttalLetterDraft: "This draft response is AI-generated planning text. It should be edited by the authors after real reviewer comments are received; no real peer-review authority is implied.",
      publicationCoverLetterDraft: primaryVenue ? `Dear Editor, this manuscript is being considered for ${primaryVenue.name} because the retrieved literature set shows topic overlap. The authors must verify aims and scope before submission.` : "Cover letter draft requires a verified target venue selected by the authors.",
      writingBoundary: "수정·답변·커버레터 초안은 실제 심사 의견이 아닌 생성 템플릿입니다. 저자 검토 없이 제출용 문서로 사용하면 안 됩니다."
    },
    lifecycleManagement: {
      stages: [
        { stage: "topic_ideation", status: params.topics.length ? "ready" : "not_started", milestone: "topic candidates generated", evidence: `${params.topics.length} topics` },
        { stage: "proposal_evolution", status: "in_progress", milestone: "proposal draft and conceptual framework", evidence: params.academicOS.proposalDraft.evidenceBoundary },
        { stage: "literature_review", status: params.papers.length ? "in_progress" : "not_started", milestone: "literature map and annotations", evidence: `${params.papers.length} retrieved papers` },
        { stage: "data_collection", status: "needs_review", milestone: "instrument and ethics review", evidence: params.workflow.instrumentPackage.instrumentBoundary },
        { stage: "analysis", status: "needs_review", milestone: "analysis scripts and reproducibility checks", evidence: params.workflow.statisticalWorkflow.workflowBoundary },
        { stage: "manuscript_drafting", status: "in_progress", milestone: "writing outline and revision plan", evidence: params.workflow.academicWritingWorkflow.writingBoundary },
        { stage: "submission_revision", status: "needs_review", milestone: "target venue and simulated review", evidence: params.publication.warnings.join(" ") || "venue warnings unavailable" }
      ],
      timelineSummary: [...params.workflow.executionPlan.milestoneSchedule.slice(0, 6), "peer-review simulation", "supervisor approval", "submission package"],
      lifecycleBoundary: "라이프사이클 관리는 진행 상태 계획입니다. 실제 IRB, 데이터 수집, 분석 완료, 투고 접수 상태를 외부 시스템에서 확인하지 않습니다."
    },
    benchmarkingIntelligence: {
      topPaperComparisons: influentialPapers.map((paper) => ({
        retrievedPaperTitle: paper.title,
        comparisonSignal: `${paper.citedByCount} citations, ${paper.year ?? "n.d."}, ${paper.source}`,
        evidence: `검색된 OpenAlex 결과의 인용 수와 출처명입니다. 우수 논문이라는 질적 판단은 별도 원문 검토가 필요합니다.`
      })),
      journalStandardProxies: venues.map((venue) => `${venue.name}: topic fit ${venue.topicFit}/10, methodology fit ${venue.methodologyFit}/10, classification ${venue.classification}`),
      methodologicalNorms: [
        `${disciplineLabels[params.discipline]} 분야 경향: ${methodologyLabels[params.methodology]} 설계는 측정·표본·윤리·재현성 근거가 필요합니다.`,
        ...params.workflow.statisticalWorkflow.reliabilityValidityChecks.slice(0, 4)
      ],
      citationExpectationSignals: params.bibliometric.publicationTrends.slice(-4).map((point) => `${point.year}: ${point.paperCount} papers, ${point.totalCitations} citations in retrieved set`),
      contributionDepthAssessment: topic ? [`theoretical: ${topic.academicContribution}`, `practical: ${topic.practicalContribution}`, `risk: ${topic.risksLimitations.slice(0, 2).join(" ")}`] : ["토픽 부족"],
      interdisciplinaryCompetitiveness: params.bibliometric.topicEvolution.slice(0, 4).map((item) => `${item.label}: ${item.trajectory}, recent ${item.recentCount}`),
      benchmarkBoundary: "벤치마킹은 검색된 논문·출처·인용 메타데이터 기반 비교입니다. 저널 공식 기준, 분야 전체 상위 논문, 실제 인용 기대치를 만들지 않습니다."
    },
    workflowConnectivity: {
      zotero: ["read-only library sync", "citation metadata check", "reading queue handoff"],
      overleaf: ["export manuscript outline", "manual references.bib upload", "revision response table"],
      notion: ["lifecycle kanban", "review comment database", "meeting note tracker"],
      github: ["version controlled analysis scripts", "issue-based revision tracking", "no secrets committed"],
      googleDocs: ["collaborative manuscript drafting plan", "comment resolution workflow", "manual access control required"],
      jupyterQuarto: ["analysis notebook skeleton", "Quarto reproducibility appendix", "rendered supplement review"],
      csvExcel: ["data dictionary workbook", "coding matrix", "milestone tracker export"],
      connectivityBoundary: "연동은 안전한 워크플로 계획입니다. 외부 계정 쓰기, 비공개 파일 전송, API 키 저장은 수행하지 않습니다."
    },
    platformBoundary: `Full Autonomous Scholarly Collaboration & Publication Platform은 ${params.papers.length}개 검색 근거와 기존 RIS 산출물 위에 협업·심사·출판 준비 워크플로를 구성합니다. 실제 심사자 권위, 공식 저널 기준, 게재 보장, 비공개 협업 데이터 처리는 제공하지 않습니다.`
  };
}
