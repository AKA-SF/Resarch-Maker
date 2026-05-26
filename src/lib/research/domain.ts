import type { Discipline, DomainIntelligence, Methodology, RecommendedMethod, ResearchDesignGuidance, Topic } from "./types";

export const disciplineLabels: Record<Discipline, string> = {
  education: "교육학",
  psychology: "심리학",
  "business/management": "경영학/관리",
  marketing: "마케팅",
  finance: "재무/금융",
  economics: "경제학",
  sociology: "사회학",
  "political science": "정치학",
  "public policy": "공공정책",
  "communication/media": "커뮤니케이션/미디어",
  HCI: "HCI",
  "computer science": "컴퓨터과학",
  "information systems": "정보시스템",
  "healthcare/public health": "보건의료/공중보건",
  nursing: "간호학",
  "law/legal studies": "법학/법정책",
  "environmental studies": "환경학",
  sustainability: "지속가능성",
  engineering: "공학",
  "AI/data science": "AI/데이터사이언스",
  "interdisciplinary research": "융합연구",
  business: "경영학",
  CS: "컴퓨터과학",
  interdisciplinary: "융합연구"
};

export const methodologyLabels: Record<Methodology, string> = {
  quantitative: "양적 연구(일반)",
  qualitative: "질적 연구(일반)",
  mixed: "혼합 연구(일반)",
  SEM: "SEM",
  "PLS-SEM": "PLS-SEM",
  regression: "회귀분석",
  "multilevel modeling": "다층모형",
  "panel analysis": "패널분석",
  "longitudinal analysis": "종단분석",
  "experimental design": "실험설계",
  "quasi-experimental design": "준실험설계",
  "causal inference": "인과추론",
  econometrics: "계량경제학",
  "Bayesian analysis": "베이지안 분석",
  "time-series analysis": "시계열 분석",
  "network analysis": "네트워크 분석",
  "grounded theory": "근거이론",
  "thematic analysis": "주제분석",
  "discourse analysis": "담론분석",
  "narrative inquiry": "내러티브 탐구",
  phenomenology: "현상학",
  ethnography: "민족지학",
  "case study": "사례연구",
  "content analysis": "내용분석",
  "mixed methods": "혼합방법",
  "systematic review": "체계적 문헌고찰",
  "scoping review": "범위문헌고찰",
  "meta-analysis": "메타분석",
  "bibliometric analysis": "계량서지분석",
  "scientometric analysis": "과학계량분석"
};

export const methodologySignals: Partial<Record<Methodology, string[]>> = {
  quantitative: ["survey", "experiment", "regression", "structural equation", "sem", "quantitative", "scale"],
  qualitative: ["interview", "focus group", "ethnograph", "qualitative", "thematic", "phenomenolog", "narrative"],
  mixed: ["mixed method", "mixed-method", "triangulation"],
  SEM: ["structural equation", "sem", "measurement model", "latent variable"],
  "PLS-SEM": ["pls-sem", "partial least squares", "pls sem"],
  regression: ["regression", "linear model", "logistic regression"],
  "multilevel modeling": ["multilevel", "hierarchical linear", "mixed effects"],
  "panel analysis": ["panel data", "fixed effects", "random effects"],
  "longitudinal analysis": ["longitudinal", "growth curve", "repeated measures"],
  "experimental design": ["experiment", "randomized", "randomised", "treatment group"],
  "quasi-experimental design": ["quasi-experiment", "difference-in-differences", "propensity score"],
  "causal inference": ["causal inference", "instrumental variable", "regression discontinuity"],
  econometrics: ["econometric", "panel data", "instrumental variable", "difference-in-differences"],
  "Bayesian analysis": ["bayesian", "posterior", "prior distribution"],
  "time-series analysis": ["time series", "arima", "forecasting"],
  "network analysis": ["network analysis", "social network", "centrality"],
  "grounded theory": ["grounded theory", "constant comparative"],
  "thematic analysis": ["thematic analysis", "themes", "coding"],
  "discourse analysis": ["discourse analysis", "critical discourse"],
  "narrative inquiry": ["narrative inquiry", "narrative analysis"],
  phenomenology: ["phenomenology", "lived experience"],
  ethnography: ["ethnography", "participant observation"],
  "case study": ["case study", "case-study"],
  "content analysis": ["content analysis", "coding scheme"],
  "mixed methods": ["mixed methods", "mixed-method", "triangulation"],
  "systematic review": ["systematic review", "literature review", "prisma"],
  "scoping review": ["scoping review", "mapping review"],
  "meta-analysis": ["meta-analysis", "meta analysis", "effect size"],
  "bibliometric analysis": ["bibliometric", "co-citation", "bibliographic coupling"],
  "scientometric analysis": ["scientometric", "science mapping", "citation network"]
};

export const theorySignals = [
  "self-efficacy",
  "social cognitive theory",
  "technology acceptance model",
  "tam",
  "constructivism",
  "self-determination theory",
  "cognitive load",
  "expectancy-value",
  "planned behavior",
  "innovation diffusion",
  "community of inquiry",
  "learning analytics",
  "human-computer interaction",
  "institutional theory",
  "resource-based view",
  "stakeholder theory",
  "agency theory",
  "prospect theory",
  "diffusion of innovations",
  "uses and gratifications",
  "agenda-setting",
  "social capital",
  "policy feedback",
  "behavioral economics",
  "socio-technical systems"
];

const defaultProfile: Omit<DomainIntelligence, "discipline"> = {
  label: "융합연구",
  preferredMethodologies: ["mixed methods", "systematic review", "network analysis", "case study"],
  dominantTheories: ["socio-technical systems", "diffusion of innovations", "stakeholder theory"],
  publicationTendencies: ["이론 통합의 명확성", "분야 간 기여 분리", "방법론 삼각검증 선호"],
  commonVariableStructures: ["맥락 요인 -> 메커니즘 -> 결과", "기술/제도 요인 -> 수용/성과"],
  typicalDatasetsSamples: ["복수 출처 설문", "문헌 코딩 데이터", "사례/인터뷰와 로그 결합"],
  methodologicalExpectations: ["분야별 용어 정합성", "교차분야 기여의 명시적 분리", "과도한 일반화 방지"]
};

const profiles: Partial<Record<Discipline, Omit<DomainIntelligence, "discipline">>> = {
  education: {
    label: "교육학",
    preferredMethodologies: ["SEM", "multilevel modeling", "longitudinal analysis", "thematic analysis", "mixed methods"],
    dominantTheories: ["self-efficacy", "social cognitive theory", "constructivism", "self-determination theory", "cognitive load"],
    publicationTendencies: ["학습성과와 교육 실천 기여", "측정도구 타당도", "학습자/교사 맥락 설명"],
    commonVariableStructures: ["학습자 특성 -> 매개심리 -> 학습성과", "교수/기술 지원 -> 자기효능감 -> 성취"],
    typicalDatasetsSamples: ["학생 설문", "교사 설문", "LMS 로그", "교실/강좌 단위 표본"],
    methodologicalExpectations: ["학교/학급 군집 고려", "척도 신뢰도와 타당도 보고", "교육 맥락의 실천적 함의"]
  },
  psychology: {
    label: "심리학",
    preferredMethodologies: ["experimental design", "longitudinal analysis", "SEM", "Bayesian analysis", "meta-analysis"],
    dominantTheories: ["self-efficacy", "self-determination theory", "planned behavior", "social cognitive theory"],
    publicationTendencies: ["구성개념 타당도", "효과 크기", "실험/종단 근거"],
    commonVariableStructures: ["개인차 -> 인지/정서 매개 -> 행동", "처치 -> 심리상태 -> 결과"],
    typicalDatasetsSamples: ["실험 참가자", "패널 설문", "심리척도 응답", "행동 로그"],
    methodologicalExpectations: ["측정 신뢰도", "교란변수 통제", "사전등록 또는 강건성 분석"]
  },
  "business/management": {
    label: "경영학/관리",
    preferredMethodologies: ["PLS-SEM", "SEM", "regression", "case study", "mixed methods"],
    dominantTheories: ["resource-based view", "institutional theory", "stakeholder theory", "agency theory"],
    publicationTendencies: ["관리적 시사점", "조직/시장 맥락", "이론적 기여 명확성"],
    commonVariableStructures: ["조직 역량 -> 전략 실행 -> 성과", "환경 불확실성 -> 의사결정 -> 성과"],
    typicalDatasetsSamples: ["기업 설문", "재무/운영 지표", "관리자 인터뷰", "패널 기업자료"],
    methodologicalExpectations: ["공통방법편의 점검", "내생성 논의", "관리 실무 기여"]
  },
  marketing: {
    label: "마케팅",
    preferredMethodologies: ["experimental design", "regression", "SEM", "content analysis", "mixed methods"],
    dominantTheories: ["consumer behavior", "uses and gratifications", "planned behavior", "prospect theory"],
    publicationTendencies: ["소비자 행동 메커니즘", "실험적 검증", "브랜드/시장 실무 기여"],
    commonVariableStructures: ["자극 -> 인식/태도 -> 구매/참여", "브랜드 경험 -> 신뢰 -> 행동의도"],
    typicalDatasetsSamples: ["소비자 설문", "A/B 실험", "소셜미디어 콘텐츠", "거래/클릭 로그"],
    methodologicalExpectations: ["조작점검", "세분시장/맥락 설명", "실무 적용 가능성"]
  },
  finance: {
    label: "재무/금융",
    preferredMethodologies: ["econometrics", "panel analysis", "time-series analysis", "causal inference", "Bayesian analysis"],
    dominantTheories: ["agency theory", "prospect theory", "market efficiency", "behavioral finance"],
    publicationTendencies: ["식별전략", "강건성 검정", "시장/제도 맥락"],
    commonVariableStructures: ["시장 충격 -> 위험/수익률", "기업특성 -> 재무의사결정 -> 성과"],
    typicalDatasetsSamples: ["기업 재무 패널", "주가/거래 데이터", "공시자료", "거시 금융 시계열"],
    methodologicalExpectations: ["내생성 대응", "이상치 처리", "강건성 및 대체모형"]
  },
  economics: {
    label: "경제학",
    preferredMethodologies: ["econometrics", "causal inference", "panel analysis", "quasi-experimental design", "time-series analysis"],
    dominantTheories: ["human capital theory", "behavioral economics", "market design", "institutional theory"],
    publicationTendencies: ["명확한 식별전략", "정책적 함의", "강건성 분석"],
    commonVariableStructures: ["정책/충격 -> 행동 변화 -> 경제성과", "제도 요인 -> 선택 -> 후생"],
    typicalDatasetsSamples: ["행정자료", "패널자료", "거시 시계열", "자연실험 데이터"],
    methodologicalExpectations: ["인과 식별", "표준오차 클러스터링", "민감도 분석"]
  },
  HCI: {
    label: "HCI",
    preferredMethodologies: ["experimental design", "mixed methods", "thematic analysis", "case study", "network analysis"],
    dominantTheories: ["human-computer interaction", "technology acceptance model", "socio-technical systems"],
    publicationTendencies: ["사용자 경험", "시스템/인터페이스 함의", "정량+정성 증거 결합"],
    commonVariableStructures: ["인터페이스 특성 -> 인지/신뢰 -> 사용성과", "사용자 맥락 -> 상호작용 -> 경험"],
    typicalDatasetsSamples: ["사용성 실험", "로그 데이터", "인터뷰", "프로토타입 평가"],
    methodologicalExpectations: ["과제 설계 명확성", "사용자 표본 설명", "디자인 함의"]
  },
  "computer science": {
    label: "컴퓨터과학",
    preferredMethodologies: ["experimental design", "network analysis", "time-series analysis", "Bayesian analysis", "systematic review"],
    dominantTheories: ["algorithmic fairness", "human-computer interaction", "socio-technical systems"],
    publicationTendencies: ["성능/벤치마크", "재현성", "시스템 또는 알고리즘 기여"],
    commonVariableStructures: ["모델/시스템 특성 -> 성능/사용성", "데이터 특성 -> 알고리즘 결과"],
    typicalDatasetsSamples: ["공개 벤치마크", "로그 데이터", "시뮬레이션", "사용자 평가 데이터"],
    methodologicalExpectations: ["재현 가능성", "비교 기준선", "오류 분석"]
  },
  "AI/data science": {
    label: "AI/데이터사이언스",
    preferredMethodologies: ["experimental design", "Bayesian analysis", "network analysis", "time-series analysis", "systematic review"],
    dominantTheories: ["algorithmic decision-making", "explainable AI", "socio-technical systems"],
    publicationTendencies: ["모델 성능과 설명 가능성", "데이터 품질", "윤리/편향 논의"],
    commonVariableStructures: ["데이터/모델 특성 -> 예측/설명 -> 의사결정", "AI 사용 -> 신뢰 -> 성과"],
    typicalDatasetsSamples: ["공개 데이터셋", "기관 로그", "모델 출력", "사용자 평가"],
    methodologicalExpectations: ["데이터 누수 방지", "편향/공정성 점검", "재현성"]
  },
  "healthcare/public health": {
    label: "보건의료/공중보건",
    preferredMethodologies: ["quasi-experimental design", "causal inference", "meta-analysis", "scoping review", "mixed methods"],
    dominantTheories: ["health belief model", "social determinants of health", "planned behavior"],
    publicationTendencies: ["임상/정책 함의", "윤리와 개인정보", "인구집단 차이"],
    commonVariableStructures: ["중재/노출 -> 건강행동 -> 건강결과", "사회적 요인 -> 접근성 -> 결과"],
    typicalDatasetsSamples: ["환자기록", "공중보건 조사", "지역사회 표본", "임상/행정자료"],
    methodologicalExpectations: ["윤리 승인", "교란 통제", "집단 간 형평성"]
  },
  "information systems": {
    label: "정보시스템",
    preferredMethodologies: ["PLS-SEM", "SEM", "case study", "mixed methods", "systematic review"],
    dominantTheories: ["technology acceptance model", "diffusion of innovations", "socio-technical systems"],
    publicationTendencies: ["기술 수용과 조직 성과", "시스템 설계 함의", "실무 적용성"],
    commonVariableStructures: ["시스템 특성 -> 수용/사용 -> 개인/조직 성과", "조직 맥락 -> 도입 -> 가치"],
    typicalDatasetsSamples: ["사용자 설문", "조직 사례", "시스템 로그", "관리자 인터뷰"],
    methodologicalExpectations: ["측정모형", "조직 맥락 설명", "기술-조직 적합성"]
  },
  sociology: {
    label: "사회학",
    preferredMethodologies: ["network analysis", "ethnography", "discourse analysis", "regression", "mixed methods"],
    dominantTheories: ["social capital", "institutional theory", "social stratification"],
    publicationTendencies: ["사회구조와 불평등", "맥락적 설명", "이론적 해석"],
    commonVariableStructures: ["사회구조 -> 자원/인식 -> 행동", "제도/문화 -> 정체성 -> 실천"],
    typicalDatasetsSamples: ["사회조사", "인터뷰", "네트워크 데이터", "행정자료"],
    methodologicalExpectations: ["맥락 민감성", "표본 대표성 또는 깊이", "윤리적 해석"]
  },
  "political science": {
    label: "정치학",
    preferredMethodologies: ["causal inference", "panel analysis", "content analysis", "discourse analysis", "network analysis"],
    dominantTheories: ["policy feedback", "institutional theory", "agenda-setting"],
    publicationTendencies: ["제도/행위자 메커니즘", "정책/선거 함의", "식별전략"],
    commonVariableStructures: ["제도/정책 -> 여론/행동 -> 정치 결과", "미디어/담론 -> 의제 -> 정책"],
    typicalDatasetsSamples: ["선거자료", "정책문서", "여론조사", "의회/미디어 텍스트"],
    methodologicalExpectations: ["인과 식별", "텍스트 코딩 신뢰도", "정치 맥락 설명"]
  },
  "public policy": {
    label: "공공정책",
    preferredMethodologies: ["quasi-experimental design", "causal inference", "case study", "mixed methods", "scoping review"],
    dominantTheories: ["policy feedback", "institutional theory", "stakeholder theory"],
    publicationTendencies: ["정책효과와 실행 가능성", "이해관계자 함의", "제도 맥락"],
    commonVariableStructures: ["정책 개입 -> 실행 과정 -> 성과", "제도 맥락 -> 수용 -> 효과"],
    typicalDatasetsSamples: ["행정자료", "정책문서", "지역/기관 사례", "이해관계자 인터뷰"],
    methodologicalExpectations: ["정책 맥락", "실행 편차 설명", "외적 타당도"]
  },
  "communication/media": {
    label: "커뮤니케이션/미디어",
    preferredMethodologies: ["content analysis", "discourse analysis", "experimental design", "network analysis", "regression"],
    dominantTheories: ["uses and gratifications", "agenda-setting", "framing theory"],
    publicationTendencies: ["메시지/플랫폼 맥락", "수용자 효과", "콘텐츠 분석 신뢰도"],
    commonVariableStructures: ["미디어 노출 -> 인식/태도 -> 행동", "프레임 -> 해석 -> 여론"],
    typicalDatasetsSamples: ["뉴스/소셜미디어 텍스트", "수용자 설문", "실험 참가자", "플랫폼 네트워크"],
    methodologicalExpectations: ["코딩 신뢰도", "플랫폼 맥락", "노출 측정 타당도"]
  },
  nursing: {
    label: "간호학",
    preferredMethodologies: ["quasi-experimental design", "thematic analysis", "phenomenology", "mixed methods", "systematic review"],
    dominantTheories: ["self-efficacy", "health belief model", "care quality frameworks"],
    publicationTendencies: ["임상 실천 개선", "환자/간호사 경험", "중재 가능성"],
    commonVariableStructures: ["교육/중재 -> 자기효능감 -> 실천/건강결과", "업무환경 -> 소진/역량 -> 간호성과"],
    typicalDatasetsSamples: ["간호사 설문", "환자 경험 자료", "임상 교육 자료", "병원 단위 표본"],
    methodologicalExpectations: ["윤리 승인", "임상 적용 가능성", "표본 접근성"]
  },
  "law/legal studies": {
    label: "법학/법정책",
    preferredMethodologies: ["case study", "content analysis", "discourse analysis", "systematic review", "scoping review"],
    dominantTheories: ["legal institutionalism", "rights theory", "regulatory theory"],
    publicationTendencies: ["규범적 타당성", "판례/법령 분석", "정책적 함의"],
    commonVariableStructures: ["법/규제 변화 -> 집행/해석 -> 사회적 효과", "권리/책임 구조 -> 제도 설계"],
    typicalDatasetsSamples: ["판례", "법령/정책문서", "규제 사례", "전문가 인터뷰"],
    methodologicalExpectations: ["법적 근거 명확성", "관할권 맥락", "규범/실증 구분"]
  },
  "environmental studies": {
    label: "환경학",
    preferredMethodologies: ["mixed methods", "time-series analysis", "network analysis", "case study", "systematic review"],
    dominantTheories: ["socio-ecological systems", "stakeholder theory", "environmental governance"],
    publicationTendencies: ["환경 영향과 거버넌스", "지역 맥락", "정책 실천성"],
    commonVariableStructures: ["환경 변화 -> 인식/정책 -> 행동/성과", "거버넌스 -> 참여 -> 지속가능 성과"],
    typicalDatasetsSamples: ["환경 모니터링", "지역사회 설문", "정책자료", "원격탐사/시계열"],
    methodologicalExpectations: ["공간/시간 맥락", "복합 인과", "정책 적용성"]
  },
  sustainability: {
    label: "지속가능성",
    preferredMethodologies: ["mixed methods", "bibliometric analysis", "case study", "SEM", "scoping review"],
    dominantTheories: ["stakeholder theory", "triple bottom line", "socio-technical transitions"],
    publicationTendencies: ["환경·사회·경제 통합", "전환 경로", "실무/정책 함의"],
    commonVariableStructures: ["지속가능 전략 -> 역량/참여 -> 성과", "정책/기술 -> 전환 수용 -> 영향"],
    typicalDatasetsSamples: ["기업 ESG 자료", "정책/보고서", "지역 사례", "이해관계자 설문"],
    methodologicalExpectations: ["다차원 성과 측정", "이해관계자 관점", "장기 영향 논의"]
  },
  engineering: {
    label: "공학",
    preferredMethodologies: ["experimental design", "time-series analysis", "Bayesian analysis", "case study", "systematic review"],
    dominantTheories: ["systems engineering", "reliability theory", "design science"],
    publicationTendencies: ["성능 검증", "시스템 신뢰성", "실험/시뮬레이션 재현성"],
    commonVariableStructures: ["설계 변수 -> 성능/안전성", "시스템 조건 -> 고장/효율"],
    typicalDatasetsSamples: ["실험 데이터", "센서/로그", "시뮬레이션", "프로토타입 평가"],
    methodologicalExpectations: ["벤치마크", "재현성", "오차/불확실성 분석"]
  }
};

export function getDomainIntelligence(discipline: Discipline): DomainIntelligence {
  const normalized: Discipline =
    discipline === "business" ? "business/management" : discipline === "CS" ? "computer science" : discipline === "interdisciplinary" ? "interdisciplinary research" : discipline;
  const profile = profiles[normalized] ?? defaultProfile;
  return { discipline, ...profile };
}

export function getMethodologySignals(methodology: Methodology): string[] {
  return methodologySignals[methodology] ?? [methodology.toLowerCase()];
}

export function recommendedMethodsForDomain(discipline: Discipline): RecommendedMethod[] {
  return getDomainIntelligence(discipline).preferredMethodologies;
}

export function buildResearchDesignGuidance(topic: Topic, discipline: Discipline, selectedMethodology: Methodology): ResearchDesignGuidance {
  const domain = getDomainIntelligence(discipline);
  const selected = methodologyLabels[selectedMethodology] ?? selectedMethodology;
  const preferred = domain.preferredMethodologies.slice(0, 3).join(", ");
  const quantitative = ["SEM", "PLS-SEM", "regression", "multilevel modeling", "panel analysis", "longitudinal analysis", "experimental design", "quasi-experimental design", "causal inference", "econometrics", "Bayesian analysis", "time-series analysis", "network analysis", "quantitative"].includes(selectedMethodology);
  const review = ["systematic review", "scoping review", "meta-analysis", "bibliometric analysis", "scientometric analysis"].includes(selectedMethodology);

  return {
    recommendedSampleType: domain.typicalDatasetsSamples[0] ?? "분야 적합 표본",
    estimatedSampleSizeGuidance: review
      ? "문헌검색식, 포함/제외 기준, 데이터베이스 범위를 먼저 정하고 최종 포함 문헌 수를 보고하세요."
      : quantitative
        ? "탐색적 MVP 기준으로는 변수당 충분한 사례 수를 확보하고, SEM/PLS-SEM은 보수적으로 200명 이상 또는 검정력 분석을 권장합니다."
        : "질적 연구는 포화 기준을 명시하고 15-30명 내외 또는 사례 수의 논리적 충분성을 설명하세요.",
    suggestedAnalysisMethod: `${selected}; 이 분야에서 자주 기대되는 대안은 ${preferred}입니다.`,
    dataCollectionApproaches: domain.typicalDatasetsSamples,
    journalConferenceDirections: domain.publicationTendencies.map((tendency) => `${domain.label} 분야: ${tendency}`),
    methodologyRisks: [
      `${domain.label} 분야의 방법론 기대(${domain.methodologicalExpectations[0]})를 충족하지 못하면 설득력이 낮아질 수 있습니다.`,
      `${selected}가 항상 우월한 것은 아니며, 연구문제와 자료 구조에 맞는지 원문 검토와 설계 검증이 필요합니다.`,
      topic.inferenceNotice
    ]
  };
}
