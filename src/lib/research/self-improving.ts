import type {
  AcademicResearchOS,
  AdvancedScholarlyKnowledgeGraph,
  AIResearchMentor,
  AuthorInfluence,
  BibliometricAnalysis,
  CareerStage,
  CollaborationEdge,
  ContinuousResearchIntelligence,
  Discipline,
  EvidenceItem,
  Gap,
  IntelligentResearchEvaluation,
  InterdisciplinaryBridge,
  Methodology,
  ResearchCompetitionIntelligence,
  ResearcherProfile,
  ResearchEvaluationScore,
  ResearchForecast,
  ResearchRoadmap,
  ResearchScenario,
  ResearchSimulationAnalysis,
  ResearchStrategy,
  RetrievedPaper,
  SelfImprovingAcademicIntelligence,
  Synthesis,
  TheoryGraph,
  Topic,
  TrendAnalysis
} from "./types";
import { methodologies } from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";
import { strategyLabels } from "./strategy";

export const defaultResearcherProfile: ResearcherProfile = {
  interests: [],
  preferredMethodologies: [],
  publicationGoals: [],
  targetVenues: [],
  theoreticalOrientation: "balanced theory and practice",
  noveltyTolerance: "medium",
  careerStage: "student"
};

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeMethod(value: string): Methodology | null {
  const found = methodologies.find((method) => method.toLowerCase() === value.trim().toLowerCase());
  return found ?? null;
}

export function normalizeResearcherProfile(profile?: Partial<ResearcherProfile>): ResearcherProfile {
  return {
    interests: unique(profile?.interests ?? []),
    preferredMethodologies: unique((profile?.preferredMethodologies ?? []).map(String))
      .map(normalizeMethod)
      .filter((method): method is Methodology => Boolean(method))
      .slice(0, 6),
    publicationGoals: unique(profile?.publicationGoals ?? []),
    targetVenues: unique(profile?.targetVenues ?? []),
    theoreticalOrientation: profile?.theoreticalOrientation?.trim() || defaultResearcherProfile.theoreticalOrientation,
    noveltyTolerance: profile?.noveltyTolerance === "low" || profile?.noveltyTolerance === "high" ? profile.noveltyTolerance : "medium",
    careerStage: (["student", "researcher", "professor"] as CareerStage[]).includes(profile?.careerStage as CareerStage)
      ? profile?.careerStage as CareerStage
      : "student"
  };
}

function profileLabel(profile: ResearcherProfile): string {
  const stage = profile.careerStage === "student" ? "학생 연구자" : profile.careerStage === "professor" ? "교수/PI" : "연구자";
  const novelty = profile.noveltyTolerance === "high" ? "고참신성" : profile.noveltyTolerance === "low" ? "저위험" : "균형형";
  return `${stage} · ${novelty} · ${profile.theoreticalOrientation}`;
}

function evidenceFrom(item: EvidenceItem | undefined): string {
  return item ? `${item.label}: 검색 문헌 ${item.support}편에서 감지되었습니다.` : "명시 신호가 제한적입니다.";
}

function buildContinuousResearchIntelligence(
  synthesis: Synthesis,
  trendAnalysis: TrendAnalysis,
  graph: TheoryGraph,
  competition: ResearchCompetitionIntelligence,
  forecast: ResearchForecast,
  gaps: Gap[]
): ContinuousResearchIntelligence {
  const edgeUpdates = graph.edges
    .filter((edge) => edge.weight <= 2 || edge.years.some((year) => year >= new Date().getFullYear() - 4))
    .slice(0, 6)
    .map((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      return {
        source,
        target,
        update: edge.weight <= 2 ? "약한 연결로 추적할 후보" : "최근 문헌에서 다시 나타난 연결 후보",
        evidence: `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}, 관련 연도 ${edge.years.slice(-4).join(", ") || "연도 정보 부족"}.`,
        paperIds: edge.paperIds
      };
    });

  return {
    monitoringMode: "current-session snapshot",
    emergingScholarlyTrends: forecast.likelyFutureResearchTrends.slice(0, 5),
    newlyRisingTheoriesTopics: [...synthesis.emergingTopics, ...trendAnalysis.risingTopics.map((trend) => ({
      label: trend.label,
      paperIds: trend.paperIds,
      support: trend.recentCount
    }))].slice(0, 8),
    acceleratingDomains: competition.rapidlyGrowingAreas.slice(0, 5),
    dynamicTheoryRelationshipUpdates: edgeUpdates,
    gapRefinementLog: gaps.slice(0, 5).map((gap) => `${gap.claim} 근거: ${gap.evidence} 신뢰도: ${gap.confidence}`),
    updateBoundary: "이 모니터링은 현재 실행 시점의 OpenAlex 검색 결과 스냅샷입니다. 백그라운드 자동 감시나 외부 알림 시스템은 아직 실행하지 않습니다."
  };
}

function scoreTopicForProfile(topic: Topic, profile: ResearcherProfile, paperCount: number, graph: TheoryGraph): ResearchEvaluationScore[] {
  const methodPreference = profile.preferredMethodologies.includes(topic.recommendedMethodology) ? 1 : 0;
  const targetVenueSignal = profile.targetVenues.length > 0 ? 1 : 0;
  const noveltyAdjustment = profile.noveltyTolerance === "high" ? 1 : profile.noveltyTolerance === "low" ? -1 : 0;
  const beginnerPenalty = profile.careerStage === "student" && topic.scores.feasibility <= 5 ? -1 : 0;
  const graphSupport = Math.min(3, Math.floor(graph.edges.length / 8));
  return [
    {
      criterion: "novelty",
      score: clamp(topic.scores.novelty + noveltyAdjustment),
      reasoning: "기존 토픽 참신성 점수와 연구자의 참신성 허용도를 함께 반영했습니다.",
      evidence: `토픽 참신성 ${topic.scores.novelty}/10, 프로필 참신성 허용도 ${profile.noveltyTolerance}.`
    },
    {
      criterion: "feasibility",
      score: clamp(topic.scores.feasibility + methodPreference + beginnerPenalty),
      reasoning: "선호 방법론과 경력 단계에 따른 실행 리스크를 반영했습니다.",
      evidence: `선호 방법론 일치 ${methodPreference ? "예" : "아니오"}, 검색 논문 ${paperCount}편.`
    },
    {
      criterion: "methodological_rigor",
      score: clamp(5 + topic.methodologyRecommendations.length + methodPreference),
      reasoning: "방법론 대안 수와 사용자가 선호하는 방법론 일치 여부를 근거로 평가했습니다.",
      evidence: `방법론 추천 ${topic.methodologyRecommendations.length}개, 선택 방법론 ${methodologyLabels[topic.recommendedMethodology]}.`
    },
    {
      criterion: "publication_potential",
      score: clamp(topic.scores.publishability + targetVenueSignal),
      reasoning: "출판 가능성 점수와 사용자가 명시한 목표 저널/학회가 있는지 반영했습니다.",
      evidence: `출판 점수 ${topic.scores.publishability}/10, 목표 venue ${profile.targetVenues.length}개. 게재를 보장하지 않습니다.`
    },
    {
      criterion: "interdisciplinary_strength",
      score: clamp(4 + topic.adjacentTheories.length + graphSupport),
      reasoning: "인접 이론 수와 그래프 연결성을 융합 강도 신호로 사용했습니다.",
      evidence: `인접 이론 ${topic.adjacentTheories.length}개, 그래프 엣지 ${graph.edges.length}개.`
    },
    {
      criterion: "theoretical_coherence",
      score: clamp(5 + (topic.coreTheory ? 2 : 0) + Math.min(2, topic.mediatorsModerators.length)),
      reasoning: "핵심 이론, 매개/조절 후보, 변수 구조가 있는지 평가했습니다.",
      evidence: `핵심 이론 ${topic.coreTheory || "부족"}, 매개/조절 후보 ${topic.mediatorsModerators.length}개.`
    },
    {
      criterion: "empirical_testability",
      score: clamp(topic.scores.dataAvailability + (topic.variables.length >= 3 ? 1 : 0)),
      reasoning: "자료 확보성과 변수 수를 실증 검증 가능성의 대리 지표로 사용했습니다.",
      evidence: `자료 확보성 ${topic.scores.dataAvailability}/10, 변수/개념 ${topic.variables.length}개.`
    },
    {
      criterion: "replication_potential",
      score: clamp(4 + (topic.scores.feasibility / 2) + (profile.careerStage === "student" ? 1 : 0)),
      reasoning: "명확하고 반복 가능한 설계 가능성을 실행가능성 중심으로 평가했습니다.",
      evidence: `실행가능성 ${topic.scores.feasibility}/10. 원자료와 척도 공개 여부는 별도 확인이 필요합니다.`
    }
  ];
}

function buildEvaluationEngine(
  topics: Topic[],
  profile: ResearcherProfile,
  paperCount: number,
  graph: TheoryGraph,
  academicOS: AcademicResearchOS
): IntelligentResearchEvaluation {
  const evaluatedTopics = topics.slice(0, 5).map((topic) => {
    const scores = scoreTopicForProfile(topic, profile, paperCount, graph);
    const overall = clamp(scores.reduce((sum, score) => sum + score.score, 0) / scores.length);
    return {
      topicTitle: topic.title,
      scores,
      overall,
      recommendation:
        profile.noveltyTolerance === "low" && topic.scores.feasibility < topic.scores.novelty
          ? "범위를 좁히고 재현 가능한 데이터 경로를 먼저 확보하는 편이 좋습니다."
          : profile.noveltyTolerance === "high"
            ? "차별화 주장은 가능하지만 근거 논문과 측정 타당도 방어를 강화해야 합니다."
            : "균형형 후보입니다. 핵심 이론과 데이터 접근성을 동시에 보강하세요.",
      transparencyNote: "평가는 검색 메타데이터, 생성 토픽 점수, 사용자 프로필을 결합한 휴리스틱입니다."
    };
  });

  return {
    evaluatedTopics,
    proposalEvaluation: [
      {
        criterion: "theoretical_coherence",
        score: clamp(6 + academicOS.conceptualFramework.nodes.filter((node) => node.type === "theory").length),
        reasoning: "제안서의 이론 프레임워크와 개념모형 노드 구조를 확인했습니다.",
        evidence: `프레임워크 노드 ${academicOS.conceptualFramework.nodes.length}개, 관계 ${academicOS.conceptualFramework.edges.length}개.`
      },
      {
        criterion: "methodological_rigor",
        score: clamp(5 + academicOS.reasoningWorkflow.methodologyTradeoffs.length),
        reasoning: "방법론 트레이드오프가 명시되어 있는지 확인했습니다.",
        evidence: `방법론 트레이드오프 ${academicOS.reasoningWorkflow.methodologyTradeoffs.length}개.`
      },
      {
        criterion: "publication_potential",
        score: evaluatedTopics[0]?.scores.find((score) => score.criterion === "publication_potential")?.score ?? 5,
        reasoning: "대표 토픽의 출판 가능성 평가를 제안서 수준으로 전파했습니다.",
        evidence: evaluatedTopics[0]?.recommendation ?? "대표 토픽 평가가 제한적입니다."
      }
    ],
    evaluationBoundary: "모든 평가는 투명한 점수화 휴리스틱이며, 실제 심사 결과·저널 랭킹·원문 품질 평가를 대체하지 않습니다."
  };
}

function buildInstitutionEdges(papers: RetrievedPaper[]): CollaborationEdge[] {
  const edgeMap = new Map<string, CollaborationEdge>();
  for (const paper of papers) {
    const institutions = unique(paper.institutions).slice(0, 6);
    for (let i = 0; i < institutions.length; i += 1) {
      for (let j = i + 1; j < institutions.length; j += 1) {
        const [source, target] = [institutions[i], institutions[j]].sort();
        const key = `${source}::${target}`;
        const current = edgeMap.get(key) ?? { source, target, weight: 0, paperIds: [] };
        edgeMap.set(key, {
          ...current,
          weight: current.weight + 1,
          paperIds: [...current.paperIds, paper.id]
        });
      }
    }
  }
  return [...edgeMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 10);
}

function buildAuthorEdges(papers: RetrievedPaper[]): CollaborationEdge[] {
  const edgeMap = new Map<string, CollaborationEdge>();
  for (const paper of papers) {
    const authors = unique(paper.authors).slice(0, 8);
    for (let i = 0; i < authors.length; i += 1) {
      for (let j = i + 1; j < authors.length; j += 1) {
        const [source, target] = [authors[i], authors[j]].sort();
        const key = `${source}::${target}`;
        const current = edgeMap.get(key) ?? { source, target, weight: 0, paperIds: [] };
        edgeMap.set(key, {
          ...current,
          weight: current.weight + 1,
          paperIds: [...current.paperIds, paper.id]
        });
      }
    }
  }
  return [...edgeMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 10);
}

function buildInstitutionalIntelligence(
  papers: RetrievedPaper[],
  synthesis: Synthesis,
  bibliometric: BibliometricAnalysis,
  authorInfluence: AuthorInfluence[],
  discipline: Discipline
): SelfImprovingAcademicIntelligence["institutionalIntelligence"] {
  const departmentResearchMap = synthesis.trends.slice(0, 8).map((item) => ({
    area: item.label,
    paperCount: item.support,
    evidencePaperIds: item.paperIds
  }));
  const labGroupAlignment = bibliometric.institutionTrends.slice(0, 5).map((institution) => ({
    group: institution.institution,
    alignment: `${disciplineLabels[discipline]} 관련 검색 결과에서 ${institution.paperCount}편이 확인되었습니다.`,
    evidence: `국가 ${institution.countries.join(", ") || "미상"}, 최근 문헌 ${institution.recentCount}편, 총 인용 ${institution.totalCitations}회.`,
    paperIds: institution.paperIds
  }));
  const collaborationOpportunities = buildInstitutionEdges(papers).map((edge) => ({
    source: edge.source,
    target: edge.target,
    opportunity: "공저 기관 연결이 검색 결과에서 확인되어 후속 공동연구 탐색 후보가 될 수 있습니다.",
    evidence: `${edge.weight}편에서 두 기관이 함께 나타났습니다.`,
    paperIds: edge.paperIds
  }));

  return {
    departmentResearchMap,
    labGroupAlignment,
    institutionalTrends: bibliometric.institutionTrends.slice(0, 8),
    facultyExpertiseMatches: authorInfluence.slice(0, 8),
    collaborationOpportunities,
    strategicPlanningDashboard: [
      departmentResearchMap[0] ? `핵심 연구 영역: ${departmentResearchMap[0].area} (${departmentResearchMap[0].paperCount}편)` : "핵심 연구 영역 신호가 제한적입니다.",
      bibliometric.institutionTrends[0] ? `기관 벤치마크: ${bibliometric.institutionTrends[0].institution}` : "기관 메타데이터가 부족합니다.",
      authorInfluence[0] ? `전문가 탐색 후보: ${authorInfluence[0].author}` : "저자 메타데이터가 부족합니다.",
      "전략 계획은 검색 결과 내부 신호이며, 실제 소속 기관의 내부 성과 데이터는 사용하지 않았습니다."
    ],
    evidenceBoundary: "기관/교수/협업 정보는 OpenAlex 검색 결과에 포함된 저자·기관 메타데이터에서만 가져왔습니다. 새 기관이나 인물을 생성하지 않습니다."
  };
}

function buildMentorMode(topics: Topic[], profile: ResearcherProfile, gaps: Gap[], bibliometric: BibliometricAnalysis): AIResearchMentor {
  const topic = topics[0];
  return {
    critique: [
      topic ? `현재 대표 주제는 ${topic.coreTheory}와 ${topic.variables.slice(1, 3).join(", ")}의 관계를 다루지만, 변수 방향과 측정 도구를 더 좁혀야 합니다.` : "대표 토픽이 없어 구체적 비평이 제한됩니다.",
      bibliometric.saturation.level === "high" ? "검색 집합의 포화 신호가 높아 차별화 논리를 더 명확히 해야 합니다." : "포화 신호는 극단적으로 높지 않지만, 원문 검토로 선행연구 중복을 확인해야 합니다."
    ],
    strongerTheoreticalGrounding: topics.slice(0, 3).map((item) => `${item.coreTheory}를 핵심 이론으로 고정하고 ${item.adjacentTheories.slice(0, 2).join(", ") || "인접 이론"}와의 역할 차이를 명확히 쓰세요.`),
    hiddenAssumptions: [
      "OpenAlex 초록과 개념 필드에 없는 원문 결과 방향을 알고 있다고 가정하면 안 됩니다.",
      "자기효능감, AI 사용, 학습성과 간 방향성은 연구설계 없이는 인과로 주장할 수 없습니다.",
      profile.targetVenues.length > 0 ? `목표 venue(${profile.targetVenues.join(", ")})의 실제 방법론 기준을 아직 검증하지 않았습니다.` : "목표 저널/학회가 비어 있어 출판 전략이 일반적입니다."
    ],
    methodologicalImprovements: [
      topic?.methodologyRecommendations[0] ? `${topic.methodologyRecommendations[0].method}를 1순위로 검토하되, ${topic.methodologyRecommendations[0].risks[0]}` : "방법론 추천 신호가 부족하므로 연구문제부터 좁히세요.",
      profile.careerStage === "student" ? "학생 연구자는 공개자료 또는 단기 설문처럼 통제 가능한 데이터 경로를 우선 선택하는 편이 안전합니다." : "경험 연구자는 다기관 표본이나 장기 추적 설계를 통해 기여도를 높일 수 있습니다."
    ],
    oversaturationWarnings: [
      bibliometric.saturation.evidence,
      ...gaps.filter((gap) => gap.type === "underexplored_intersection").slice(0, 2).map((gap) => `과포화 회피 후보: ${gap.claim}`)
    ],
    beginnerGuidanceSteps: [
      "1단계: 대표 토픽 하나를 선택하고 핵심 이론·독립변수·종속변수를 한 문장으로 고정합니다.",
      "2단계: 근거 패널의 실제 논문 5편을 원문으로 확인해 변수와 측정 도구를 기록합니다.",
      "3단계: 방법론 추천 중 데이터 접근성이 가장 높은 설계를 선택합니다.",
      "4단계: 연구문제, 가설, 표본, 분석 방법을 1페이지 제안서로 축소합니다."
    ],
    mentorBoundary: "멘토 피드백은 검색 근거와 앱 내부 점수에 기반한 조언입니다. 지도교수·심사위원·IRB 판단을 대체하지 않습니다."
  };
}

function buildAdvancedKnowledgeGraph(
  papers: RetrievedPaper[],
  graph: TheoryGraph,
  synthesis: Synthesis,
  bridges: InterdisciplinaryBridge[],
  longRangeConceptDiscovery: AdvancedScholarlyKnowledgeGraph["longRangeConceptDiscovery"],
  methodology: Methodology
): AdvancedScholarlyKnowledgeGraph {
  const institutionRelationships = buildInstitutionEdges(papers);
  const theoryEvolutionChains = synthesis.theories.slice(0, 5).map((theory) => {
    const years = papers.filter((paper) => theory.paperIds.includes(paper.id) && paper.year !== null).map((paper) => paper.year as number).sort((a, b) => a - b);
    return {
      theory: theory.label,
      chain: years.length > 0 ? [`first detected ${years[0]}`, `latest detected ${years.at(-1)}`, `support ${theory.support} papers`] : [`support ${theory.support} papers`, "year evidence limited"],
      evidence: evidenceFrom(theory),
      paperIds: theory.paperIds
    };
  });
  return {
    authorRelationships: buildAuthorEdges(papers),
    institutionRelationships,
    theoryEvolutionChains,
    methodologyLineage: [
      {
        method: methodology,
        lineage: ["research question fit", methodologyLabels[methodology], "data access check", "robustness/replication plan"],
        evidence: "선택 방법론과 연구설계 단계의 워크플로우 lineage입니다. 특정 방법론의 역사적 계보를 주장하지 않습니다."
      }
    ],
    interdisciplinaryBridges: bridges.slice(0, 8),
    longRangeConceptDiscovery: longRangeConceptDiscovery.slice(0, 8),
    graphBoundary: `지식 그래프 확장은 검색 문헌 ${papers.length}편의 저자·기관·개념·이론 공출현 신호를 사용합니다. 누락된 저자 관계나 외부 기관 네트워크를 보완 생성하지 않습니다.`
  };
}

function buildScenarioAnalysis(
  topics: Topic[],
  profile: ResearcherProfile,
  roadmap: ResearchRoadmap,
  academicOS: AcademicResearchOS
): ResearchSimulationAnalysis {
  const primary = topics[0];
  const scenarios: ResearchScenario[] = [
    {
      scenario: "high-risk/high-reward",
      recommendation: primary ? `${primary.coreTheory}와 ${primary.adjacentTheories[0] ?? "인접 이론"}의 약한 연결을 전면에 둡니다.` : "고위험 후보를 만들 근거가 제한적입니다.",
      expectedUpside: "차별화된 이론 기여가 가능하지만 선행연구 방어 부담이 큽니다.",
      risks: ["문헌 지지가 약할 수 있음", "측정모형 정당화가 어려울 수 있음"],
      nextSteps: academicOS.refinementActions.filter((item) => item.action === "improve_novelty").map((item) => item.recommendation).slice(0, 2),
      evidence: primary?.academicContribution ?? "대표 토픽 근거 부족"
    },
    {
      scenario: "safe publishable path",
      recommendation: primary ? `${primary.recommendedMethodology} 설계로 범위를 줄이고 데이터 접근성을 우선합니다.` : "안전 경로를 만들 토픽이 부족합니다.",
      expectedUpside: "초기 논문 또는 학위논문 챕터로 전환하기 쉽습니다.",
      risks: ["참신성이 낮게 보일 수 있음", "기여문장을 정교하게 써야 함"],
      nextSteps: academicOS.refinementActions.filter((item) => item.action === "increase_publishability" || item.action === "simplify_scope").map((item) => item.recommendation).slice(0, 3),
      evidence: primary ? `실행가능성 ${primary.scores.feasibility}/10, 자료 확보성 ${primary.scores.dataAvailability}/10.` : "대표 토픽 근거 부족"
    },
    {
      scenario: "long-term research agenda",
      recommendation: roadmap.recommendedNextStepStudies[0]?.title ?? "단기 연구 후 후속 연구 체인을 구성합니다.",
      expectedUpside: "단일 주제를 다편 논문 또는 연구실 아젠다로 확장할 수 있습니다.",
      risks: ["범위가 과도해질 수 있음", "연구별 데이터 일관성 관리가 필요함"],
      nextSteps: roadmap.recommendedNextStepStudies.slice(0, 3).map((item) => item.title),
      evidence: roadmap.recommendedNextStepStudies[0]?.evidence ?? "로드맵 근거 제한"
    },
    {
      scenario: "dissertation roadmap",
      recommendation: academicOS.workflowAutomation.thesisDissertationPlan[0]?.title ?? "문헌지도-모형-실증-확장 순서로 장을 구성합니다.",
      expectedUpside: "학위논문 구조로 바로 전환할 수 있습니다.",
      risks: ["각 장의 독립 기여가 약하면 전체 설득력이 낮아짐"],
      nextSteps: academicOS.workflowAutomation.thesisDissertationPlan.map((item) => item.rationale).slice(0, 3),
      evidence: academicOS.workflowAutomation.thesisDissertationPlan[0]?.evidence ?? "학위 계획 근거 제한"
    },
    {
      scenario: "interdisciplinary expansion",
      recommendation: primary ? `${primary.variables.slice(0, 2).join(" + ")}를 다른 분야 표본이나 데이터셋으로 확장합니다.` : "융합 확장 후보가 제한적입니다.",
      expectedUpside: "인접 분야 기여와 실무적 응용 가능성을 함께 높일 수 있습니다.",
      risks: ["분야별 이론 언어가 달라 심사 설득이 어려울 수 있음"],
      nextSteps: roadmap.unexploredInterdisciplinaryCombinations.slice(0, 3).map((item) => item.title),
      evidence: roadmap.unexploredInterdisciplinaryCombinations[0]?.evidence ?? "융합 근거 제한"
    }
  ];
  const preferredScenario =
    profile.noveltyTolerance === "high"
      ? "high-risk/high-reward"
      : profile.careerStage === "student" || profile.noveltyTolerance === "low"
        ? "safe publishable path"
        : "long-term research agenda";
  return {
    scenarios,
    preferredScenario,
    simulationBoundary: "시나리오는 현재 검색 결과와 사용자 프로필 기반의 계획 모의실험입니다. 미래 성과나 게재 가능성을 예측·보장하지 않습니다."
  };
}

export function buildSelfImprovingAcademicIntelligence(params: {
  profile?: Partial<ResearcherProfile>;
  discipline: Discipline;
  methodology: Methodology;
  strategy: ResearchStrategy;
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  graph: TheoryGraph;
  trendAnalysis: TrendAnalysis;
  gaps: Gap[];
  topics: Topic[];
  bibliometricAnalysis: BibliometricAnalysis;
  competitionIntelligence: ResearchCompetitionIntelligence;
  researchForecast: ResearchForecast;
  researchRoadmap: ResearchRoadmap;
  academicResearchOS: AcademicResearchOS;
  authorInfluence: AuthorInfluence[];
  interdisciplinaryBridges: InterdisciplinaryBridge[];
  longRangeConceptDiscovery: AdvancedScholarlyKnowledgeGraph["longRangeConceptDiscovery"];
}): SelfImprovingAcademicIntelligence {
  const profile = normalizeResearcherProfile(params.profile);
  const continuousIntelligence = buildContinuousResearchIntelligence(
    params.synthesis,
    params.trendAnalysis,
    params.graph,
    params.competitionIntelligence,
    params.researchForecast,
    params.gaps
  );
  const evaluationEngine = buildEvaluationEngine(params.topics, profile, params.papers.length, params.graph, params.academicResearchOS);
  const institutionalIntelligence = buildInstitutionalIntelligence(
    params.papers,
    params.synthesis,
    params.bibliometricAnalysis,
    params.authorInfluence,
    params.discipline
  );
  const mentorMode = buildMentorMode(params.topics, profile, params.gaps, params.bibliometricAnalysis);
  const advancedKnowledgeGraph = buildAdvancedKnowledgeGraph(
    params.papers,
    params.graph,
    params.synthesis,
    params.interdisciplinaryBridges,
    params.longRangeConceptDiscovery,
    params.methodology
  );
  const scenarioAnalysis = buildScenarioAnalysis(params.topics, profile, params.researchRoadmap, params.academicResearchOS);
  const preferredMethodLabel = profile.preferredMethodologies.map((method) => methodologyLabels[method]).join(", ") || methodologyLabels[params.methodology];

  return {
    researcherProfile: profile,
    personalizedRecommendationSummary: `${profileLabel(profile)} 프로필에 맞춰 ${disciplineLabels[params.discipline]} 분야의 ${preferredMethodLabel} 중심 추천을 조정했습니다. 현재 전략 모드는 ${strategyLabels[params.strategy]}이며, 프로필의 참신성 허용도와 경력 단계가 평가·멘토·시나리오 결과에 반영됩니다.`,
    continuousIntelligence,
    evaluationEngine,
    institutionalIntelligence,
    mentorMode,
    advancedKnowledgeGraph,
    scenarioAnalysis
  };
}
