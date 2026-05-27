import type {
  AcademicResearchOS,
  BibliometricAnalysis,
  CitationIntelligence,
  ConceptualFramework,
  DebateSignal,
  Discipline,
  Gap,
  LiteratureReviewDraft,
  LiteratureWorkspaceItem,
  Methodology,
  PublicationIntelligence,
  ResearchCompetitionIntelligence,
  ResearchStrategy,
  RetrievedPaper,
  Synthesis,
  Topic
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";
import { strategyLabels } from "./strategy";

function paperTitle(papers: RetrievedPaper[], id: string): string {
  return papers.find((paper) => paper.id === id)?.title ?? id;
}

function topPaperTitles(papers: RetrievedPaper[], ids: string[], limit = 3): string[] {
  return ids.map((id) => paperTitle(papers, id)).slice(0, limit);
}

function primaryTopic(topics: Topic[]): Topic | null {
  return topics[0] ?? null;
}

function buildProposalDraft(
  topics: Topic[],
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  literatureReview: LiteratureReviewDraft,
  discipline: Discipline,
  methodology: Methodology,
  strategy: ResearchStrategy
) {
  const topic = primaryTopic(topics);
  const title = topic?.title ?? `${disciplineLabels[discipline]} 연구 제안서`;
  const rq = topic?.researchQuestion ?? "검색된 근거에 기반한 연구문제를 추가 정교화해야 합니다.";
  const evidenceTitles = topPaperTitles(papers, topic?.evidencePaperIds ?? papers.slice(0, 3).map((paper) => paper.id));

  return {
    title,
    abstract: `${disciplineLabels[discipline]} 맥락에서 ${synthesis.theories[0]?.label ?? "핵심 이론"}와 ${synthesis.trends[0]?.label ?? "주요 개념"}의 관계를 탐색하는 제안서 초안입니다. 연구는 ${methodologyLabels[methodology]}를 중심으로 설계되며, ${strategyLabels[strategy]} 전략에 맞춰 범위와 기여를 조정합니다. 이 초록은 OpenAlex 검색 근거와 생성 추론을 분리해 작성된 초안입니다.`,
    introduction: `최근 검색 문헌은 ${synthesis.trends.slice(0, 3).map((item) => item.label).join(", ") || "관련 주제"}가 반복적으로 등장함을 보여줍니다. 본 연구는 이 신호를 출발점으로 이론적 설명과 실증 설계를 연결합니다.`,
    problemStatement: topic?.rationale ?? "검색 문헌은 연구 가능성을 보여주지만, 확정적 문제 진술은 원문 검토 후 보강해야 합니다.",
    researchObjectives: [
      `${synthesis.theories[0]?.label ?? "핵심 이론"} 기반 설명 구조를 정리한다.`,
      `${methodologyLabels[methodology]} 설계로 검증 가능한 변수 관계를 구성한다.`,
      "검색된 문헌 근거와 생성 추론을 분리해 후속 연구계획을 명확히 한다."
    ],
    researchQuestions: topic?.researchPlan.researchQuestions.length ? topic.researchPlan.researchQuestions : [rq],
    hypothesesPropositions: topic?.hypotheses ?? [],
    theoreticalFramework: topic
      ? `${topic.coreTheory}를 중심 이론으로 두고 ${topic.adjacentTheories.slice(0, 3).join(", ") || "인접 이론"}을 보조 프레임워크로 검토합니다.`
      : "핵심 이론 프레임워크는 추가 검토가 필요합니다.",
    literatureSynthesis: literatureReview.theorySynthesis.generatedNarrative,
    methodologyPlan: topic
      ? `${methodologyLabels[methodology]}를 사용합니다. 권장 표본은 ${topic.researchDesignGuidance.recommendedSampleType || "추가 검토 필요"}이며, 분석 계획은 ${topic.researchDesignGuidance.suggestedAnalysisMethod}입니다.`
      : `${methodologyLabels[methodology]} 기반 계획을 추가 정교화해야 합니다.`,
    expectedContribution: topic?.expectedContribution ?? "이론적·실무적 기여는 원문 검토 후 보강해야 합니다.",
    limitations: topic?.risksLimitations ?? ["OpenAlex 메타데이터 기반 초안이므로 원문 검토가 필요합니다."],
    futureWorkDirections: topic?.researchPlan.futureExpansionDirections.length ? topic.researchPlan.futureExpansionDirections : literatureReview.futureResearchDirections.generatedNarrative.split(".").filter(Boolean).slice(0, 3),
    evidenceBoundary: `근거 문헌 예: ${evidenceTitles.join(" / ") || "명시 근거 부족"}. 본 제안서는 검색 근거 기반 생성 초안이며 논문·인용을 새로 만들지 않습니다.`
  };
}

function buildConceptualFramework(topics: Topic[]): ConceptualFramework {
  const topic = primaryTopic(topics);
  const core = topic?.coreTheory ?? "Core theory";
  const variables = topic?.variables ?? [];
  const dependent = variables.at(-1) ?? "Research outcome";
  const mediator = topic?.mediatorsModerators[0] ?? variables[1] ?? "Mediator candidate";
  const context = variables[2] ?? "Context";
  const nodes = [
    { id: "theory", label: core, type: "theory" as const },
    { id: "independent", label: variables[0] ?? core, type: "independent" as const },
    { id: "mediator", label: mediator, type: "mediator" as const },
    { id: "dependent", label: dependent, type: "dependent" as const },
    { id: "context", label: context, type: "context" as const }
  ];
  const edges = [
    { source: "theory", target: "independent", label: "grounds", explanation: "핵심 이론이 독립변수의 개념적 의미를 제공합니다." },
    { source: "independent", target: "mediator", label: "influences", explanation: "검색 신호 기반의 매개 경로 후보입니다." },
    { source: "mediator", target: "dependent", label: "explains", explanation: "매개 후보가 결과변수 설명을 도울 수 있습니다." },
    { source: "context", target: "dependent", label: "contextualizes", explanation: "분야/맥락 요인이 결과 해석을 제한하거나 확장합니다." }
  ];
  return {
    modelTitle: topic ? `${topic.coreTheory} 기반 개념 프레임워크` : "개념 프레임워크 초안",
    nodes,
    edges,
    mediatorModeratorSuggestions: topic?.mediatorsModerators.length ? topic.mediatorsModerators : [mediator],
    theoryIntegrationDiagram: edges.map((edge) => `${nodes.find((node) => node.id === edge.source)?.label} -> ${nodes.find((node) => node.id === edge.target)?.label}`).join("\n"),
    causalPathwayExplanation: "이 경로는 인과관계 확정이 아니라 연구설계를 위한 가설적 설명 구조입니다. 인과 설계는 실험, 종단, 준실험 등 별도 식별전략이 필요합니다.",
    evidenceBoundary: "변수 관계는 토픽 생성 결과와 검색 신호에서 도출된 개념적 제안이며, 실제 효과 방향은 원문과 데이터로 검증해야 합니다."
  };
}

function evidenceStrength(paper: RetrievedPaper): "low" | "medium" | "high" {
  if (paper.citedByCount >= 50) return "high";
  if (paper.citedByCount >= 10) return "medium";
  return "low";
}

function buildLiteratureWorkspace(
  papers: RetrievedPaper[],
  citation: CitationIntelligence,
  synthesis: Synthesis,
  debates: DebateSignal[]
) {
  const annotations: LiteratureWorkspaceItem[] = papers.slice(0, 10).map((paper) => {
    const debate = debates.find((item) => item.paperIds.includes(paper.id));
    return {
      paperId: paper.id,
      title: paper.title,
      cluster: citation.researchClusters.find((cluster) => cluster.paperIds.includes(paper.id))?.label ?? paper.concepts[0] ?? "Unclustered",
      theme: synthesis.trends.find((trend) => trend.paperIds.includes(paper.id))?.label ?? paper.concepts[0] ?? "General theme",
      annotation: `인용 ${paper.citedByCount}회, 출판원 ${paper.source}. 제목/초록/개념 기준으로 문헌고찰 후보에 포함됩니다.`,
      contradictionTag: debate ? debate.type === "methodological_disagreement" ? "methodological tension" : "possible contradiction" : "none",
      evidenceStrength: evidenceStrength(paper)
    };
  });
  return {
    annotations,
    paperClusters: citation.researchClusters,
    thematicCategories: synthesis.trends,
    contradictionTags: debates,
    evidenceStrengthSummary: `상위 ${annotations.length}편 중 high ${annotations.filter((item) => item.evidenceStrength === "high").length}편, medium ${annotations.filter((item) => item.evidenceStrength === "medium").length}편, low ${annotations.filter((item) => item.evidenceStrength === "low").length}편입니다. 인용 수 기반 상대 신호입니다.`,
    draftingWorkspaceMarkdown: annotations.map((item) => `- [${item.evidenceStrength}] ${item.title}: ${item.annotation}`).join("\n")
  };
}

export function buildAcademicResearchOS(
  topics: Topic[],
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  literatureReview: LiteratureReviewDraft,
  citation: CitationIntelligence,
  debates: DebateSignal[],
  gaps: Gap[],
  bibliometric: BibliometricAnalysis,
  publication: PublicationIntelligence,
  competition: ResearchCompetitionIntelligence,
  discipline: Discipline,
  methodology: Methodology,
  strategy: ResearchStrategy
): AcademicResearchOS {
  const topic = primaryTopic(topics);
  const proposalDraft = buildProposalDraft(topics, papers, synthesis, literatureReview, discipline, methodology, strategy);
  const conceptualFramework = buildConceptualFramework(topics);
  const literatureWorkspace = buildLiteratureWorkspace(papers, citation, synthesis, debates);
  return {
    proposalDraft,
    conceptualFramework,
    reasoningWorkflow: {
      theoryComparison: [
        `핵심 이론 ${topic?.coreTheory ?? synthesis.theories[0]?.label ?? "명시 신호 부족"}와 인접 이론 ${topic?.adjacentTheories.slice(0, 3).join(", ") || "명시 신호 부족"}를 비교합니다.`,
        ...synthesis.theories.slice(0, 3).map((item) => `${item.label}: 검색 문헌 ${item.support}편에서 감지.`)
      ],
      methodologyTradeoffs: [
        `${methodologyLabels[methodology]}는 선택 방법론입니다. 실행 가능성 ${topic?.scores.feasibility ?? "?"}/10, 자료 확보성 ${topic?.scores.dataAvailability ?? "?"}/10.`,
        "인과 설계는 설명력이 강하지만 데이터/식별전략 부담이 크고, 탐색 설계는 빠르지만 일반화가 제한됩니다."
      ],
      designSelection: topic?.methodologyRecommendations[0]?.rationale ?? `${methodologyLabels[methodology]} 선택 근거는 추가 검토가 필요합니다.`,
      publicationStrategyReasoning: publication.publishabilityReasoning,
      interdisciplinarySynthesis: gaps.slice(0, 3).map((gap) => `${gap.claim} ${gap.evidence}`)
    },
    refinementActions: [
      {
        action: "improve_weak_topic",
        title: "약한 토픽 보강",
        recommendation: "근거 문헌이 적은 연결은 연구문제를 좁히고 핵심 변수 2-3개로 시작하세요.",
        rationale: "약한 연결은 참신하지만 심사자가 선행연구 부족을 지적할 수 있습니다.",
        evidence: gaps[0]?.evidence ?? "갭 신호 부족"
      },
      {
        action: "reduce_oversaturation",
        title: "과포화 완화",
        recommendation: `${competition.oversaturatedTopics[0]?.label ?? "반복 주제"}는 맥락, 표본, 방법론 차별화로 범위를 좁히세요.`,
        rationale: "반복 빈도가 높은 주제는 기여 차별화가 중요합니다.",
        evidence: competition.oversaturatedTopics[0]?.evidence ?? bibliometric.saturation.evidence
      },
      {
        action: "increase_publishability",
        title: "출판 가능성 개선",
        recommendation: "검색 결과에 실제 등장한 출판원 범위와 방법론 기대치를 맞추고, 데이터 접근 계획을 먼저 명시하세요.",
        rationale: "게재 가능성은 보장할 수 없지만 범위와 방법론 정합성은 개선할 수 있습니다.",
        evidence: publication.publishabilityReasoning.join(" ")
      },
      {
        action: "improve_novelty",
        title: "참신성 강화",
        recommendation: "부상 개념 또는 약한 이론 연결을 하나만 선택해 명확한 기여문장으로 전환하세요.",
        rationale: "참신성은 넓은 범위보다 선명한 교차점에서 설득력이 높습니다.",
        evidence: synthesis.emergingTopics[0]?.label ?? "부상 주제 명시 신호 부족"
      },
      {
        action: "simplify_scope",
        title: "과도한 야심 축소",
        recommendation: "첫 논문은 단일 표본, 단일 방법론, 하나의 매개/조절 구조로 제한하세요.",
        rationale: "복잡한 모델은 표본 수와 측정 타당도 부담을 키웁니다.",
        evidence: topic?.researchDesignGuidance.estimatedSampleSizeGuidance ?? "표본 지침 부족"
      },
      {
        action: "follow_up_chain",
        title: "후속 연구 체인",
        recommendation: "문헌지도 논문 → 실증 검증 논문 → 맥락 비교 논문 순서로 확장하세요.",
        rationale: "장기 아젠다를 단계화하면 학위논문과 다편 논문 전략을 함께 설계할 수 있습니다.",
        evidence: topic?.researchPlan.futureExpansionDirections.join(" ") || "후속 방향 부족"
      }
    ],
    literatureWorkspace,
    writingIntelligence: {
      academicToneRewrite: proposalDraft.abstract.replace("초안입니다", "연구 제안으로 구성된다").replace("보여줍니다", "시사한다"),
      contributionStatements: [
        topic?.academicContribution ?? "검색 근거 기반의 학술적 기여를 추가 정교화해야 합니다.",
        `${topic?.coreTheory ?? "핵심 이론"}와 ${topic?.adjacentTheories[0] ?? "인접 프레임워크"}의 통합 가능성을 검토합니다.`
      ],
      significanceStatements: [
        `${disciplineLabels[discipline]} 맥락에서 실무적 의사결정과 이론적 설명을 연결할 수 있습니다.`,
        "검색 근거와 생성 추론을 분리해 검토 가능한 연구계획으로 전환합니다."
      ],
      discussionSuggestions: [
        "결과 해석 시 메타데이터 기반 선행연구 신호와 실제 원문 분석의 차이를 명시하세요.",
        "예상과 다른 결과가 나올 경우 측정도구, 맥락, 표본 차이를 논의하세요."
      ],
      futureResearchSuggestions: proposalDraft.futureWorkDirections
    },
    workflowAutomation: {
      thesisDissertationPlan: [
        { title: "1장 문제제기", rationale: proposalDraft.problemStatement, evidence: proposalDraft.evidenceBoundary, paperIds: topic?.evidencePaperIds ?? [] },
        { title: "2장 문헌고찰", rationale: proposalDraft.literatureSynthesis, evidence: literatureWorkspace.evidenceStrengthSummary, paperIds: literatureWorkspace.annotations.map((item) => item.paperId) },
        { title: "3장 연구방법", rationale: proposalDraft.methodologyPlan, evidence: topic?.researchDesignGuidance.estimatedSampleSizeGuidance ?? "표본 지침 부족", paperIds: topic?.evidencePaperIds ?? [] }
      ],
      conferencePaperPlan: [
        { title: "짧은 문제-방법-결과 예상 구조", rationale: "학회 논문은 하나의 명확한 연구문제와 실행 가능한 데이터 계획에 집중합니다.", evidence: strategyLabels[strategy], paperIds: topic?.evidencePaperIds ?? [] }
      ],
      journalTargetingPlan: publication.journals.slice(0, 3).map((journal) => ({
        title: journal.name,
        rationale: journal.publishabilityReasoning,
        evidence: journal.impactTrendEstimate,
        paperIds: journal.evidencePaperIds
      })),
      multiPaperAgendaConstruction: [
        { title: "Paper 1: Literature map", rationale: "문헌지도와 이론 통합을 먼저 정리합니다.", evidence: literatureReview.theorySynthesis.inferredSynthesis, paperIds: topic?.evidencePaperIds ?? [] },
        { title: "Paper 2: Empirical test", rationale: "개념 프레임워크를 데이터로 검증합니다.", evidence: proposalDraft.methodologyPlan, paperIds: topic?.evidencePaperIds ?? [] },
        { title: "Paper 3: Extension study", rationale: "다른 표본/맥락/방법론으로 확장합니다.", evidence: proposalDraft.futureWorkDirections.join(" "), paperIds: topic?.evidencePaperIds ?? [] }
      ],
      longTermStrategy: [
        { title: `${strategyLabels[strategy]} 장기 전략`, rationale: "전략 모드에 맞춰 novelty, feasibility, publication fit을 순차 조정합니다.", evidence: proposalDraft.evidenceBoundary, paperIds: topic?.evidencePaperIds ?? [] }
      ]
    }
  };
}
