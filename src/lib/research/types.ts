export const disciplines = [
  "education",
  "psychology",
  "business/management",
  "marketing",
  "finance",
  "economics",
  "sociology",
  "political science",
  "public policy",
  "communication/media",
  "HCI",
  "computer science",
  "information systems",
  "healthcare/public health",
  "nursing",
  "law/legal studies",
  "environmental studies",
  "sustainability",
  "engineering",
  "AI/data science",
  "interdisciplinary research",
  "business",
  "CS",
  "interdisciplinary"
] as const;
export const methodologies = [
  "quantitative",
  "qualitative",
  "mixed",
  "SEM",
  "PLS-SEM",
  "regression",
  "multilevel modeling",
  "panel analysis",
  "longitudinal analysis",
  "experimental design",
  "quasi-experimental design",
  "causal inference",
  "econometrics",
  "Bayesian analysis",
  "time-series analysis",
  "network analysis",
  "grounded theory",
  "thematic analysis",
  "discourse analysis",
  "narrative inquiry",
  "phenomenology",
  "ethnography",
  "systematic review",
  "scoping review",
  "meta-analysis",
  "case study",
  "content analysis",
  "mixed methods",
  "bibliometric analysis",
  "scientometric analysis"
] as const;

export type Discipline = (typeof disciplines)[number];
export type Methodology = (typeof methodologies)[number];

export type RetrievedPaper = {
  id: string;
  title: string;
  year: number | null;
  doi: string | null;
  source: string;
  url: string;
  citedByCount: number;
  concepts: string[];
  abstract: string;
  authors: string[];
};

export type EvidenceItem = {
  label: string;
  paperIds: string[];
  support: number;
};

export type Synthesis = {
  theories: EvidenceItem[];
  trends: EvidenceItem[];
  limitations: EvidenceItem[];
  relatedTheories: EvidenceItem[];
  emergingTopics: EvidenceItem[];
};

export type Gap = {
  type: "underexplored_intersection" | "sparse_theory_combination" | "weak_methodology_coverage" | "emerging_immature_domain";
  claim: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type Scores = {
  novelty: number;
  feasibility: number;
  publishability: number;
  dataAvailability: number;
  saturation: number;
};

export type RecommendedMethod =
  | "SEM"
  | "PLS-SEM"
  | "regression"
  | "multilevel modeling"
  | "panel analysis"
  | "longitudinal analysis"
  | "experimental design"
  | "quasi-experimental design"
  | "causal inference"
  | "econometrics"
  | "Bayesian analysis"
  | "time-series analysis"
  | "network analysis"
  | "grounded theory"
  | "thematic analysis"
  | "discourse analysis"
  | "narrative inquiry"
  | "phenomenology"
  | "ethnography"
  | "case study"
  | "content analysis"
  | "mixed methods"
  | "systematic review"
  | "scoping review"
  | "meta-analysis"
  | "bibliometric analysis"
  | "scientometric analysis";

export type MethodologyRecommendation = {
  method: RecommendedMethod;
  fit: number;
  rationale: string;
  evidence: string;
  risks: string[];
};

export type ResearchPlan = {
  researchQuestions: string[];
  hypothesesPropositions: string[];
  conceptualModel: string;
  sampleDataRecommendations: string[];
  dataCollectionMethods: string[];
  futureExpansionDirections: string[];
};

export type ResearchDesignGuidance = {
  recommendedSampleType: string;
  estimatedSampleSizeGuidance: string;
  suggestedAnalysisMethod: string;
  dataCollectionApproaches: string[];
  journalConferenceDirections: string[];
  methodologyRisks: string[];
};

export type DomainIntelligence = {
  discipline: Discipline;
  label: string;
  preferredMethodologies: RecommendedMethod[];
  dominantTheories: string[];
  publicationTendencies: string[];
  commonVariableStructures: string[];
  typicalDatasetsSamples: string[];
  methodologicalExpectations: string[];
};

export type GraphNodeType = "theory" | "concept" | "variable" | "methodology";

export type GraphNode = {
  id: string;
  label: string;
  type: GraphNodeType;
  support: number;
  paperIds: string[];
};

export type GraphEdgeType = "theory_cooccurrence" | "adjacent_framework" | "concept_bridge" | "methodology_link";

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  weight: number;
  density: number;
  paperIds: string[];
  averageCitations: number;
  years: number[];
};

export type TheoryGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: {
    density: number;
    weakConnectionCount: number;
    emergingConnectionCount: number;
    methodologyDiversity: number;
  };
};

export type RelationshipInsight = {
  type: "co_occurring_theories" | "adjacent_frameworks" | "weak_connection" | "emerging_combination" | "weak_citation_cluster" | "methodology_gap";
  title: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type TrendDatum = {
  label: string;
  years: Array<{ year: number; count: number }>;
  recentCount: number;
  priorCount: number;
  direction: "rising" | "declining" | "stable";
  paperIds: string[];
};

export type TrendAnalysis = {
  risingTopics: TrendDatum[];
  decliningTopics: TrendDatum[];
  frequencyOverTime: TrendDatum[];
};

export type Topic = {
  title: string;
  rationale: string;
  researchQuestion: string;
  hypotheses: string[];
  recommendedMethodology: Methodology;
  variables: string[];
  coreTheory: string;
  adjacentTheories: string[];
  mediatorsModerators: string[];
  methodologyRecommendations: MethodologyRecommendation[];
  expectedContribution: string;
  risksLimitations: string[];
  publicationSuitabilityEstimate: string;
  researchPlan: ResearchPlan;
  researchDesignGuidance: ResearchDesignGuidance;
  academicContribution: string;
  practicalContribution: string;
  scores: Scores;
  evidencePaperIds: string[];
  inferenceNotice: string;
};

export type TopicComparison = {
  topicTitle: string;
  novelty: number;
  feasibility: number;
  publishability: number;
  literatureSupportStrength: number;
  dataAccessibility: number;
  saturation: number;
  recommendation: "safer" | "balanced" | "high_novelty";
  rationale: string;
};

export type CopilotMessage = {
  title: string;
  message: string;
  evidence: string;
};

export type CopilotIntelligence = {
  summary: string;
  saferDirection: string;
  highNoveltyDirection: string;
  theoryRecommendations: string[];
  methodologyAlternatives: MethodologyRecommendation[];
  comparisons: TopicComparison[];
  starterMessages: CopilotMessage[];
};

export type ResearchIntelligenceResult = {
  query: {
    keywords: string[];
    discipline: Discipline;
    methodology: Methodology;
  };
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  theoryGraph: TheoryGraph;
  relationshipAnalysis: RelationshipInsight[];
  trendAnalysis: TrendAnalysis;
  copilot: CopilotIntelligence;
  domainIntelligence: DomainIntelligence;
  gaps: Gap[];
  topics: Topic[];
  diagnostics: {
    retrievedCount: number;
    source: "OpenAlex";
    generatedAt: string;
    warnings: string[];
  };
};
