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

export const researchStrategies = [
  "beginner-safe research",
  "high-impact/high-risk research",
  "fast publishable topics",
  "interdisciplinary innovation",
  "practitioner-oriented research",
  "theory-heavy research"
] as const;

export type ResearchStrategy = (typeof researchStrategies)[number];

export const careerStages = ["student", "researcher", "professor"] as const;
export type CareerStage = (typeof careerStages)[number];

export type ResearcherProfile = {
  interests: string[];
  preferredMethodologies: Methodology[];
  publicationGoals: string[];
  targetVenues: string[];
  theoreticalOrientation: string;
  noveltyTolerance: "low" | "medium" | "high";
  careerStage: CareerStage;
};

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
  institutions: string[];
  countries: string[];
  referencedWorks: string[];
  relatedWorks: string[];
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

export type CitationPaperSignal = {
  paperId: string;
  title: string;
  year: number | null;
  citedByCount: number;
  authors: string[];
  source: string;
  url: string;
  reason: string;
};

export type CitationNetworkNode = {
  id: string;
  title: string;
  year: number | null;
  citedByCount: number;
};

export type CitationNetworkEdge = {
  id: string;
  source: string;
  target: string;
  type: "direct_citation" | "shared_references" | "related_work";
  weight: number;
  evidence: string;
};

export type CoCitationSignal = {
  title: string;
  paperIds: string[];
  sharedReferenceCount: number;
  evidence: string;
  confidence: "low" | "medium" | "high";
};

export type AuthorInfluence = {
  author: string;
  paperIds: string[];
  paperCount: number;
  totalCitations: number;
  averageCitations: number;
};

export type ResearchCluster = {
  id: string;
  label: string;
  paperIds: string[];
  paperCount: number;
  totalCitations: number;
  dominantKeywords: string[];
  evidence: string;
};

export type CitationIntelligence = {
  network: {
    nodes: CitationNetworkNode[];
    edges: CitationNetworkEdge[];
    metrics: {
      directCitationEdges: number;
      sharedReferenceEdges: number;
      relatedWorkEdges: number;
      averageCitations: number;
    };
  };
  highlyCitedPapers: CitationPaperSignal[];
  seminalPapers: CitationPaperSignal[];
  emergingPapers: CitationPaperSignal[];
  coCitationSignals: CoCitationSignal[];
  authorInfluence: AuthorInfluence[];
  researchClusters: ResearchCluster[];
};

export type KeywordCooccurrence = {
  source: string;
  target: string;
  weight: number;
  paperIds: string[];
};

export type PublicationTrendPoint = {
  year: number;
  paperCount: number;
  totalCitations: number;
  paperIds: string[];
};

export type TopicEvolution = {
  label: string;
  firstYear: number | null;
  latestYear: number | null;
  earlyCount: number;
  recentCount: number;
  trajectory: "rising" | "declining" | "stable";
  paperIds: string[];
};

export type CollaborationEdge = {
  source: string;
  target: string;
  weight: number;
  paperIds: string[];
};

export type InstitutionTrend = {
  institution: string;
  countries: string[];
  paperCount: number;
  recentCount: number;
  totalCitations: number;
  paperIds: string[];
};

export type CountryTrend = {
  country: string;
  paperCount: number;
  recentCount: number;
  totalCitations: number;
  paperIds: string[];
};

export type ResearchMaturity = {
  stage: "emerging" | "developing" | "maturing" | "saturated";
  score: number;
  evidence: string;
};

export type SaturationSignal = {
  level: "low" | "moderate" | "high";
  score: number;
  evidence: string;
};

export type BibliometricAnalysis = {
  keywordCooccurrences: KeywordCooccurrence[];
  publicationTrends: PublicationTrendPoint[];
  topicEvolution: TopicEvolution[];
  authorCollaborations: CollaborationEdge[];
  institutionTrends: InstitutionTrend[];
  countryTrends: CountryTrend[];
  researchMaturity: ResearchMaturity;
  saturation: SaturationSignal;
};

export type CompetingFrameworkSignal = {
  frameworks: string[];
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type InterdisciplinaryBridge = {
  source: string;
  target: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type TheoryTimelinePoint = {
  year: number;
  label: string;
  evidence: string;
  paperIds: string[];
};

export type LiteratureMap = {
  foundationalTheories: EvidenceItem[];
  dominantFrameworks: EvidenceItem[];
  competingFrameworks: CompetingFrameworkSignal[];
  adjacentDisciplines: EvidenceItem[];
  interdisciplinaryBridges: InterdisciplinaryBridge[];
  theoryEvolutionTimeline: TheoryTimelinePoint[];
};

export type LiteratureReviewSection = {
  title: string;
  retrievedEvidence: string[];
  inferredSynthesis: string;
  generatedNarrative: string;
};

export type LiteratureReviewDraft = {
  introductionOverview: LiteratureReviewSection;
  thematicGrouping: LiteratureReviewSection[];
  theorySynthesis: LiteratureReviewSection;
  trendDiscussion: LiteratureReviewSection;
  contradictionAnalysis: LiteratureReviewSection;
  gapSummary: LiteratureReviewSection;
  futureResearchDirections: LiteratureReviewSection;
  exportMarkdown: string;
};

export type DebateSignal = {
  type:
    | "conflicting_findings"
    | "methodological_disagreement"
    | "competing_theoretical_explanations"
    | "inconsistent_empirical_evidence"
    | "unresolved_debate";
  claim: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type RoadmapItem = {
  title: string;
  rationale: string;
  evidence: string;
  paperIds: string[];
};

export type ResearchRoadmap = {
  beginnerSafeTopics: RoadmapItem[];
  highImpactHighRiskTopics: RoadmapItem[];
  futureTrendForecasts: RoadmapItem[];
  recommendedNextStepStudies: RoadmapItem[];
  unexploredInterdisciplinaryCombinations: RoadmapItem[];
};

export type PublicationVenueRecommendation = {
  name: string;
  type: "journal" | "conference" | "venue";
  classification: "SSCI" | "SCI" | "Scopus" | "unknown";
  classificationEvidence: string;
  impactTrendEstimate: string;
  methodologyFit: number;
  topicFit: number;
  publishabilityReasoning: string;
  evidencePaperIds: string[];
};

export type PublicationIntelligence = {
  journals: PublicationVenueRecommendation[];
  conferences: PublicationVenueRecommendation[];
  publishabilityReasoning: string[];
  warnings: string[];
};

export type DatasetRecommendation = {
  name: string;
  sourceUrl: string;
  type: "public dataset" | "survey" | "interview" | "experiment" | "ethical API/scraping" | "institutional data";
  suitability: string;
  sampleType: string;
  estimatedSampleSizeGuidance: string;
  difficulty: "low" | "medium" | "high";
  ethicalNotes: string;
  evidence: string;
};

export type DatasetIntelligence = {
  recommendations: DatasetRecommendation[];
  surveyInterviewSuitability: string;
  experimentalFeasibility: string;
  apiScrapingPossibilities: string;
  dataDifficultyEstimate: "low" | "medium" | "high";
  sampleTypeRecommendations: string[];
};

export type LongTermResearchRoadmap = {
  strategy: ResearchStrategy;
  shortTermPaperIdeas: RoadmapItem[];
  followUpStudyChains: RoadmapItem[];
  dissertationThesisPathways: RoadmapItem[];
  futureExpansionDirections: RoadmapItem[];
  multiPaperResearchAgendas: RoadmapItem[];
  progressiveTheoryDevelopmentPaths: RoadmapItem[];
};

export type CompetitionSignal = {
  label: string;
  level: "low" | "moderate" | "high";
  evidence: string;
  paperIds: string[];
};

export type ResearchCompetitionIntelligence = {
  oversaturatedTopics: CompetitionSignal[];
  rapidlyGrowingAreas: CompetitionSignal[];
  neglectedDomains: CompetitionSignal[];
  highlyCompetitiveSpaces: CompetitionSignal[];
  emergingOpportunities: CompetitionSignal[];
  decliningResearchTrends: CompetitionSignal[];
};

export type ExportBundle = {
  markdown: string;
  bibtex: string;
  citationNote: string;
};

export type ResearchAgentRole =
  | "literature_retrieval"
  | "theory_extraction"
  | "citation_intelligence"
  | "research_gap_analysis"
  | "methodology_recommendation"
  | "topic_generation"
  | "contradiction_detection"
  | "roadmap_planning";

export type ResearchAgentRun = {
  role: ResearchAgentRole;
  name: string;
  status: "completed" | "limited";
  inputSummary: string;
  outputSummary: string;
  evidence: string;
  handoffTo: ResearchAgentRole[];
};

export type MultiAgentWorkflow = {
  runId: string;
  pipeline: ResearchAgentRun[];
  collaborationSummary: string;
  evidenceBoundary: string;
};

export type ExplorationPath = {
  seed: string;
  path: string[];
  rationale: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
  paperIds: string[];
};

export type AutonomousExploration = {
  adjacentTheoryPaths: ExplorationPath[];
  emergingConceptPaths: ExplorationPath[];
  weakDomainExpansionPaths: ExplorationPath[];
  refinedResearchGoals: string[];
  specializedDirections: string[];
};

export type DeepResearchSynthesis = {
  structuredTheorySynthesis: string[];
  competingFrameworkAnalysis: string[];
  unresolvedDebateSummaries: string[];
  interdisciplinaryConnectionAnalysis: string[];
  conceptualIntegrationProposals: string[];
  evidenceBoundary: string;
};

export type ResearchForecast = {
  emergingHighGrowthAreas: CompetitionSignal[];
  likelyFutureResearchTrends: RoadmapItem[];
  oversaturatedAreas: CompetitionSignal[];
  decliningThemes: CompetitionSignal[];
  interdisciplinaryOpportunityZones: RoadmapItem[];
  forecastBoundary: string;
};

export type ResearchMemorySeed = {
  sessionId: string;
  savedTheoryGraphNodeCount: number;
  savedLiteratureMapItems: number;
  priorGeneratedTopicTitles: string[];
  refinementHistory: string[];
  evolvingResearchAgenda: string[];
  comparisonSnapshot: Array<{
    title: string;
    novelty: number;
    feasibility: number;
    publishability: number;
  }>;
};

export type ResearchProposalDraft = {
  title: string;
  abstract: string;
  introduction: string;
  problemStatement: string;
  researchObjectives: string[];
  researchQuestions: string[];
  hypothesesPropositions: string[];
  theoreticalFramework: string;
  literatureSynthesis: string;
  methodologyPlan: string;
  expectedContribution: string;
  limitations: string[];
  futureWorkDirections: string[];
  evidenceBoundary: string;
};

export type ConceptualFrameworkNode = {
  id: string;
  label: string;
  type: "theory" | "independent" | "mediator" | "moderator" | "dependent" | "context";
};

export type ConceptualFrameworkEdge = {
  source: string;
  target: string;
  label: string;
  explanation: string;
};

export type ConceptualFramework = {
  modelTitle: string;
  nodes: ConceptualFrameworkNode[];
  edges: ConceptualFrameworkEdge[];
  mediatorModeratorSuggestions: string[];
  theoryIntegrationDiagram: string;
  causalPathwayExplanation: string;
  evidenceBoundary: string;
};

export type ResearchReasoningWorkflow = {
  theoryComparison: string[];
  methodologyTradeoffs: string[];
  designSelection: string;
  publicationStrategyReasoning: string[];
  interdisciplinarySynthesis: string[];
};

export type RefinementAction = {
  action: "improve_weak_topic" | "reduce_oversaturation" | "increase_publishability" | "improve_novelty" | "simplify_scope" | "follow_up_chain";
  title: string;
  recommendation: string;
  rationale: string;
  evidence: string;
};

export type LiteratureWorkspaceItem = {
  paperId: string;
  title: string;
  cluster: string;
  theme: string;
  annotation: string;
  contradictionTag: "none" | "possible contradiction" | "methodological tension" | "theoretical tension";
  evidenceStrength: "low" | "medium" | "high";
};

export type LiteratureReviewWorkspace = {
  annotations: LiteratureWorkspaceItem[];
  paperClusters: ResearchCluster[];
  thematicCategories: EvidenceItem[];
  contradictionTags: DebateSignal[];
  evidenceStrengthSummary: string;
  draftingWorkspaceMarkdown: string;
};

export type AcademicWritingIntelligence = {
  academicToneRewrite: string;
  contributionStatements: string[];
  significanceStatements: string[];
  discussionSuggestions: string[];
  futureResearchSuggestions: string[];
};

export type ResearchWorkflowAutomation = {
  thesisDissertationPlan: RoadmapItem[];
  conferencePaperPlan: RoadmapItem[];
  journalTargetingPlan: RoadmapItem[];
  multiPaperAgendaConstruction: RoadmapItem[];
  longTermStrategy: RoadmapItem[];
};

export type AcademicResearchOS = {
  proposalDraft: ResearchProposalDraft;
  conceptualFramework: ConceptualFramework;
  reasoningWorkflow: ResearchReasoningWorkflow;
  refinementActions: RefinementAction[];
  literatureWorkspace: LiteratureReviewWorkspace;
  writingIntelligence: AcademicWritingIntelligence;
  workflowAutomation: ResearchWorkflowAutomation;
};

export type ContinuousResearchIntelligence = {
  monitoringMode: "current-session snapshot";
  emergingScholarlyTrends: RoadmapItem[];
  newlyRisingTheoriesTopics: EvidenceItem[];
  acceleratingDomains: CompetitionSignal[];
  dynamicTheoryRelationshipUpdates: Array<{
    source: string;
    target: string;
    update: string;
    evidence: string;
    paperIds: string[];
  }>;
  gapRefinementLog: string[];
  updateBoundary: string;
};

export type ResearchEvaluationScore = {
  criterion:
    | "novelty"
    | "feasibility"
    | "methodological_rigor"
    | "publication_potential"
    | "interdisciplinary_strength"
    | "theoretical_coherence"
    | "empirical_testability"
    | "replication_potential";
  score: number;
  reasoning: string;
  evidence: string;
};

export type EvaluatedResearchIdea = {
  topicTitle: string;
  scores: ResearchEvaluationScore[];
  overall: number;
  recommendation: string;
  transparencyNote: string;
};

export type IntelligentResearchEvaluation = {
  evaluatedTopics: EvaluatedResearchIdea[];
  proposalEvaluation: ResearchEvaluationScore[];
  evaluationBoundary: string;
};

export type InstitutionalIntelligence = {
  departmentResearchMap: Array<{
    area: string;
    paperCount: number;
    evidencePaperIds: string[];
  }>;
  labGroupAlignment: Array<{
    group: string;
    alignment: string;
    evidence: string;
    paperIds: string[];
  }>;
  institutionalTrends: InstitutionTrend[];
  facultyExpertiseMatches: AuthorInfluence[];
  collaborationOpportunities: Array<{
    source: string;
    target: string;
    opportunity: string;
    evidence: string;
    paperIds: string[];
  }>;
  strategicPlanningDashboard: string[];
  evidenceBoundary: string;
};

export type AIResearchMentor = {
  critique: string[];
  strongerTheoreticalGrounding: string[];
  hiddenAssumptions: string[];
  methodologicalImprovements: string[];
  oversaturationWarnings: string[];
  beginnerGuidanceSteps: string[];
  mentorBoundary: string;
};

export type AdvancedScholarlyKnowledgeGraph = {
  authorRelationships: CollaborationEdge[];
  institutionRelationships: CollaborationEdge[];
  theoryEvolutionChains: Array<{
    theory: string;
    chain: string[];
    evidence: string;
    paperIds: string[];
  }>;
  methodologyLineage: Array<{
    method: string;
    lineage: string[];
    evidence: string;
  }>;
  interdisciplinaryBridges: InterdisciplinaryBridge[];
  longRangeConceptDiscovery: ExplorationPath[];
  graphBoundary: string;
};

export type ResearchScenario = {
  scenario:
    | "high-risk/high-reward"
    | "safe publishable path"
    | "long-term research agenda"
    | "dissertation roadmap"
    | "interdisciplinary expansion";
  recommendation: string;
  expectedUpside: string;
  risks: string[];
  nextSteps: string[];
  evidence: string;
};

export type ResearchSimulationAnalysis = {
  scenarios: ResearchScenario[];
  preferredScenario: string;
  simulationBoundary: string;
};

export type SelfImprovingAcademicIntelligence = {
  researcherProfile: ResearcherProfile;
  personalizedRecommendationSummary: string;
  continuousIntelligence: ContinuousResearchIntelligence;
  evaluationEngine: IntelligentResearchEvaluation;
  institutionalIntelligence: InstitutionalIntelligence;
  mentorMode: AIResearchMentor;
  advancedKnowledgeGraph: AdvancedScholarlyKnowledgeGraph;
  scenarioAnalysis: ResearchSimulationAnalysis;
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
  datasetIntelligence: DatasetIntelligence;
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
    strategy: ResearchStrategy;
  };
  papers: RetrievedPaper[];
  synthesis: Synthesis;
  theoryGraph: TheoryGraph;
  relationshipAnalysis: RelationshipInsight[];
  trendAnalysis: TrendAnalysis;
  citationIntelligence: CitationIntelligence;
  bibliometricAnalysis: BibliometricAnalysis;
  literatureMap: LiteratureMap;
  literatureReviewDraft: LiteratureReviewDraft;
  debateAnalysis: DebateSignal[];
  researchRoadmap: ResearchRoadmap;
  publicationIntelligence: PublicationIntelligence;
  datasetIntelligence: DatasetIntelligence;
  longTermResearchRoadmap: LongTermResearchRoadmap;
  competitionIntelligence: ResearchCompetitionIntelligence;
  exportBundle: ExportBundle;
  multiAgentWorkflow: MultiAgentWorkflow;
  autonomousExploration: AutonomousExploration;
  deepResearchSynthesis: DeepResearchSynthesis;
  researchForecast: ResearchForecast;
  researchMemorySeed: ResearchMemorySeed;
  academicResearchOS: AcademicResearchOS;
  selfImprovingIntelligence: SelfImprovingAcademicIntelligence;
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
