import type {
  AgenticResearchLoop,
  BibliometricAnalysis,
  Discipline,
  Gap,
  Methodology,
  RefinedTopicScores,
  ResearcherProfile,
  Synthesis,
  TheoryGraph,
  Topic,
  TopicCritique,
  TopicImprovementAction,
  TopicRefinementIteration,
  TopicRefinementResult
} from "./types";
import { methodologyLabels } from "./domain";
import { normalizeResearcherProfile } from "./self-improving";

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function averageScore(scores: RefinedTopicScores): number {
  return clamp((scores.novelty + scores.feasibility + scores.publishability + scores.theoryCoherence + scores.evidenceSupport) / 5);
}

function scoreDelta(after: RefinedTopicScores, before: RefinedTopicScores): RefinedTopicScores {
  return {
    novelty: after.novelty - before.novelty,
    feasibility: after.feasibility - before.feasibility,
    publishability: after.publishability - before.publishability,
    theoryCoherence: after.theoryCoherence - before.theoryCoherence,
    evidenceSupport: after.evidenceSupport - before.evidenceSupport
  };
}

function evidenceSupport(topic: Topic, graph: TheoryGraph): number {
  const paperSupport = Math.min(4, topic.evidencePaperIds.length);
  const theoryNode = graph.nodes.find((node) => node.label.toLowerCase() === topic.coreTheory.toLowerCase());
  const theorySupport = Math.min(3, theoryNode?.support ?? 0);
  const methodSupport = topic.methodologyRecommendations[0]?.fit ? Math.floor(topic.methodologyRecommendations[0].fit / 4) : 0;
  return clamp(2 + paperSupport + theorySupport + methodSupport);
}

function theoryCoherence(topic: Topic, synthesis: Synthesis): number {
  const coreSupport = synthesis.theories.find((item) => item.label.toLowerCase() === topic.coreTheory.toLowerCase())?.support ?? 0;
  return clamp(3 + Math.min(3, coreSupport) + Math.min(2, topic.adjacentTheories.length) + Math.min(2, topic.mediatorsModerators.length));
}

function refinedScoresFor(topic: Topic, graph: TheoryGraph, synthesis: Synthesis): RefinedTopicScores {
  return {
    novelty: topic.scores.novelty,
    feasibility: topic.scores.feasibility,
    publishability: topic.scores.publishability,
    theoryCoherence: theoryCoherence(topic, synthesis),
    evidenceSupport: evidenceSupport(topic, graph)
  };
}

function critiqueTopic(
  topic: Topic,
  graph: TheoryGraph,
  synthesis: Synthesis,
  bibliometric: BibliometricAnalysis
): TopicCritique[] {
  const critiques: TopicCritique[] = [];
  const topMethodFit = topic.methodologyRecommendations[0]?.fit ?? 0;
  const coreTheorySupport = synthesis.theories.find((item) => item.label.toLowerCase() === topic.coreTheory.toLowerCase())?.support ?? 0;

  if (coreTheorySupport <= 1 || topic.adjacentTheories.length < 2) {
    critiques.push({
      type: "weak_theory_grounding",
      severity: coreTheorySupport === 0 ? "high" : "medium",
      critique: "핵심 이론 또는 인접 이론 조합의 검색 근거가 약해 이론적 정당화가 취약할 수 있습니다.",
      evidence: `${topic.coreTheory} 직접 이론 신호 ${coreTheorySupport}편, 인접 이론 ${topic.adjacentTheories.length}개.`,
      generatedInference: "상위 이론 신호와 인접 프레임워크를 하나 더 연결해 이론 조합을 강화하는 편이 안전합니다."
    });
  }

  if (topic.scores.novelty <= 6) {
    critiques.push({
      type: "low_novelty",
      severity: topic.scores.novelty <= 4 ? "high" : "medium",
      critique: "현재 프레이밍은 참신성이 제한적으로 보일 수 있습니다.",
      evidence: `초기 참신성 점수 ${topic.scores.novelty}/10, 부상 주제 ${synthesis.emergingTopics[0]?.label ?? "명시 신호 부족"}.`,
      generatedInference: "부상 개념이나 약한 그래프 연결을 하나만 추가해 차별화 포인트를 좁히세요."
    });
  }

  if (topic.scores.saturation <= 5 || bibliometric.saturation.level === "high") {
    critiques.push({
      type: "oversaturation",
      severity: bibliometric.saturation.level === "high" ? "high" : "medium",
      critique: "반복적으로 다뤄진 주제처럼 보일 수 있어 차별화된 맥락·표본·방법론이 필요합니다.",
      evidence: `${bibliometric.saturation.evidence} 토픽 포화 점수 ${topic.scores.saturation}/10.`,
      generatedInference: "과포화 표현을 줄이고 덜 탐색된 교차점 중심으로 제목과 연구문제를 좁히세요."
    });
  }

  if (topMethodFit <= 6) {
    critiques.push({
      type: "weak_methodology_fit",
      severity: topMethodFit <= 4 ? "high" : "medium",
      critique: "선택 방법론과 변수 구조의 적합도가 충분히 강하지 않습니다.",
      evidence: `상위 방법론 적합도 ${topMethodFit}/10, 그래프 방법론 다양성 ${graph.metrics.methodologyDiversity}.`,
      generatedInference: "상위 추천 방법론 또는 더 단순한 대안 설계로 연구문제를 재정렬하세요."
    });
  }

  if (topic.scores.dataAvailability <= 6) {
    critiques.push({
      type: "poor_data_feasibility",
      severity: topic.scores.dataAvailability <= 4 ? "high" : "medium",
      critique: "자료 확보 가능성이 낮아 실제 연구 실행 리스크가 있습니다.",
      evidence: `자료 확보성 ${topic.scores.dataAvailability}/10, 데이터 난이도 ${topic.datasetIntelligence.dataDifficultyEstimate}.`,
      generatedInference: "공개자료, 단기 설문, 또는 문헌 메타데이터 분석처럼 접근 가능한 자료 경로를 먼저 제시하세요."
    });
  }

  if (topic.expectedContribution.length < 80 || topic.academicContribution.length < 80) {
    critiques.push({
      type: "unclear_contribution",
      severity: "medium",
      critique: "학술적 기여가 심사자에게 충분히 선명하게 보이지 않을 수 있습니다.",
      evidence: `기여문장 길이 ${topic.expectedContribution.length}자, 학술 기여문장 ${topic.academicContribution.length}자.`,
      generatedInference: "기여문장을 이론 조합, 방법론 보완, 실무 적용 중 하나로 명확히 재작성하세요."
    });
  }

  return critiques.length > 0
    ? critiques
    : [
        {
          type: "unclear_contribution",
          severity: "low",
          critique: "큰 결함은 감지되지 않았지만, 기여문장을 더 명확하게 만들 여지가 있습니다.",
          evidence: `초기 점수: 참신성 ${topic.scores.novelty}, 실행가능성 ${topic.scores.feasibility}, 출판가능성 ${topic.scores.publishability}.`,
          generatedInference: "토픽의 강점은 유지하되 연구문제와 기여문장을 더 짧고 검증 가능하게 정리하세요."
        }
      ];
}

function chooseAdjacentTheory(topic: Topic, synthesis: Synthesis): string {
  return (
    topic.adjacentTheories[0] ??
    synthesis.theories.find((item) => item.label.toLowerCase() !== topic.coreTheory.toLowerCase())?.label ??
    synthesis.relatedTheories[0]?.label ??
    "인접 프레임워크"
  );
}

function chooseMediator(topic: Topic, synthesis: Synthesis): string {
  return topic.mediatorsModerators[0] ?? synthesis.trends[0]?.label ?? synthesis.emergingTopics[0]?.label ?? "맥락 요인";
}

function buildActions(topic: Topic, critiques: TopicCritique[], synthesis: Synthesis, gaps: Gap[]): TopicImprovementAction[] {
  const adjacent = chooseAdjacentTheory(topic, synthesis);
  const mediator = chooseMediator(topic, synthesis);
  const gapEvidence = gaps[0]?.evidence ?? topic.inferenceNotice;
  const actions: TopicImprovementAction[] = [
    {
      action: "strengthen_theory_combination",
      recommendation: `${topic.coreTheory}를 중심 이론으로 유지하되 ${adjacent}를 보조 프레임워크로 명시하세요.`,
      rationale: "약한 이론 기반 비평을 줄이고 이론 조합의 역할 차이를 선명하게 만듭니다.",
      evidence: synthesis.theories.slice(0, 3).map((item) => `${item.label} ${item.support}편`).join(", ") || "이론 신호 부족"
    },
    {
      action: "refine_research_question",
      recommendation: `연구문제를 '${topic.coreTheory}, ${adjacent}, ${mediator}가 어떤 조건에서 핵심 결과를 설명하는가?'로 좁히세요.`,
      rationale: "연구문제가 좁아지면 변수 구조와 검증 전략이 명확해집니다.",
      evidence: gapEvidence
    },
    {
      action: "improve_methodology_fit",
      recommendation: `${topic.methodologyRecommendations[0]?.method ?? topic.recommendedMethodology}를 우선 검토하고, 표본/측정/분석 단계를 먼저 명시하세요.`,
      rationale: "방법론 적합도 비평을 실행 가능한 설계 요소로 전환합니다.",
      evidence: topic.methodologyRecommendations[0]?.evidence ?? "방법론 추천 근거가 제한적입니다."
    },
    {
      action: "reduce_oversaturated_framing",
      recommendation: "넓은 유행어 중심 제목보다 특정 맥락, 표본, 매개/조절 구조를 제목에 반영하세요.",
      rationale: "과포화 주제처럼 보이는 위험을 낮추고 기여 지점을 좁힙니다.",
      evidence: critiques.find((critique) => critique.type === "oversaturation")?.evidence ?? "포화 비평은 낮지만 차별화는 여전히 필요합니다."
    },
    {
      action: "add_mediator_moderator",
      recommendation: `${mediator}를 매개/조절 후보로 명시하고 측정 가능성을 원문 검토로 확인하세요.`,
      rationale: "변수 관계가 더 연구 가능한 개념모형으로 바뀝니다.",
      evidence: `${mediator}는 검색 문헌의 트렌드/변수 후보에서 나온 생성 추론입니다.`
    },
    {
      action: "propose_variant",
      recommendation: "안전형은 공개자료/설문 기반으로, 참신형은 약한 이론 연결과 부상 개념을 전면화하세요.",
      rationale: "동일 토픽에서 리스크 허용도별 대안을 비교할 수 있습니다.",
      evidence: topic.evidencePaperIds.length > 0 ? `연결 근거 ${topic.evidencePaperIds.length}편.` : "직접 연결 근거가 부족합니다."
    }
  ];
  const needed = new Set(critiques.map((critique) => critique.type));
  if (needed.has("weak_methodology_fit")) return actions;
  return actions;
}

function improveTopic(
  topic: Topic,
  critiques: TopicCritique[],
  actions: TopicImprovementAction[],
  synthesis: Synthesis,
  methodology: Methodology,
  profile: ResearcherProfile
): Topic {
  const adjacent = chooseAdjacentTheory(topic, synthesis);
  const mediator = chooseMediator(topic, synthesis);
  const method = topic.methodologyRecommendations[0]?.method ?? methodology;
  const hasNoveltyCritique = critiques.some((critique) => critique.type === "low_novelty");
  const hasFeasibilityCritique = critiques.some((critique) => critique.type === "poor_data_feasibility" || critique.type === "weak_methodology_fit");
  const titlePrefix = profile.noveltyTolerance === "high" ? "[재정제-고참신성]" : profile.noveltyTolerance === "low" ? "[재정제-안전형]" : "[재정제]";
  const addedAdjacent = [...new Set([adjacent, ...topic.adjacentTheories])].filter(Boolean).slice(0, 5);
  const addedMediators = [...new Set([mediator, ...topic.mediatorsModerators])].filter(Boolean).slice(0, 4);

  return {
    ...topic,
    title: `${titlePrefix} ${topic.coreTheory}와 ${adjacent}를 결합한 ${methodologyLabels[methodology]} 설계: ${mediator}의 역할`,
    rationale: `${topic.rationale} 개선 루프는 ${critiques.map((critique) => critique.type).join(", ")} 비평을 반영해 이론 조합, 연구문제, 방법론 적합도를 보강했습니다.`,
    researchQuestion: `${topic.coreTheory}와 ${adjacent}는 ${mediator}를 통해 ${topic.variables.at(-1) ?? "핵심 결과"}를 어떻게 설명하는가?`,
    hypotheses: [
      `${topic.coreTheory}는 ${topic.variables.at(-1) ?? "핵심 결과"}와 유의한 관련성을 보일 것이다.`,
      `${mediator}는 ${topic.coreTheory}와 ${topic.variables.at(-1) ?? "핵심 결과"} 간 관계를 매개 또는 조절할 것이다.`,
      `${adjacent}는 ${topic.coreTheory} 중심 설명의 경계조건을 보완할 것이다.`
    ],
    recommendedMethodology: method as Methodology,
    adjacentTheories: addedAdjacent,
    mediatorsModerators: addedMediators,
    variables: [...new Set([topic.coreTheory, adjacent, mediator, ...topic.variables])].slice(0, 7),
    expectedContribution: `${topic.coreTheory} 중심 설명을 ${adjacent}와 연결하고 ${mediator}의 역할을 명시해 이론 조합의 정합성과 검증 가능성을 높입니다.`,
    risksLimitations: [
      ...topic.risksLimitations.slice(0, 2),
      "개선판은 생성 추론이며, 실제 이론 관계와 측정 타당도는 원문 검토와 데이터로 확인해야 합니다."
    ],
    academicContribution: `${topic.academicContribution} 개선판은 ${adjacent}와 ${mediator}를 통해 기여 지점을 더 좁힌 연구계획 초안입니다.`,
    scores: {
      ...topic.scores,
      novelty: clamp(topic.scores.novelty + (hasNoveltyCritique ? 1 : 0) + (profile.noveltyTolerance === "high" ? 1 : 0)),
      feasibility: clamp(topic.scores.feasibility + (hasFeasibilityCritique ? 1 : 0) + (profile.noveltyTolerance === "low" ? 1 : 0)),
      publishability: clamp(topic.scores.publishability + 1),
      dataAvailability: clamp(topic.scores.dataAvailability + (hasFeasibilityCritique ? 1 : 0)),
      saturation: clamp(topic.scores.saturation + (critiques.some((critique) => critique.type === "oversaturation") ? 1 : 0))
    },
    inferenceNotice: `${topic.inferenceNotice} 이 개선판은 검색 근거와 비평 규칙으로 재작성된 생성 추론이며, 새로운 논문·인용을 만들지 않습니다.`
  };
}

function iterationHistory(topic: Topic, improvedTopic: Topic, critiques: TopicCritique[], refinedScores: RefinedTopicScores): TopicRefinementIteration[] {
  return [
    {
      iteration: 1,
      stage: "generate",
      summary: `초기 토픽 생성: ${topic.title}`,
      evidenceBoundary: topic.inferenceNotice
    },
    {
      iteration: 2,
      stage: "critique",
      summary: `${critiques.length}개의 비평을 생성했습니다: ${critiques.map((critique) => critique.type).join(", ")}.`,
      evidenceBoundary: "비평은 검색 근거 수, 그래프 신호, 기존 점수, 방법론 추천 적합도를 사용한 생성 추론입니다."
    },
    {
      iteration: 3,
      stage: "improve",
      summary: `개선 토픽: ${improvedTopic.title}`,
      evidenceBoundary: improvedTopic.inferenceNotice
    },
    {
      iteration: 4,
      stage: "rescore",
      summary: `재점수화 결과: 참신성 ${refinedScores.novelty}, 실행가능성 ${refinedScores.feasibility}, 출판가능성 ${refinedScores.publishability}, 이론 정합성 ${refinedScores.theoryCoherence}, 근거 지지 ${refinedScores.evidenceSupport}.`,
      evidenceBoundary: "점수는 휴리스틱입니다. 실제 학술 품질이나 출판 결과를 보장하지 않습니다."
    },
    {
      iteration: 5,
      stage: "compare",
      summary: "초기안과 개선안을 비교해 재정렬 후보를 만들었습니다.",
      evidenceBoundary: "비교는 같은 검색 근거 안에서 수행되며 외부 논문을 추가 생성하지 않습니다."
    }
  ];
}

function refineOneTopic(
  topic: Topic,
  index: number,
  graph: TheoryGraph,
  synthesis: Synthesis,
  bibliometric: BibliometricAnalysis,
  gaps: Gap[],
  methodology: Methodology,
  profile: ResearcherProfile
): TopicRefinementResult {
  const critiques = critiqueTopic(topic, graph, synthesis, bibliometric);
  const improvementActions = buildActions(topic, critiques, synthesis, gaps);
  const initialScores = refinedScoresFor(topic, graph, synthesis);
  const improvedTopic = improveTopic(topic, critiques, improvementActions, synthesis, methodology, profile);
  const refinedScores = refinedScoresFor(improvedTopic, graph, synthesis);
  const delta = scoreDelta(refinedScores, initialScores);
  const adjacent = chooseAdjacentTheory(topic, synthesis);
  const mediator = chooseMediator(topic, synthesis);

  return {
    topicId: `refinement-${index + 1}`,
    initialTopic: topic,
    critiques,
    improvementActions,
    improvedTopic,
    initialScores,
    refinedScores,
    scoreDelta: delta,
    comparisonSummary: `개선안은 ${adjacent}와 ${mediator}를 명시해 이론 정합성 ${delta.theoryCoherence >= 0 ? "+" : ""}${delta.theoryCoherence}, 근거 지지 ${delta.evidenceSupport >= 0 ? "+" : ""}${delta.evidenceSupport}, 출판가능성 ${delta.publishability >= 0 ? "+" : ""}${delta.publishability}로 재평가되었습니다.`,
    saferVariant: `${topic.coreTheory}를 유지하고 ${methodologyLabels[methodology]} 또는 ${topic.methodologyRecommendations[0]?.method ?? "단순 회귀/설문"}로 검증 가능한 변수만 남기는 안전형 변형.`,
    novelVariant: `${adjacent}와 ${synthesis.emergingTopics[0]?.label ?? mediator}를 결합해 약한 이론 연결을 전면화하는 고참신성 변형.`,
    iterationHistory: iterationHistory(topic, improvedTopic, critiques, refinedScores),
    evidencePaperIds: topic.evidencePaperIds
  };
}

export function buildAgenticResearchLoop(params: {
  topics: Topic[];
  graph: TheoryGraph;
  synthesis: Synthesis;
  bibliometricAnalysis: BibliometricAnalysis;
  gaps: Gap[];
  methodology: Methodology;
  discipline: Discipline;
  researcherProfile?: Partial<ResearcherProfile>;
}): AgenticResearchLoop {
  const profile = normalizeResearcherProfile(params.researcherProfile);
  const topicRefinements = params.topics.map((topic, index) =>
    refineOneTopic(topic, index, params.graph, params.synthesis, params.bibliometricAnalysis, params.gaps, params.methodology, profile)
  );
  const rerankedTopics = topicRefinements
    .map((item) => ({
      title: item.improvedTopic.title,
      overallScore: averageScore(item.refinedScores),
      rank: 0,
      rationale: `${item.critiques.length}개 비평을 반영했고, ${item.comparisonSummary}`
    }))
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    loopId: `research-loop-${Date.now()}`,
    workflow: [
      {
        iteration: 1,
        stage: "generate",
        summary: "기존 RIS 파이프라인이 초기 연구주제를 생성했습니다.",
        evidenceBoundary: "초기 토픽은 OpenAlex 검색 메타데이터와 기존 갭/방법론/점수 로직을 사용합니다."
      },
      {
        iteration: 2,
        stage: "critique",
        summary: "각 토픽을 이론 기반, 참신성, 포화도, 방법론 적합도, 데이터 가능성, 기여 선명도로 비평했습니다.",
        evidenceBoundary: "비평은 점수와 검색 신호 기반이며 원문에 없는 주장을 만들지 않습니다."
      },
      {
        iteration: 3,
        stage: "improve",
        summary: "이론 조합, 연구문제, 방법론, 매개/조절 후보, 안전형/참신형 변형을 생성했습니다.",
        evidenceBoundary: "개선안은 연구계획 초안입니다. 새 논문이나 인용은 생성하지 않습니다."
      },
      {
        iteration: 4,
        stage: "rescore",
        summary: "개선 토픽을 참신성, 실행가능성, 출판가능성, 이론 정합성, 근거 지지로 재점수화했습니다.",
        evidenceBoundary: "재점수는 투명한 휴리스틱이며 실제 성과 예측이 아닙니다."
      },
      {
        iteration: 5,
        stage: "compare",
        summary: "개선 토픽을 종합점수 기준으로 재정렬했습니다.",
        evidenceBoundary: "재정렬은 현재 검색 결과 내부 비교입니다."
      }
    ],
    topicRefinements,
    rerankedTopics,
    loopBoundary: "이 agentic self-improving loop는 검색된 OpenAlex 근거, 기존 RIS 점수, 그래프/계량 신호를 사용한 규칙 기반 반복 개선입니다. 원문에 없는 논문·인용·효과를 만들지 않으며, 점수 향상은 연구계획 품질 가정의 변화이지 입증된 학술 성과가 아닙니다."
  };
}
