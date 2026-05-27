import type {
  BibliometricAnalysis,
  DatasetIntelligence,
  DatasetRecommendation,
  Discipline,
  ExportBundle,
  Gap,
  LongTermResearchRoadmap,
  Methodology,
  PublicationIntelligence,
  PublicationVenueRecommendation,
  ResearchCompetitionIntelligence,
  ResearchStrategy,
  RetrievedPaper,
  Synthesis,
  Topic,
  TrendAnalysis
} from "./types";
import { methodologyLabels } from "./domain";

export const strategyLabels: Record<ResearchStrategy, string> = {
  "beginner-safe research": "초보자 안전형",
  "high-impact/high-risk research": "고임팩트/고위험",
  "fast publishable topics": "빠른 출판 가능형",
  "interdisciplinary innovation": "융합 혁신형",
  "practitioner-oriented research": "실무 지향형",
  "theory-heavy research": "이론 중심형"
};

const datasetCatalog: Partial<Record<Discipline, DatasetRecommendation[]>> = {
  education: [
    {
      name: "OECD PISA Database",
      sourceUrl: "https://www.oecd.org/pisa/",
      type: "public dataset",
      suitability: "학습성과, 학생 배경, 학교 맥락 변수를 활용한 교육 성과 연구에 적합합니다.",
      sampleType: "국가/학교/학생 단위 국제 비교 표본",
      estimatedSampleSizeGuidance: "공개 마이크로데이터는 대규모 표본이지만, 연구문제에 맞는 국가·연도·변수 필터링이 필요합니다.",
      difficulty: "medium",
      ethicalNotes: "공개 이용 조건과 가중치/복합표본 설계를 확인해야 합니다.",
      evidence: "공식 OECD PISA 데이터 소스 후보입니다. 자기효능감 변수가 항상 포함된다고 가정하지 말고 코드북 확인이 필요합니다."
    },
    {
      name: "OECD TALIS Database",
      sourceUrl: "https://www.oecd.org/en/about/programmes/talis.html",
      type: "public dataset",
      suitability: "교사, 학교, 교수학습 환경, 전문성 개발 연구에 적합합니다.",
      sampleType: "교사/학교장 설문 표본",
      estimatedSampleSizeGuidance: "국가별 표본과 층화 설계를 반영해 분석해야 합니다.",
      difficulty: "medium",
      ethicalNotes: "공식 사용자 가이드와 익명화 조건을 확인해야 합니다.",
      evidence: "공식 OECD TALIS 데이터 소스 후보입니다."
    },
    {
      name: "UNESCO UIS Data Browser",
      sourceUrl: "https://databrowser.uis.unesco.org/",
      type: "public dataset",
      suitability: "국가 수준 교육 접근성, 완수율, 형평성, SDG4 지표 분석에 적합합니다.",
      sampleType: "국가/연도 단위 집계 지표",
      estimatedSampleSizeGuidance: "국가-연도 패널 구조로 구성해 결측과 정의 차이를 점검해야 합니다.",
      difficulty: "low",
      ethicalNotes: "집계 공개자료지만 지표 정의와 최신 갱신일을 확인해야 합니다.",
      evidence: "UNESCO Institute for Statistics 공식 데이터 브라우저 후보입니다."
    },
    {
      name: "World Bank EdStats",
      sourceUrl: "https://datatopics.worldbank.org/education/",
      type: "public dataset",
      suitability: "교육 접근성, 지출, 형평성, 국가 비교 연구에 적합합니다.",
      sampleType: "국가/연도 단위 교육 통계",
      estimatedSampleSizeGuidance: "패널 분석은 국가 수, 연도 수, 결측률을 기준으로 가능성을 판단해야 합니다.",
      difficulty: "low",
      ethicalNotes: "공개 집계자료이며 변수 정의와 출처를 확인해야 합니다.",
      evidence: "World Bank Education Statistics 공식 포털 후보입니다."
    }
  ],
  "AI/data science": [
    {
      name: "OpenAlex Works API",
      sourceUrl: "https://docs.openalex.org/",
      type: "public dataset",
      suitability: "문헌 계량, 인용, 연구동향, 토픽 진화 분석에 적합합니다.",
      sampleType: "학술 메타데이터/API 레코드",
      estimatedSampleSizeGuidance: "검색식과 필터 기준에 따라 수백~수천 건 이상으로 확장할 수 있습니다.",
      difficulty: "medium",
      ethicalNotes: "API 이용 정책과 재현 가능한 쿼리 기록을 유지해야 합니다.",
      evidence: "현재 앱이 사용하는 OpenAlex 기반 자료 수집 경로입니다."
    }
  ],
  "computer science": [
    {
      name: "OpenAlex Works API",
      sourceUrl: "https://docs.openalex.org/",
      type: "public dataset",
      suitability: "CS/HCI/AI 문헌 지형과 인용 네트워크 분석에 적합합니다.",
      sampleType: "학술 메타데이터/API 레코드",
      estimatedSampleSizeGuidance: "분야/연도/키워드 필터를 명확히 정의해야 합니다.",
      difficulty: "medium",
      ethicalNotes: "검색식과 필터를 기록하고 API 정책을 준수해야 합니다.",
      evidence: "현재 검색 문헌과 같은 OpenAlex 계열 데이터입니다."
    }
  ],
  musicology: [
    {
      name: "MusicBrainz",
      sourceUrl: "https://musicbrainz.org/",
      type: "public dataset",
      suitability: "음반, 아티스트, 작품, 녹음 메타데이터를 활용한 음악 생태계·장르·네트워크 연구에 적합합니다.",
      sampleType: "음악 메타데이터 레코드",
      estimatedSampleSizeGuidance: "연구 범위를 장르, 시대, 지역, 아티스트 유형으로 제한하고 중복/식별자 정리를 먼저 수행해야 합니다.",
      difficulty: "medium",
      ethicalNotes: "공개 메타데이터라도 라이선스와 재사용 조건을 확인해야 합니다.",
      evidence: "MusicBrainz 공개 음악 메타데이터 소스 후보입니다."
    },
    {
      name: "IMSLP / Petrucci Music Library",
      sourceUrl: "https://imslp.org/",
      type: "public dataset",
      suitability: "악보·작곡가·작품 메타데이터를 활용한 레퍼토리, 양식, 역사 음악학 연구 후보입니다.",
      sampleType: "악보/작품/작곡가 아카이브 자료",
      estimatedSampleSizeGuidance: "작곡가, 시대, 장르, 악기 편성 기준으로 코퍼스를 좁히고 저작권 상태를 먼저 확인해야 합니다.",
      difficulty: "medium",
      ethicalNotes: "국가별 저작권 상태와 다운로드/재사용 조건을 반드시 확인해야 합니다.",
      evidence: "IMSLP 공개 악보 아카이브 후보입니다."
    },
    {
      name: "OpenAlex Works API",
      sourceUrl: "https://docs.openalex.org/",
      type: "public dataset",
      suitability: "음악학 문헌 지형, 인용, 연구동향, 저널/키워드 분석에 적합합니다.",
      sampleType: "학술 메타데이터/API 레코드",
      estimatedSampleSizeGuidance: "musicology, ethnomusicology, music cognition 등 검색식을 분리해 재현 가능한 문헌 코퍼스를 구성해야 합니다.",
      difficulty: "medium",
      ethicalNotes: "API 정책과 검색식 기록을 유지해야 합니다.",
      evidence: "현재 앱이 사용하는 OpenAlex 기반 자료 수집 경로입니다."
    }
  ]
};

function clamp(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function textFor(paper: RetrievedPaper): string {
  return `${paper.title} ${paper.abstract} ${paper.concepts.join(" ")}`.toLowerCase();
}

function strategyBias(strategy: ResearchStrategy): { novelty: number; feasibility: number; publishability: number; practice: number; theory: number } {
  switch (strategy) {
    case "high-impact/high-risk research":
      return { novelty: 2, feasibility: -1, publishability: 0, practice: 0, theory: 1 };
    case "fast publishable topics":
      return { novelty: -1, feasibility: 2, publishability: 2, practice: 0, theory: 0 };
    case "interdisciplinary innovation":
      return { novelty: 2, feasibility: 0, publishability: 0, practice: 0, theory: 1 };
    case "practitioner-oriented research":
      return { novelty: 0, feasibility: 1, publishability: 0, practice: 2, theory: -1 };
    case "theory-heavy research":
      return { novelty: 1, feasibility: 0, publishability: 0, practice: -1, theory: 2 };
    case "beginner-safe research":
    default:
      return { novelty: -1, feasibility: 2, publishability: 1, practice: 1, theory: 0 };
  }
}

export function orderGapsByStrategy(gaps: Gap[], strategy: ResearchStrategy): Gap[] {
  const priority: Record<ResearchStrategy, Gap["type"][]> = {
    "beginner-safe research": ["weak_methodology_coverage", "underexplored_intersection", "emerging_immature_domain", "sparse_theory_combination"],
    "high-impact/high-risk research": ["sparse_theory_combination", "emerging_immature_domain", "underexplored_intersection", "weak_methodology_coverage"],
    "fast publishable topics": ["weak_methodology_coverage", "underexplored_intersection", "sparse_theory_combination", "emerging_immature_domain"],
    "interdisciplinary innovation": ["sparse_theory_combination", "underexplored_intersection", "emerging_immature_domain", "weak_methodology_coverage"],
    "practitioner-oriented research": ["weak_methodology_coverage", "emerging_immature_domain", "underexplored_intersection", "sparse_theory_combination"],
    "theory-heavy research": ["sparse_theory_combination", "underexplored_intersection", "emerging_immature_domain", "weak_methodology_coverage"]
  };
  return [...gaps].sort((a, b) => priority[strategy].indexOf(a.type) - priority[strategy].indexOf(b.type));
}

export function tuneTopicForStrategy(topic: Topic, strategy: ResearchStrategy): Topic {
  const bias = strategyBias(strategy);
  const label = strategyLabels[strategy];
  return {
    ...topic,
    title: `[${label}] ${topic.title}`,
    rationale: `${topic.rationale} 전략 모드: ${label}.`,
    scores: {
      ...topic.scores,
      novelty: clamp(topic.scores.novelty + bias.novelty),
      feasibility: clamp(topic.scores.feasibility + bias.feasibility),
      publishability: clamp(topic.scores.publishability + bias.publishability)
    },
    publicationSuitabilityEstimate:
      strategy === "fast publishable topics"
        ? `${topic.publicationSuitabilityEstimate} 빠른 출판형에서는 범위를 좁히고 검색 근거가 있는 방법론을 우선합니다.`
        : strategy === "high-impact/high-risk research"
          ? `${topic.publicationSuitabilityEstimate} 고위험형에서는 선행연구 지지 약점을 명시적으로 방어해야 합니다.`
          : topic.publicationSuitabilityEstimate,
    risksLimitations: [
      ...topic.risksLimitations,
      strategy === "beginner-safe research"
        ? "초보자 안전형은 새로운 이론 주장보다 재현 가능한 설계와 명확한 데이터 접근성을 우선합니다."
        : strategy === "theory-heavy research"
          ? "이론 중심형은 개념 정의와 경쟁 프레임워크 비교가 약하면 설득력이 떨어질 수 있습니다."
          : `선택 전략(${label})에 맞게 범위, 데이터, 기여 주장을 조정해야 합니다.`
    ]
  };
}

export function buildPublicationIntelligence(
  papers: RetrievedPaper[],
  methodology: Methodology,
  strategy: ResearchStrategy
): PublicationIntelligence {
  const sourceMap = new Map<string, RetrievedPaper[]>();
  for (const paper of papers) {
    if (!paper.source || paper.source === "OpenAlex") continue;
    sourceMap.set(paper.source, [...(sourceMap.get(paper.source) ?? []), paper]);
  }
  const recommendations: PublicationVenueRecommendation[] = [...sourceMap.entries()]
    .map(([name, sourcePapers]) => {
      const recentCount = sourcePapers.filter((paper) => paper.year && paper.year >= new Date().getFullYear() - 5).length;
      const totalCitations = sourcePapers.reduce((sum, paper) => sum + paper.citedByCount, 0);
      const lower = name.toLowerCase();
      const type: PublicationVenueRecommendation["type"] = /conference|proceedings|symposium|chi|iclr|neurips|sigcse/.test(lower) ? "conference" : "journal";
      const methodHits = sourcePapers.filter((paper) => textFor(paper).includes(methodology.toLowerCase()) || textFor(paper).includes(methodologyLabels[methodology].toLowerCase())).length;
      const methodologyFit = clamp(4 + methodHits * 2 + (strategy === "fast publishable topics" ? 1 : 0));
      const topicFit = clamp(4 + sourcePapers.length * 2 + recentCount);
      return {
        name,
        type,
        classification: "unknown" as const,
        classificationEvidence: "SSCI/SCI/Scopus 여부는 앱에서 검증하지 않습니다. 검색된 OpenAlex 출판원명만 근거로 표시합니다.",
        impactTrendEstimate: `검색 결과 내 ${sourcePapers.length}편, 최근 5년 ${recentCount}편, 총 OpenAlex 인용 ${totalCitations}회입니다.`,
        methodologyFit,
        topicFit,
        publishabilityReasoning: `이 출판원은 현재 검색 결과에 실제로 등장했습니다. 투고 적합성은 aims & scope, 최근 특집호, 방법론 기준을 별도로 확인해야 하며 게재 가능성을 보장하지 않습니다.`,
        evidencePaperIds: sourcePapers.map((paper) => paper.id)
      };
    })
    .sort((a, b) => b.topicFit + b.methodologyFit - (a.topicFit + a.methodologyFit))
    .slice(0, 10);

  return {
    journals: recommendations.filter((item) => item.type === "journal").slice(0, 6),
    conferences: recommendations.filter((item) => item.type === "conference").slice(0, 4),
    publishabilityReasoning: [
      `선택 방법론 ${methodologyLabels[methodology]}와 전략 ${strategyLabels[strategy]}를 반영했습니다.`,
      "추천은 검색된 출판원 출현 빈도와 최근성 기반이며, 색인/랭킹/게재 가능성은 외부 확인이 필요합니다."
    ],
    warnings: ["저널·학회명은 OpenAlex 검색 결과에서 가져온 실제 출판원입니다.", "SSCI/SCI/Scopus 분류는 자동 확정하지 않습니다."]
  };
}

export function buildDatasetIntelligence(discipline: Discipline, methodology: Methodology, strategy: ResearchStrategy, papers: RetrievedPaper[]): DatasetIntelligence {
  const disciplineCatalog = datasetCatalog[discipline] ?? [];
  const base = [
    ...disciplineCatalog,
    ...(disciplineCatalog.length === 0 && discipline !== "education" ? datasetCatalog.education ?? [] : []),
    ...(datasetCatalog["AI/data science"] ?? [])
  ];
  const deduped = [...new Map(base.map((item) => [item.name, item])).values()].slice(0, 6);
  const isQual = ["qualitative", "grounded theory", "thematic analysis", "discourse analysis", "narrative inquiry", "phenomenology", "ethnography", "case study"].includes(methodology);
  const isExperiment = ["experimental design", "quasi-experimental design", "causal inference"].includes(methodology);
  const difficulty = strategy === "fast publishable topics" && deduped.length > 0 ? "low" : isExperiment ? "high" : "medium";
  return {
    recommendations: deduped,
    surveyInterviewSuitability: isQual ? "인터뷰/포커스그룹 적합도가 높습니다. 표본 수보다 포화, 코딩 신뢰도, 윤리가 중요합니다." : "설문은 변수 구조와 척도 타당도가 명확할 때 적합합니다.",
    experimentalFeasibility: isExperiment ? "실험/준실험 설계가 전략상 유효하지만 IRB, 처치 설계, 표본 확보가 핵심 리스크입니다." : "실험은 가능하나 현재 선택 방법론에서는 필수 경로가 아닙니다.",
    apiScrapingPossibilities: "OpenAlex 같은 공개 API는 윤리적으로 사용 가능하지만, 웹 스크래핑은 robots.txt, 약관, 개인정보 여부를 확인한 경우에만 후보로 둡니다.",
    dataDifficultyEstimate: difficulty,
    sampleTypeRecommendations: [
      ...new Set([
        ...deduped.map((item) => item.sampleType),
        papers.some((paper) => paper.institutions.length > 0) ? "기관/국가 메타데이터 기반 문헌 표본" : "검색 문헌 메타데이터 표본"
      ])
    ].slice(0, 5)
  };
}

export function buildLongTermRoadmap(topics: Topic[], synthesis: Synthesis, strategy: ResearchStrategy): LongTermResearchRoadmap {
  const safePaperIds = topics[0]?.evidencePaperIds ?? [];
  const topicTitles = topics.map((topic) => topic.title).slice(0, 3);
  return {
    strategy,
    shortTermPaperIdeas: topicTitles.map((title) => ({
      title: `${title}의 범위 축소 논문`,
      rationale: "단일 자료원과 명확한 변수 구조로 1편짜리 논문을 구성합니다.",
      evidence: "생성 토픽과 연결된 검색 근거를 기반으로 한 단기 실행안입니다.",
      paperIds: safePaperIds
    })),
    followUpStudyChains: [
      {
        title: "탐색 연구 → 실증 검증 → 맥락 비교",
        rationale: "초기 연구에서 개념 구조를 정리하고 후속 연구에서 다른 표본과 방법론으로 확장합니다.",
        evidence: `핵심 주제: ${synthesis.trends.slice(0, 3).map((item) => item.label).join(", ") || "명시 신호 부족"}`,
        paperIds: safePaperIds
      }
    ],
    dissertationThesisPathways: [
      {
        title: `${strategyLabels[strategy]} 박사/석사 논문 경로`,
        rationale: "문헌지도, 방법론 검증, 실증 연구, 확장 연구를 장별로 연결합니다.",
        evidence: "검색 문헌, 토픽 점수, 데이터 난이도를 종합한 장기 계획입니다.",
        paperIds: safePaperIds
      }
    ],
    futureExpansionDirections: synthesis.emergingTopics.slice(0, 3).map((item) => ({
      title: `${item.label} 확장 연구`,
      rationale: "최근 문헌에 나타나는 신호를 후속 연구의 맥락 변수로 확장합니다.",
      evidence: `${item.support}편의 최근 근거가 있습니다.`,
      paperIds: item.paperIds
    })),
    multiPaperResearchAgendas: [
      {
        title: "3편 연구 아젠다: 문헌지도, 실증모형, 개입/정책 함의",
        rationale: "한 주제를 계량 리뷰, 설명모형, 실천적 적용으로 단계화합니다.",
        evidence: "검색 근거와 생성 토픽을 묶은 장기 연구 포트폴리오입니다.",
        paperIds: safePaperIds
      }
    ],
    progressiveTheoryDevelopmentPaths: [
      {
        title: "이론 정교화 경로",
        rationale: "핵심 이론을 인접 이론과 연결한 뒤 매개/조절 구조를 단계적으로 검증합니다.",
        evidence: `감지 이론: ${synthesis.theories.slice(0, 3).map((item) => item.label).join(", ") || "명시 신호 부족"}`,
        paperIds: synthesis.theories.flatMap((item) => item.paperIds).slice(0, 8)
      }
    ]
  };
}

export function buildCompetitionIntelligence(
  synthesis: Synthesis,
  trendAnalysis: TrendAnalysis,
  bibliometric: BibliometricAnalysis
): ResearchCompetitionIntelligence {
  const highSaturation = bibliometric.saturation.level === "high";
  return {
    oversaturatedTopics: synthesis.trends.slice(0, 3).map((item) => ({
      label: item.label,
      level: highSaturation || item.support >= 8 ? "high" : "moderate",
      evidence: `${item.support}편에서 반복 감지되었습니다. 반복 빈도가 높을수록 차별화 부담이 큽니다.`,
      paperIds: item.paperIds
    })),
    rapidlyGrowingAreas: trendAnalysis.risingTopics.slice(0, 4).map((item) => ({
      label: item.label,
      level: item.recentCount >= 3 ? "high" : "moderate",
      evidence: `최근 출현 ${item.recentCount}, 이전 출현 ${item.priorCount}.`,
      paperIds: item.paperIds
    })),
    neglectedDomains: synthesis.relatedTheories.filter((item) => item.support <= 2).slice(0, 4).map((item) => ({
      label: item.label,
      level: "low",
      evidence: `검색 집합에서 ${item.support}편만 감지되어 저빈도 후보입니다.`,
      paperIds: item.paperIds
    })),
    highlyCompetitiveSpaces: synthesis.trends.slice(0, 3).map((item) => ({
      label: item.label,
      level: item.support >= 6 ? "high" : "moderate",
      evidence: "검색 결과에서 반복적으로 나타나는 중심 주제입니다. 차별화된 이론/방법론이 필요합니다.",
      paperIds: item.paperIds
    })),
    emergingOpportunities: synthesis.emergingTopics.slice(0, 4).map((item) => ({
      label: item.label,
      level: item.support <= 3 ? "moderate" : "high",
      evidence: `최근 문헌 내 ${item.support}편에서 감지된 부상 후보입니다.`,
      paperIds: item.paperIds
    })),
    decliningResearchTrends: trendAnalysis.decliningTopics.slice(0, 4).map((item) => ({
      label: item.label,
      level: "moderate",
      evidence: `이전 출현 ${item.priorCount}, 최근 출현 ${item.recentCount}.`,
      paperIds: item.paperIds
    }))
  };
}

export function buildExportBundle(topics: Topic[], papers: RetrievedPaper[], publication: PublicationIntelligence): ExportBundle {
  const markdown = [
    "# Research Strategy Export",
    "",
    "## Generated topics",
    ...topics.map((topic) => `### ${topic.title}\n\n${topic.rationale}\n\n**Research question:** ${topic.researchQuestion}\n\n**Evidence notice:** ${topic.inferenceNotice}`),
    "## Journal targeting",
    ...publication.journals.map((journal) => `- ${journal.name}: ${journal.publishabilityReasoning}`)
  ].join("\n\n");
  const bibtex = papers
    .slice(0, 12)
    .map((paper, index) => {
      const key = `openalex${index + 1}`;
      return `@misc{${key},\n  title = {${paper.title.replaceAll("{", "").replaceAll("}", "")}},\n  year = {${paper.year ?? "n.d."}},\n  url = {${paper.url}},\n  note = {OpenAlex metadata; verify before citation}\n}`;
    })
    .join("\n\n");
  return {
    markdown,
    bibtex,
    citationNote: "BibTeX는 OpenAlex 메타데이터 기반 초안입니다. 최종 인용 전 DOI, 저자, 학술지, 권호 정보를 반드시 확인하세요."
  };
}
