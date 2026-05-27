import type {
  BibliometricAnalysis,
  Discipline,
  Methodology,
  PersistentScholarlyMemory,
  PredictiveAcademicIntelligence,
  PredictiveSignal,
  PublicationIntelligence,
  ResearchImpactIntelligence,
  ResearchCompetitionIntelligence,
  ResearchStrategy,
  RetrievedPaper,
  Synthesis,
  TheoryGraph,
  Topic,
  TrendAnalysis
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";
import { strategyLabels } from "./strategy";

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function signal(
  label: string,
  score: number,
  direction: PredictiveSignal["direction"],
  horizon: PredictiveSignal["horizon"],
  evidence: string,
  generatedForecast: string,
  evidencePaperIds: string[],
  confidence: PredictiveSignal["confidence"] = "low"
): PredictiveSignal {
  return {
    label,
    score: clamp(score),
    direction,
    horizon,
    evidence,
    generatedForecast,
    confidence,
    evidencePaperIds
  };
}

function scoreLiteratureSupport(topic: Topic, papers: RetrievedPaper[], graph: TheoryGraph): number {
  const evidenceCount = topic.evidencePaperIds.length;
  const graphSupport = graph.nodes.filter((node) => topic.variables.some((variable) => node.label.toLowerCase() === variable.toLowerCase())).length;
  return clamp(3 + Math.min(3, evidenceCount) + Math.min(2, graphSupport) + (papers.length >= 20 ? 2 : papers.length >= 10 ? 1 : 0));
}

function scoreMethodAcceptance(topic: Topic, methodology: Methodology, graph: TheoryGraph): number {
  const selectedFit = topic.methodologyRecommendations.find((item) => item.method === methodology)?.fit ?? topic.methodologyRecommendations[0]?.fit ?? 5;
  const methodDiversityBoost = graph.metrics.methodologyDiversity >= 3 ? 1 : 0;
  return clamp(selectedFit + methodDiversityBoost);
}

function buildForecasting(
  synthesis: Synthesis,
  trendAnalysis: TrendAnalysis,
  competition: ResearchCompetitionIntelligence,
  bibliometric: BibliometricAnalysis,
  graph: TheoryGraph,
  memory: PersistentScholarlyMemory,
  methodology: Methodology
): PredictiveAcademicIntelligence["forecasting"] {
  const emergingResearchDomains = [
    ...synthesis.emergingTopics.slice(0, 4).map((item) =>
      signal(
        item.label,
        4 + item.support + memory.vectorRetrieval.semanticSearchResults.filter((result) => result.label.toLowerCase().includes(item.label.toLowerCase())).length,
        "rising",
        "near-term",
        `${item.support}편의 최근 검색 문헌에서 감지되었습니다.`,
        "현재 검색 스냅샷 안에서는 가까운 기간의 탐색 후보로 볼 수 있습니다.",
        item.paperIds
      )
    ),
    ...competition.emergingOpportunities.slice(0, 2).map((item) =>
      signal(item.label, item.level === "high" ? 8 : 6, "rising", "mid-term", item.evidence, "경쟁이 낮거나 새롭게 나타나는 기회 영역으로 추적할 만합니다.", item.paperIds)
    )
  ].slice(0, 6);

  const risingTheoriesFrameworks = synthesis.theories.slice(0, 6).map((item) =>
    signal(
      item.label,
      4 + item.support + (trendAnalysis.risingTopics.some((trend) => trend.label.toLowerCase() === item.label.toLowerCase()) ? 2 : 0),
      "rising",
      "mid-term",
      `${item.support}편의 검색 문헌에서 이론/프레임워크 신호가 감지되었습니다.`,
      "반복 출현 이론은 후속 연구의 프레임워크 후보가 될 수 있지만, 실제 이론 성장세는 더 넓은 검색으로 확인해야 합니다.",
      item.paperIds,
      item.support >= 4 ? "medium" : "low"
    )
  );

  const methodologyTrendScore = 4 + graph.metrics.methodologyDiversity + (bibliometric.researchMaturity.score >= 7 ? 1 : 0);
  const futureMethodologyTrends = [
    signal(
      methodologyLabels[methodology],
      methodologyTrendScore,
      methodologyTrendScore >= 7 ? "rising" : "stable",
      "near-term",
      `그래프 방법론 다양성 ${graph.metrics.methodologyDiversity}, 연구 성숙도 ${bibliometric.researchMaturity.score}/10.`,
      "선택 방법론은 현재 검색 집합의 방법론 다양성과 성숙도에 따라 수용 가능성이 달라질 수 있습니다.",
      graph.nodes.filter((node) => node.type === "methodology").flatMap((node) => node.paperIds)
    ),
    ...graph.nodes.filter((node) => node.type === "methodology").slice(0, 4).map((node) =>
      signal(node.label, 4 + node.support, "stable", "mid-term", `${node.support}편에서 방법론 신호가 감지되었습니다.`, "반복 등장하는 방법론은 후속 설계의 후보입니다.", node.paperIds)
    )
  ];

  const acceleratingInterdisciplinaryAreas = graph.edges
    .filter((edge) => edge.type === "concept_bridge" || edge.type === "adjacent_framework")
    .slice(0, 6)
    .map((edge) => {
      const source = graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      return signal(
        `${source} ↔ ${target}`,
        4 + edge.weight + (edge.years.some((year) => year >= new Date().getFullYear() - 4) ? 2 : 0),
        edge.years.some((year) => year >= new Date().getFullYear() - 4) ? "accelerating" : "stable",
        "mid-term",
        `공출현 ${edge.weight}회, 밀도 ${edge.density.toFixed(2)}.`,
        "교차 연결이 최근 연도와 함께 나타나면 융합 확장 후보로 추적할 수 있습니다.",
        edge.paperIds
      );
    });

  const decliningSaturatedTopics = [
    ...competition.oversaturatedTopics.slice(0, 4).map((item) =>
      signal(item.label, item.level === "high" ? 8 : 6, "saturated", "near-term", item.evidence, "포화 신호가 있어 차별화 없는 재사용은 위험할 수 있습니다.", item.paperIds)
    ),
    ...trendAnalysis.decliningTopics.slice(0, 4).map((trend) =>
      signal(trend.label, 5 + trend.priorCount, "declining", "near-term", `이전 ${trend.priorCount}, 최근 ${trend.recentCount}.`, "현재 검색 집합에서 최근 비중이 낮아진 주제입니다.", trend.paperIds)
    )
  ].slice(0, 6);

  const likelyFutureHotTopics = [...emergingResearchDomains, ...acceleratingInterdisciplinaryAreas]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((item) => ({ ...item, generatedForecast: `${item.generatedForecast} 단, 이 hot topic 판단은 검색 결과 내부 휴리스틱입니다.` }));

  return {
    emergingResearchDomains,
    risingTheoriesFrameworks,
    futureMethodologyTrends,
    acceleratingInterdisciplinaryAreas,
    decliningSaturatedTopics,
    likelyFutureHotTopics,
    forecastBoundary: "예측은 OpenAlex 검색 결과, 연도/빈도/그래프/메모리 유사도 기반 휴리스틱입니다. 외부 펀딩, 정책, 학회 CFP, 실제 인용 미래값은 사용하지 않으며 미래 성과를 보장하지 않습니다."
  };
}

function buildPublicationOutcomes(
  topics: Topic[],
  papers: RetrievedPaper[],
  graph: TheoryGraph,
  publication: PublicationIntelligence,
  methodology: Methodology
): PredictiveAcademicIntelligence["publicationOutcomes"] {
  const venueCount = publication.journals.length + publication.conferences.length;
  const citationAverage = average(papers.map((paper) => paper.citedByCount));
  return topics.slice(0, 5).map((topic) => {
    const literatureSupport = scoreLiteratureSupport(topic, papers, graph);
    const methodAcceptance = scoreMethodAcceptance(topic, methodology, graph);
    const journalConferenceFit = clamp(4 + Math.min(3, venueCount) + (publication.journals[0]?.topicFit ?? 0) / 4);
    const citationPotential = clamp(3 + Math.min(3, citationAverage / 20) + topic.scores.novelty / 3 + literatureSupport / 4);
    const noveltyDurability = clamp(topic.scores.novelty + topic.scores.saturation / 3 - (topic.scores.saturation <= 3 ? 1 : 0));
    const interdisciplinaryImpactPotential = clamp(4 + topic.adjacentTheories.length + graph.metrics.emergingConnectionCount / 3);
    return {
      topicTitle: topic.title,
      publishabilityLikelihood: clamp((topic.scores.publishability + journalConferenceFit + methodAcceptance + literatureSupport) / 4),
      journalConferenceFit,
      citationPotential,
      noveltyDurability,
      methodologicalAcceptanceLikelihood: methodAcceptance,
      interdisciplinaryImpactPotential,
      reasoning: [
        `문헌 지지 ${literatureSupport}/10, 출판원 후보 ${venueCount}개, 방법론 수용 가능성 ${methodAcceptance}/10을 반영했습니다.`,
        `평균 OpenAlex 인용 ${citationAverage.toFixed(1)}회와 토픽 참신성 ${topic.scores.novelty}/10을 citation potential에 약하게 반영했습니다.`,
        "이 수치는 실제 게재나 인용을 예측하는 ML 모델이 아니라 전략 비교용 휴리스틱입니다."
      ],
      evidence: `근거 논문 ${topic.evidencePaperIds.length}편, 검색 문헌 ${papers.length}편, 출판원 후보 ${venueCount}개.`,
      warning: "게재 성공, 인용 수, 저널 적합성을 보장하지 않습니다. aims & scope와 원문 품질 검토가 필요합니다."
    };
  });
}

function buildAdvancedEvaluation(
  topics: Topic[],
  papers: RetrievedPaper[],
  graph: TheoryGraph,
  methodology: Methodology
): PredictiveAcademicIntelligence["advancedEvaluation"] {
  return topics.slice(0, 5).map((topic) => {
    const theoreticalCoherence = clamp(5 + (topic.coreTheory ? 2 : 0) + Math.min(2, topic.adjacentTheories.length));
    const empiricalTestability = clamp(topic.scores.dataAvailability + (topic.variables.length >= 4 ? 1 : 0));
    const methodologicalRigor = scoreMethodAcceptance(topic, methodology, graph);
    const replicationFeasibility = clamp(topic.scores.feasibility + (topic.researchDesignGuidance.estimatedSampleSizeGuidance ? 1 : 0));
    const literatureSupportStrength = scoreLiteratureSupport(topic, papers, graph);
    const practicalRelevance = clamp(5 + (topic.practicalContribution.length > 80 ? 2 : 0) + (topic.datasetIntelligence.recommendations.length > 0 ? 1 : 0));
    const longTermResearchScalability = clamp(4 + topic.researchPlan.futureExpansionDirections.length + topic.adjacentTheories.length / 2);
    const overall = clamp((theoreticalCoherence + empiricalTestability + methodologicalRigor + replicationFeasibility + literatureSupportStrength + practicalRelevance + longTermResearchScalability) / 7);
    return {
      topicTitle: topic.title,
      theoreticalCoherence,
      empiricalTestability,
      methodologicalRigor,
      replicationFeasibility,
      literatureSupportStrength,
      practicalRelevance,
      longTermResearchScalability,
      overall,
      reasoning: [
        `${methodologyLabels[methodology]} 적합도와 변수 구조를 방법론 엄밀성에 반영했습니다.`,
        `근거 논문 ${topic.evidencePaperIds.length}편과 그래프 노드/엣지 신호를 문헌 지지 강도에 반영했습니다.`,
        "장기 확장성은 후속 연구 방향과 인접 이론 수를 기준으로 산정했습니다."
      ]
    };
  });
}

function buildOptimizationVariants(topics: Topic[], methodology: Methodology): PredictiveAcademicIntelligence["optimizationVariants"] {
  const topic = topics[0];
  if (!topic) return [];
  const outcome = topic.variables.at(-1) ?? "핵심 결과";
  const mediator = topic.mediatorsModerators[0] ?? topic.variables[1] ?? "맥락 요인";
  const adjacent = topic.adjacentTheories[0] ?? "인접 이론";
  return [
    {
      variant: "publication_likelihood",
      title: `[출판가능성 최적화] ${topic.coreTheory} 기반 ${methodologyLabels[methodology]} 검증`,
      optimizedResearchQuestion: `${topic.coreTheory}는 ${mediator}를 통해 ${outcome}를 설명하는가?`,
      strategy: "범위를 좁히고 데이터 접근성, 측정도구, 저널 방법론 기대치를 먼저 맞춥니다.",
      expectedTradeoff: "참신성 일부를 포기하는 대신 실행가능성과 심사 방어력을 높입니다.",
      scoreProfile: { novelty: clamp(topic.scores.novelty - 1), feasibility: clamp(topic.scores.feasibility + 1), publishability: clamp(topic.scores.publishability + 1), impact: clamp(topic.scores.publishability), risk: 3 },
      evidence: topic.inferenceNotice
    },
    {
      variant: "novelty",
      title: `[참신성 최적화] ${topic.coreTheory} × ${adjacent} 융합`,
      optimizedResearchQuestion: `${topic.coreTheory}와 ${adjacent}의 결합은 ${outcome} 설명을 어떻게 확장하는가?`,
      strategy: "약한 이론 연결과 부상 개념을 명시하되, 원문 검토로 과장 주장을 피합니다.",
      expectedTradeoff: "차별화는 커지지만 문헌 지지와 방법론 방어 부담이 증가합니다.",
      scoreProfile: { novelty: clamp(topic.scores.novelty + 2), feasibility: clamp(topic.scores.feasibility - 1), publishability: topic.scores.publishability, impact: clamp(topic.scores.novelty + 1), risk: 7 },
      evidence: `인접 이론 후보: ${topic.adjacentTheories.slice(0, 3).join(", ") || "명시 신호 부족"}.`
    },
    {
      variant: "feasibility",
      title: `[실행가능성 최적화] 공개자료/설문 중심 축소 설계`,
      optimizedResearchQuestion: `${topic.coreTheory}와 ${outcome}의 관계는 접근 가능한 표본에서 재현되는가?`,
      strategy: "단일 표본, 단일 분석, 핵심 변수 3개 내외로 줄입니다.",
      expectedTradeoff: "빠르게 실행할 수 있지만 이론적 야심은 낮아집니다.",
      scoreProfile: { novelty: clamp(topic.scores.novelty - 1), feasibility: 10, publishability: clamp(topic.scores.publishability + 1), impact: clamp(topic.scores.feasibility), risk: 2 },
      evidence: topic.researchDesignGuidance.estimatedSampleSizeGuidance || "표본 지침은 추가 검토가 필요합니다."
    },
    {
      variant: "risk_impact_balance",
      title: `[위험/임팩트 균형] 안전한 핵심 + 참신한 조절경로`,
      optimizedResearchQuestion: `${topic.coreTheory}의 안정적 효과는 ${mediator} 조건에서 달라지는가?`,
      strategy: "문헌 지지가 있는 핵심 경로와 참신한 조절/매개 경로를 분리해 검증합니다.",
      expectedTradeoff: "모형이 다소 복잡해지지만 안전성과 차별화를 함께 확보합니다.",
      scoreProfile: { novelty: clamp(topic.scores.novelty + 1), feasibility: topic.scores.feasibility, publishability: topic.scores.publishability, impact: clamp(topic.scores.novelty + topic.scores.publishability / 2), risk: 5 },
      evidence: `매개/조절 후보: ${topic.mediatorsModerators.join(", ") || "추가 검토 필요"}.`
    }
  ];
}

function buildStrategySimulations(
  variants: PredictiveAcademicIntelligence["optimizationVariants"],
  discipline: Discipline,
  strategy: ResearchStrategy
): PredictiveAcademicIntelligence["strategySimulations"] {
  const variantMap = new Map(variants.map((variant) => [variant.variant, variant]));
  return [
    {
      scenario: "safe_publication_path",
      predictedUpside: "단기 투고 가능성과 실행력을 높일 수 있습니다.",
      riskWarnings: ["참신성이 약해 보일 수 있습니다.", "기여문장을 좁고 선명하게 써야 합니다."],
      recommendedMoves: [variantMap.get("publication_likelihood")?.strategy ?? "범위 축소", "검색된 출판원 aims & scope 확인", "원문에서 측정도구 확인"],
      comparativeScore: variantMap.get("publication_likelihood")?.scoreProfile.publishability ?? 6,
      evidence: `${disciplineLabels[discipline]} 분야와 ${strategyLabels[strategy]} 전략을 반영했습니다.`
    },
    {
      scenario: "high_risk_high_impact_path",
      predictedUpside: "이론 조합의 차별화와 장기 아젠다 확장성이 큽니다.",
      riskWarnings: ["문헌 지지가 약할 수 있습니다.", "심사자가 과장된 갭 주장을 지적할 수 있습니다."],
      recommendedMoves: [variantMap.get("novelty")?.strategy ?? "이론 융합", "갭 주장을 낮은 confidence로 표현", "파일럿 분석으로 측정 가능성 확인"],
      comparativeScore: variantMap.get("novelty")?.scoreProfile.impact ?? 6,
      evidence: "고위험 경로는 약한 연결과 부상 개념을 활용하는 생성 전략입니다."
    },
    {
      scenario: "dissertation_strategy",
      predictedUpside: "문헌고찰, 실증, 확장 연구를 장별로 연결하기 쉽습니다.",
      riskWarnings: ["범위가 커질 수 있습니다.", "장별 독립 기여를 분명히 해야 합니다."],
      recommendedMoves: ["1장 문제와 이론 경계 설정", "2장 문헌지도", "3장 실증모형", "4장 맥락 비교"],
      comparativeScore: 7,
      evidence: "기존 장기 로드맵과 연구계획 산출물에서 구성한 시뮬레이션입니다."
    },
    {
      scenario: "multi_paper_agenda",
      predictedUpside: "한 주제를 다편 논문 포트폴리오로 확장할 수 있습니다.",
      riskWarnings: ["데이터 일관성과 저자원 관리가 필요합니다."],
      recommendedMoves: ["문헌지도 논문", "정량 검증 논문", "응용/정책 함의 논문"],
      comparativeScore: 7,
      evidence: "다편 연구 아젠다는 생성 토픽과 후속 연구 방향을 단계화한 것입니다."
    },
    {
      scenario: "interdisciplinary_expansion",
      predictedUpside: "인접 커뮤니티와 실무 영향 가능성을 넓힐 수 있습니다.",
      riskWarnings: ["분야별 용어와 방법론 기대치가 다를 수 있습니다."],
      recommendedMoves: [variantMap.get("risk_impact_balance")?.strategy ?? "핵심 경로와 참신 경로 분리", "인접 분야 핵심 저널의 최근 논문 확인"],
      comparativeScore: variantMap.get("risk_impact_balance")?.scoreProfile.impact ?? 7,
      evidence: "그래프의 인접 이론/개념 연결을 사용한 시뮬레이션입니다."
    },
    {
      scenario: "long_term_positioning",
      predictedUpside: "연구자의 장기 포지셔닝과 연구실/학위 아젠다 구축에 유리합니다.",
      riskWarnings: ["단기 산출과 장기 야심의 균형이 필요합니다."],
      recommendedMoves: ["첫 논문은 안전하게", "두 번째 논문에서 참신 경로 확장", "세 번째 논문에서 분야 간 비교"],
      comparativeScore: 8,
      evidence: "장기 포지셔닝은 현재 결과의 연구 로드맵과 사용자 전략을 종합한 휴리스틱입니다."
    }
  ];
}

function buildImpactIntelligence(
  topics: Topic[],
  forecasting: PredictiveAcademicIntelligence["forecasting"],
  memory: PersistentScholarlyMemory,
  discipline: Discipline
): ResearchImpactIntelligence {
  const topic = topics[0];
  const communities = [
    disciplineLabels[discipline],
    ...new Set((topic?.adjacentTheories ?? []).slice(0, 3)),
    ...memory.unifiedKnowledgeGraph.nodes.filter((node) => node.type === "venue").slice(0, 3).map((node) => node.label)
  ].filter(Boolean);
  return {
    predictedContributionAreas: [
      ...forecasting.risingTheoriesFrameworks.slice(0, 2),
      ...forecasting.acceleratingInterdisciplinaryAreas.slice(0, 2)
    ],
    likelyResearchCommunitiesImpacted: communities.slice(0, 6).map((community, index) => ({
      community,
      likelihood: clamp(7 - index + (community === disciplineLabels[discipline] ? 1 : 0)),
      evidence: "토픽의 분야, 인접 이론, 검색 출판원 신호에서 도출한 커뮤니티 후보입니다."
    })),
    potentialInterdisciplinaryInfluence: forecasting.acceleratingInterdisciplinaryAreas.slice(0, 5),
    futureExpansionOpportunities: [
      ...(topic?.researchPlan.futureExpansionDirections ?? []).slice(0, 4),
      ...memory.discoveryWorkflows.adjacentResearchOpportunities.slice(0, 3)
    ].slice(0, 7),
    downstreamResearchPathways: [
      "문헌지도/계량분석으로 지식 구조 정리",
      "핵심 변수의 실증 검증",
      "다른 표본·국가·제도 맥락 비교",
      "실무 또는 정책 개입 가능성 평가"
    ],
    impactBoundary: "임팩트 지능은 연구 커뮤니티와 후속 경로를 추정하는 전략 도구입니다. 실제 인용, 정책 영향, 학회 채택을 보장하지 않습니다."
  };
}

export function buildPredictiveAcademicIntelligence(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  trendAnalysis: TrendAnalysis;
  competitionIntelligence: ResearchCompetitionIntelligence;
  bibliometricAnalysis: BibliometricAnalysis;
  graph: TheoryGraph;
  publicationIntelligence: PublicationIntelligence;
  persistentMemory: PersistentScholarlyMemory;
  methodology: Methodology;
  discipline: Discipline;
  strategy: ResearchStrategy;
}): PredictiveAcademicIntelligence {
  const forecasting = buildForecasting(
    params.synthesis,
    params.trendAnalysis,
    params.competitionIntelligence,
    params.bibliometricAnalysis,
    params.graph,
    params.persistentMemory,
    params.methodology
  );
  const publicationOutcomes = buildPublicationOutcomes(params.topics, params.papers, params.graph, params.publicationIntelligence, params.methodology);
  const advancedEvaluation = buildAdvancedEvaluation(params.topics, params.papers, params.graph, params.methodology);
  const optimizationVariants = buildOptimizationVariants(params.topics, params.methodology);
  const strategySimulations = buildStrategySimulations(optimizationVariants, params.discipline, params.strategy);
  const impactIntelligence = buildImpactIntelligence(params.topics, forecasting, params.persistentMemory, params.discipline);

  return {
    forecasting,
    publicationOutcomes,
    advancedEvaluation,
    optimizationVariants,
    strategySimulations,
    impactIntelligence,
    comparativeScenarioAnalysis: strategySimulations
      .sort((a, b) => b.comparativeScore - a.comparativeScore)
      .slice(0, 4)
      .map((scenario, index) => `${index + 1}. ${scenario.scenario}: 비교 점수 ${scenario.comparativeScore}/10. ${scenario.predictedUpside}`),
    predictionBoundary: "Predictive Academic Intelligence는 검색 메타데이터, 그래프, 메모리, 토픽 점수를 결합한 휴리스틱 예측 엔진입니다. 게재 성공, 인용 수, hot topic 미래값, 학술 영향력을 보장하지 않으며 모든 예측은 검증 가능한 연구 전략 초안으로만 사용해야 합니다."
  };
}
