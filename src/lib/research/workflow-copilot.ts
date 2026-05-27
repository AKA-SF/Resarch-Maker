import type {
  Discipline,
  FullResearchWorkflowCopilot,
  Methodology,
  ResearchCodeTemplate,
  ResearcherProfile,
  RetrievedPaper,
  Synthesis,
  Topic,
  TrustedAcademicIntelligenceInfrastructure
} from "./types";
import { disciplineLabels, methodologyLabels } from "./domain";

function primaryTopic(topics: Topic[]): Topic | null {
  return topics[0] ?? null;
}

function variablesFor(topic: Topic | null): string[] {
  return (topic?.variables.length ? topic.variables : ["independent variable", "dependent variable", "control variable"]).slice(0, 6);
}

function constructsFor(topic: Topic | null, synthesis: Synthesis): string[] {
  return [...new Set([
    ...(topic?.variables ?? []),
    topic?.coreTheory,
    ...synthesis.theories.slice(0, 3).map((item) => item.label)
  ].filter((item): item is string => Boolean(item)))].slice(0, 6);
}

function codeFenceSafeVariable(variable: string): string {
  return variable.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "variable";
}

function buildInstrumentPackage(topic: Topic | null, synthesis: Synthesis, methodology: Methodology): FullResearchWorkflowCopilot["instrumentPackage"] {
  const constructs = constructsFor(topic, synthesis);
  const variables = variablesFor(topic);
  return {
    surveyQuestionnaireDraft: constructs.slice(0, 5).map((construct) => ({
      construct,
      responseScale: "5점 Likert: 1 전혀 그렇지 않다 - 5 매우 그렇다",
      evidence: `구성개념은 생성 토픽/검색 이론 신호에서 왔습니다. ${topic?.inferenceNotice ?? "대표 토픽 부족"}`,
      items: [
        `${construct}와 관련하여 나는 학습/업무 상황에서 자신감을 느낀다.`,
        `${construct}는 나의 의사결정 또는 성과에 중요한 영향을 준다.`,
        `${construct}를 활용할 때 필요한 지원과 자원을 확보할 수 있다.`
      ]
    })),
    interviewProtocol: [
      `연구 맥락에서 ${variables[0]}를 어떻게 경험했는지 설명해 주세요.`,
      `${topic?.coreTheory || "핵심 이론"} 관점에서 가장 중요한 촉진/저해 요인은 무엇인가요?`,
      "현재 문헌에서 충분히 설명되지 않는 경험이나 사례가 있었나요?",
      "향후 연구나 실무 개선을 위해 측정해야 할 요소는 무엇이라고 보나요?"
    ],
    focusGroupGuide: [
      "참여자별 경험 차이를 공유하고 공통 패턴을 확인합니다.",
      `${variables.slice(0, 3).join(", ")} 사이의 관계를 토론합니다.`,
      "제안된 설문 문항의 이해 가능성과 민감도를 점검합니다.",
      "연구자가 놓친 맥락 변수나 윤리적 고려사항을 수집합니다."
    ],
    observationFramework: [
      "행동/상호작용 맥락",
      "도구 또는 AI 시스템 사용 장면",
      "참여자의 자기효능감/불확실성 표현",
      "지원 요청, 실패 경험, 피드백 반응",
      "관찰자 메모: 해석과 사실을 분리 기록"
    ],
    experimentalProcedureOutline: [
      "사전 동의 및 사전 설문",
      "무작위 또는 준실험 조건 배정 가능성 검토",
      "개입/처치 자료 제시",
      "즉시 사후 측정과 지연 사후 측정 계획",
      "조작점검, 탈락 기준, 윤리적 debriefing"
    ],
    measurementScaleSuggestions: constructs.slice(0, 5).map((construct) => ({
      construct,
      scaleType: methodology === "qualitative" ? "인터뷰 코드북 후보" : "Likert multi-item scale 후보",
      adaptationNote: "기존 검증 척도 원문과 라이선스를 확인한 뒤 번안/수정해야 합니다."
    })),
    instrumentBoundary: "도구는 초안 템플릿입니다. IRB, 전문가 타당도, 파일럿 테스트, 기존 척도 사용 허가 없이 검증된 측정도구로 주장하면 안 됩니다."
  };
}

function buildStatisticalWorkflow(topic: Topic | null, methodology: Methodology, discipline: Discipline): FullResearchWorkflowCopilot["statisticalWorkflow"] {
  const variables = variablesFor(topic);
  const quantitative = !["qualitative", "grounded theory", "thematic analysis", "discourse analysis", "narrative inquiry", "phenomenology", "ethnography", "case study"].includes(methodology);
  return {
    recommendedStatisticalMethods: quantitative
      ? [methodologyLabels[methodology], "descriptive statistics", "reliability analysis", "correlation matrix", "robustness/sensitivity checks"]
      : ["thematic coding", "inter-coder agreement", "memoing", "negative case analysis", "audit trail"],
    analysisPipeline: quantitative
      ? ["import data", "clean missing values", "inspect distributions", "construct scale scores", "run reliability/validity checks", "fit primary model", "run robustness checks", "export tables/figures"]
      : ["prepare transcripts", "open coding", "axial/theme development", "codebook refinement", "coder agreement check", "theme evidence matrix", "contradiction/negative case memo"],
    variableOperationalization: variables.map((variable) => ({
      variable,
      operationalDefinition: `${variable}를 연구질문에 맞는 관찰 가능 지표로 정의합니다.`,
      measurementSuggestion: quantitative ? "3개 이상 문항 평균 또는 검증된 척도 점수" : "인터뷰 코드, 관찰 메모, 문서 근거로 삼각검증"
    })),
    dataPreprocessingWorkflow: ["raw data freeze", "data dictionary 작성", "missingness pattern 점검", "outlier rule 사전 정의", "analysis-ready dataset 저장", "reproducible script로 변환 기록"],
    reliabilityValidityChecks: quantitative
      ? ["Cronbach alpha / omega", "CFA 또는 construct validity", "common method bias 점검", "convergent/discriminant validity", "sensitivity analysis"]
      : ["codebook 안정성", "inter-coder agreement", "member checking 가능성", "thick description", "negative case analysis"],
    modelSelectionSuggestions: [
      `${disciplineLabels[discipline]} 분야의 심사 기대에 맞춰 단순 모델부터 시작`,
      methodology.includes("SEM") ? "measurement model과 structural model을 분리 보고" : "가설 구조와 자료 수준에 맞는 최소 충분 모델 선택",
      "인과 주장은 실험/종단/준실험 식별전략이 있을 때만 사용"
    ],
    qualitativeCodingWorkflow: ["deductive seed codes from theory", "inductive open coding", "code merge/split memo", "theme saturation check", "evidence quote matrix"],
    workflowBoundary: "통계/코딩 워크플로는 템플릿입니다. 실제 자료 구조, 표본 수, 가정 검정, 전문가 검토 전에는 통계적 타당성을 보장하지 않습니다."
  };
}

function buildCodeTemplates(topic: Topic | null, methodology: Methodology): ResearchCodeTemplate[] {
  const variables = variablesFor(topic).map(codeFenceSafeVariable);
  const y = variables[0] ?? "outcome";
  const x = variables[1] ?? "predictor";
  const controls = variables.slice(2, 5);
  const controlFormula = controls.length ? ` + ${controls.join(" + ")}` : "";
  return [
    {
      language: "R",
      workflow: "regression",
      title: "R regression starter",
      code: `# Template only: replace variable names and validate assumptions\nlibrary(tidyverse)\nlibrary(broom)\n\ndata <- readr::read_csv("data/analysis_ready.csv")\nmodel <- lm(${y} ~ ${[x, ...controls].join(" + ")}, data = data)\nsummary(model)\nbroom::tidy(model, conf.int = TRUE)\n# Check residuals, missingness, multicollinearity before interpreting results\n`,
      notes: ["No empirical result is generated here.", "Replace variables with validated constructs.", "Run diagnostics before interpretation."]
    },
    {
      language: "Python",
      workflow: "visualization",
      title: "Python preprocessing and visualization starter",
      code: `# Template only: inspect and validate your dataset before analysis\nimport pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv("data/analysis_ready.csv")\nprint(df[["${y}", "${x}" ]].describe())\nsns.regplot(data=df, x="${x}", y="${y}")\nplt.tight_layout()\nplt.savefig("outputs/${x}_${y}_diagnostic.png", dpi=200)\n`,
      notes: ["Visualization is diagnostic, not evidence of causality.", "Check privacy before exporting plots."]
    },
    {
      language: "R",
      workflow: "SEM/PLS-SEM",
      title: "R lavaan SEM starter",
      code: `# Template only: specify constructs using validated measurement items\nlibrary(lavaan)\nmodel <- '\n  ${y} =~ ${y}_1 + ${y}_2 + ${y}_3\n  ${x} =~ ${x}_1 + ${x}_2 + ${x}_3\n  ${y} ~ ${x}${controls.length ? ` + ${controls.join(" + ")}` : ""}\n'\nfit <- sem(model, data = data, missing = "fiml")\nsummary(fit, fit.measures = TRUE, standardized = TRUE)\n`,
      notes: ["Requires adequate sample size and validated items.", "Do not report fit indices without checking model identification."]
    },
    {
      language: "Stata",
      workflow: "multilevel",
      title: "Stata multilevel model starter",
      code: `* Template only: replace school_id/person_id and validate nesting structure\nimport delimited "data/analysis_ready.csv", clear\nmisstable summarize ${y} ${x} ${controls.join(" ")}\nmixed ${y} ${x}${controls.length ? ` ${controls.join(" ")}` : ""} || cluster_id:\nestimates store random_intercept\n* Check ICC, convergence, residuals, and robustness before interpretation\n`,
      notes: ["Use only when data are actually nested.", "Replace cluster_id with a validated grouping variable."]
    },
    {
      language: "SPSS",
      workflow: "regression",
      title: "SPSS reliability and regression starter",
      code: `* Template only: replace file path and scale items.\nGET DATA /TYPE=TXT /FILE='data/analysis_ready.csv' /DELCASE=LINE /DELIMITERS=',' /ARRANGEMENT=DELIMITED /FIRSTCASE=2.\nRELIABILITY /VARIABLES=${y}_1 ${y}_2 ${y}_3 /SCALE('${y}') ALL /MODEL=ALPHA.\nREGRESSION /DEPENDENT ${y} /METHOD=ENTER ${x}${controls.length ? ` ${controls.join(" ")}` : ""}.\n* Review missing data, assumptions, and measurement validity before reporting.\n`,
      notes: ["This is syntax scaffolding, not a validated analysis.", "Check SPSS import settings against your actual CSV."]
    },
    {
      language: "R",
      workflow: "Bayesian",
      title: "R Bayesian model starter",
      code: `# Template only: requires substantive priors and posterior diagnostics\nlibrary(brms)\nfit <- brm(\n  ${y} ~ ${x}${controlFormula},\n  data = data,\n  family = gaussian(),\n  prior = c(prior(normal(0, 1), class = "b")),\n  chains = 4,\n  cores = 4,\n  seed = 20260527\n)\nsummary(fit)\npp_check(fit)\n`,
      notes: ["Priors must be justified from theory or prior evidence.", "Posterior checks are required before interpretation."]
    },
    {
      language: "Python",
      workflow: "thematic_analysis",
      title: "Qualitative coding table starter",
      code: `# Template only: creates a transparent coding workspace\nimport pandas as pd\ntranscripts = pd.read_csv("data/transcripts.csv")\ncodebook = pd.DataFrame({\n    "code": ["${topic?.coreTheory || "core_theory"}", "barrier", "facilitator"],\n    "definition": ["Theory-driven signal", "Obstacle in participant account", "Enabling condition"],\n    "example_quote": ["", "", ""]\n})\ncodebook.to_csv("outputs/codebook_v1.csv", index=False)\n`,
      notes: ["Human coding and intercoder checks are required.", "Do not treat template codes as discovered themes."]
    },
    {
      language: "R",
      workflow: "bibliometric",
      title: "R bibliometric analysis starter",
      code: `# Template only: use exported metadata from OpenAlex/Zotero after deduplication\nlibrary(bibliometrix)\nrecords <- convert2df("data/references.bib", dbsource = "isi", format = "bibtex")\nresults <- biblioAnalysis(records)\nsummary(results, k = 10)\nnetwork <- biblioNetwork(records, analysis = "co-occurrences", network = "keywords", sep = ";")\n# Inspect deduplication and database coverage before making field-level claims\n`,
      notes: ["Bibliometric outputs depend on database coverage.", "Do not infer exhaustive field maps from partial exports."]
    },
    {
      language: "RMarkdown/Quarto",
      workflow: methodology === "bibliometric analysis" ? "bibliometric" : "regression",
      title: "Reproducible report skeleton",
      code: `---\ntitle: "Analysis Report"\nformat: html\nexecute:\n  echo: true\n---\n\n## Data provenance\nDocument source, collection date, inclusion/exclusion rules.\n\n## Analysis\nInsert validated code chunks here.\n\n## Reproducibility\nRecord package versions and random seeds.\n`,
      notes: ["Designed for reproducible reporting.", "Keep raw data outside public repositories when private."]
    }
  ];
}

function buildExecutionPlan(topic: Topic | null): FullResearchWorkflowCopilot["executionPlan"] {
  return {
    stepByStepPlan: ["finalize research question", "map constructs to instruments", "prepare IRB/ethics materials", "pilot instrument", "collect data", "clean and document data", "run primary analysis", "perform robustness/reliability checks", "draft manuscript", "prepare submission package"],
    dataCollectionTimeline: [
      { phase: "Instrument design", duration: "1-2 weeks", deliverable: "survey/protocol draft and expert review notes" },
      { phase: "Pilot", duration: "1 week", deliverable: "pilot feedback and revised instrument" },
      { phase: "Main collection", duration: "3-6 weeks", deliverable: "frozen raw dataset or transcript corpus" },
      { phase: "Analysis", duration: "2-4 weeks", deliverable: "reproducible scripts, tables, figures" }
    ],
    milestoneSchedule: ["M1 protocol approved", "M2 pilot complete", "M3 data freeze", "M4 analysis complete", "M5 manuscript draft", "M6 submission-ready package"],
    publicationRoadmap: topic ? [`Short paper: ${topic.title}`, "Full journal manuscript with validated measures", "Follow-up replication or extension study"] : ["Short paper", "journal manuscript", "replication study"],
    dissertationWorkflow: ["chapter 1 proposal", "chapter 2 literature review", "chapter 3 methods", "chapter 4 results/analysis", "chapter 5 discussion/conclusion", "defense package"],
    replicationChecklist: ["data dictionary", "analysis script", "package versions", "random seeds", "inclusion/exclusion log", "instrument appendix", "de-identified data sharing decision"]
  };
}

function buildWritingWorkflow(topic: Topic | null): FullResearchWorkflowCopilot["academicWritingWorkflow"] {
  return {
    publicationReadyOutline: ["Title and structured abstract", "Introduction and problem statement", "Theory and hypotheses/propositions", "Methods and measurement", "Results or findings plan", "Discussion and contribution", "Limitations and future research", "References and appendices"],
    journalStyleFormattingGuidance: ["Follow target venue word count and reference style", "Separate evidence-backed claims from generated interpretation", "Use tables for constructs, measures, and hypotheses", "Report all exclusions and robustness checks"],
    discussionConclusionDraft: topic
      ? `${topic.title}의 discussion 초안은 이론적 기여, 방법론적 한계, 실무적 함의를 분리해야 합니다. 실제 결과가 없으므로 효과 방향이나 유의성은 작성하지 않습니다.`
      : "Discussion draft requires a selected topic and actual results. This placeholder avoids fabricating findings.",
    contributionFraming: topic ? [topic.academicContribution, topic.practicalContribution, topic.expectedContribution] : ["theoretical contribution", "methodological contribution", "practical contribution"],
    reviewerResponseSuggestions: ["Acknowledge the reviewer concern", "State the concrete manuscript change", "Point to revised section/table", "Avoid claiming new results unless analysis was actually rerun"],
    revisionStrategyRecommendations: ["triage major vs minor comments", "create response matrix", "rerun only justified analyses", "update limitations when claims are narrowed"],
    writingBoundary: "글쓰기 산출물은 publication-ready outline과 문장 초안입니다. 실제 결과, 통계 유의성, 심사 수락 가능성을 생성하지 않습니다."
  };
}

function buildReproducibility(topic: Topic | null, trusted: TrustedAcademicIntelligenceInfrastructure): FullResearchWorkflowCopilot["reproducibilityLayer"] {
  const variables = variablesFor(topic);
  return {
    reproducibilityChecklist: ["raw data preserved", "analysis-ready data scripted", "codebook/data dictionary complete", "all exclusions logged", "package versions recorded", "figures/tables generated from scripts", "private data redaction checked"],
    methodologyCompletenessValidation: trusted.autonomousResearchAudits.slice(0, 3).map((audit) => `${audit.target}: evidence ${audit.evidenceStrength}/10, methodology ${audit.methodologyValidity}/10`),
    missingVariableDetection: variables.length < 3 ? ["변수 수가 적습니다. 통제변수, 매개/조절 후보, 결과변수를 재확인하세요."] : variables.map((variable) => `${variable}: operational definition 필요`),
    citationConsistencyChecks: trusted.governanceReliability.citationConsistencyValidation,
    workflowAuditTrail: ["instrument generated", "analysis workflow generated", "code templates generated", "reproducibility checklist generated", "human validation still required"],
    reproducibilityBoundary: "재현성 레이어는 체크리스트와 감사 경로입니다. 실제 데이터/코드 실행, 결과 검증, 통계 가정 충족을 보장하지 않습니다."
  };
}

function buildIntegrations(): FullResearchWorkflowCopilot["externalIntegrations"] {
  return {
    zotero: ["read-only local library sync", "BibTeX/RIS export planning", "reading queue collection suggestion", "no write without explicit confirmation"],
    overleaf: ["export LaTeX outline", "sync references.bib manually", "track reviewer response table"],
    notion: ["project milestones database", "reading notes database", "review comment tracker"],
    csvExcelDatasets: ["data dictionary sheet", "missingness report", "analysis-ready CSV export"],
    jupyterNotebooks: ["Python preprocessing notebook", "visual diagnostics notebook", "model robustness notebook"],
    rmarkdownQuartoExports: ["analysis report skeleton", "reproducibility appendix", "submission supplement"],
    integrationBoundary: "외부 연동은 워크플로 제안입니다. Zotero 읽기 외에는 실제 Overleaf/Notion/Jupyter 파일 생성이나 외부 쓰기를 수행하지 않습니다."
  };
}

export function buildFullResearchWorkflowCopilot(params: {
  topics: Topic[];
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  methodology: Methodology;
  discipline: Discipline;
  researcherProfile?: Partial<ResearcherProfile>;
  trusted: TrustedAcademicIntelligenceInfrastructure;
}): FullResearchWorkflowCopilot {
  const topic = primaryTopic(params.topics);
  return {
    workflowRunId: `workflow-copilot-${Date.now()}`,
    instrumentPackage: buildInstrumentPackage(topic, params.synthesis, params.methodology),
    statisticalWorkflow: buildStatisticalWorkflow(topic, params.methodology, params.discipline),
    codeTemplates: buildCodeTemplates(topic, params.methodology),
    executionPlan: buildExecutionPlan(topic),
    academicWritingWorkflow: buildWritingWorkflow(topic),
    reproducibilityLayer: buildReproducibility(topic, params.trusted),
    externalIntegrations: buildIntegrations(),
    workflowBoundary: `Full Research Workflow Copilot은 ${params.papers.length}개 검색 근거와 생성 토픽을 바탕으로 실행 템플릿을 제공합니다. 실제 데이터 수집, 통계 분석 실행, 실증 결과, 출판 수락을 생성하거나 보장하지 않습니다.`
  };
}
