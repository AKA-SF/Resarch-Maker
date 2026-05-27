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

export type ZoteroConnectionState = "connected" | "unavailable" | "error";

export type ZoteroConnectionStatus = {
  state: ZoteroConnectionState;
  localApiUrl: string;
  localApiEnabled: boolean | null;
  message: string;
  checkedAt: string;
  privacyBoundary: string;
};

export type ZoteroCollection = {
  key: string;
  name: string;
  parentKey: string | null;
  itemCount: number | null;
};

export type ZoteroLibraryItem = {
  key: string;
  title: string;
  year: number | null;
  itemType: string;
  creators: string[];
  publicationTitle: string;
  doi: string | null;
  url: string | null;
  abstractNote: string;
  tags: string[];
  collectionKeys: string[];
  citationKey: string | null;
  hasPdfAttachment: boolean;
  pdfAttachmentKeys: string[];
};

export type ZoteroPdfInsight = {
  itemKey: string;
  title: string;
  theoriesFrameworks: string[];
  methodologies: string[];
  variablesConcepts: string[];
  limitations: string[];
  futureWork: string[];
  datasetsSamples: string[];
  contradictionSignals: string[];
  source: "zotero-indexed-fulltext" | "metadata-only";
  evidenceBoundary: string;
};

export type ZoteroPersonalResearchIntelligence = {
  inferredResearchInterests: EvidenceItem[];
  dominantTheories: EvidenceItem[];
  dominantMethodologies: EvidenceItem[];
  adjacentUnexploredAreas: string[];
  personalizedResearchGaps: string[];
  recommendedTopics: string[];
  readingQueueRecommendations: Array<{
    itemKey: string;
    title: string;
    reason: string;
  }>;
  personalTheoryGraph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  methodologyDistribution: Array<{
    methodology: string;
    count: number;
  }>;
  topicClusters: Array<{
    label: string;
    itemKeys: string[];
    evidence: string;
  }>;
  literatureReviewDraft: {
    retrievedEvidence: string[];
    generatedSynthesis: string;
    gapSummary: string[];
    futureDirections: string[];
  };
  workflowIntegration: {
    exportableCollectionSuggestions: string[];
    citationExportFormats: string[];
    savedAgendaSuggestions: string[];
    persistenceBoundary: string;
  };
  privacyBoundary: string;
};

export type ZoteroSyncResult = {
  status: ZoteroConnectionStatus;
  collections: ZoteroCollection[];
  items: ZoteroLibraryItem[];
  pdfInsights: ZoteroPdfInsight[];
  personalIntelligence: ZoteroPersonalResearchIntelligence;
  diagnostics: {
    itemsImported: number;
    collectionsImported: number;
    pdfsDetected: number;
    pdfsAnalyzed: number;
    fullTextMode: "indexed-snippets-only" | "metadata-only";
    warnings: string[];
  };
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

export type TopicCritiqueType =
  | "weak_theory_grounding"
  | "low_novelty"
  | "oversaturation"
  | "weak_methodology_fit"
  | "poor_data_feasibility"
  | "unclear_contribution";

export type TopicCritique = {
  type: TopicCritiqueType;
  severity: "low" | "medium" | "high";
  critique: string;
  evidence: string;
  generatedInference: string;
};

export type TopicImprovementAction = {
  action:
    | "strengthen_theory_combination"
    | "refine_research_question"
    | "improve_methodology_fit"
    | "reduce_oversaturated_framing"
    | "add_mediator_moderator"
    | "propose_variant";
  recommendation: string;
  rationale: string;
  evidence: string;
};

export type RefinedTopicScores = {
  novelty: number;
  feasibility: number;
  publishability: number;
  theoryCoherence: number;
  evidenceSupport: number;
};

export type TopicRefinementIteration = {
  iteration: number;
  stage: "generate" | "critique" | "improve" | "rescore" | "compare";
  summary: string;
  evidenceBoundary: string;
};

export type TopicRefinementResult = {
  topicId: string;
  initialTopic: Topic;
  critiques: TopicCritique[];
  improvementActions: TopicImprovementAction[];
  improvedTopic: Topic;
  initialScores: RefinedTopicScores;
  refinedScores: RefinedTopicScores;
  scoreDelta: RefinedTopicScores;
  comparisonSummary: string;
  saferVariant: string;
  novelVariant: string;
  iterationHistory: TopicRefinementIteration[];
  evidencePaperIds: string[];
};

export type AgenticResearchLoop = {
  loopId: string;
  workflow: TopicRefinementIteration[];
  topicRefinements: TopicRefinementResult[];
  rerankedTopics: Array<{
    title: string;
    overallScore: number;
    rank: number;
    rationale: string;
  }>;
  loopBoundary: string;
};

export type MemoryEmbeddingType = "paper" | "topic" | "theory" | "gap" | "literature_summary" | "profile_interest";

export type MemoryEmbeddingItem = {
  id: string;
  type: MemoryEmbeddingType;
  label: string;
  text: string;
  vector: number[];
  sourceSessionId: string;
  evidencePaperIds: string[];
};

export type SemanticRetrievalResult = {
  id: string;
  type: MemoryEmbeddingType;
  label: string;
  similarity: number;
  evidence: string;
  sourceSessionId: string;
  evidencePaperIds: string[];
};

export type ScholarlyMemoryRecord = {
  sessionId: string;
  createdAt: string;
  keywords: string[];
  discipline: Discipline;
  methodology: Methodology;
  strategy: ResearchStrategy;
  generatedTopicTitles: string[];
  theoryRelationships: Array<{
    source: string;
    target: string;
    evidence: string;
    paperIds: string[];
  }>;
  literatureSummaries: string[];
  gapAnalyses: string[];
  refinementHistory: string[];
  userResearchInterests: string[];
};

export type UnifiedGraphNodeType =
  | "paper"
  | "author"
  | "theory"
  | "concept"
  | "methodology"
  | "dataset"
  | "venue"
  | "institution"
  | "discipline"
  | "topic";

export type UnifiedKnowledgeGraphNode = {
  id: string;
  label: string;
  type: UnifiedGraphNodeType;
  support: number;
  evidencePaperIds: string[];
};

export type UnifiedKnowledgeGraphEdge = {
  id: string;
  source: string;
  target: string;
  relation:
    | "authored_by"
    | "affiliated_with"
    | "published_in"
    | "uses_methodology"
    | "has_concept"
    | "grounded_in_theory"
    | "recommends_dataset"
    | "belongs_to_discipline"
    | "similar_to"
    | "bridges";
  weight: number;
  evidence: string;
  evidencePaperIds: string[];
  inferred: boolean;
};

export type MultiHopDiscoveryPath = {
  path: string[];
  explanation: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
};

export type UnifiedScholarlyKnowledgeGraph = {
  nodes: UnifiedKnowledgeGraphNode[];
  edges: UnifiedKnowledgeGraphEdge[];
  multiHopDiscoveries: MultiHopDiscoveryPath[];
  hiddenRelationshipCandidates: MultiHopDiscoveryPath[];
  interdisciplinaryBridgeDiscoveries: MultiHopDiscoveryPath[];
  longRangeConceptExploration: MultiHopDiscoveryPath[];
  graphBoundary: string;
};

export type VectorRetrievalMemory = {
  embeddingModel: "local-hashing-v1";
  embeddingDimension: number;
  embeddingsGenerated: number;
  semanticSearchResults: SemanticRetrievalResult[];
  theorySimilarityResults: SemanticRetrievalResult[];
  relatedTopicDiscoveries: SemanticRetrievalResult[];
  crossSessionRecall: SemanticRetrievalResult[];
  retrievalBoundary: string;
};

export type IntelligentResearchRecall = {
  repeatedOrSimilarTopics: SemanticRetrievalResult[];
  rememberedPriorIdeas: string[];
  unexploredAdjacentPaths: MultiHopDiscoveryPath[];
  continuedResearchAgenda: string[];
  oldSessionConnections: SemanticRetrievalResult[];
  recallBoundary: string;
};

export type AdvancedDiscoveryWorkflows = {
  semanticExplorationMode: string[];
  relatedDomainsWorkflow: MultiHopDiscoveryPath[];
  hiddenTheoryConnectionDiscovery: MultiHopDiscoveryPath[];
  interdisciplinaryExpansionSuggestions: string[];
  adjacentResearchOpportunities: string[];
};

export type PersistentScholarlyMemory = {
  currentSession: ScholarlyMemoryRecord;
  priorSessionCount: number;
  storedTopicCount: number;
  storedTheoryRelationshipCount: number;
  memoryRecords: ScholarlyMemoryRecord[];
  vectorRetrieval: VectorRetrievalMemory;
  unifiedKnowledgeGraph: UnifiedScholarlyKnowledgeGraph;
  researchRecall: IntelligentResearchRecall;
  discoveryWorkflows: AdvancedDiscoveryWorkflows;
  persistence: {
    enabled: boolean;
    storage: "local-json";
    namespace: string;
    lastSavedAt: string | null;
    warning: string;
  };
};

export type PredictiveSignal = {
  label: string;
  score: number;
  direction: "rising" | "declining" | "stable" | "saturated" | "accelerating";
  horizon: "near-term" | "mid-term" | "long-term";
  evidence: string;
  generatedForecast: string;
  confidence: "low" | "medium" | "high";
  evidencePaperIds: string[];
};

export type PredictiveResearchForecasting = {
  emergingResearchDomains: PredictiveSignal[];
  risingTheoriesFrameworks: PredictiveSignal[];
  futureMethodologyTrends: PredictiveSignal[];
  acceleratingInterdisciplinaryAreas: PredictiveSignal[];
  decliningSaturatedTopics: PredictiveSignal[];
  likelyFutureHotTopics: PredictiveSignal[];
  forecastBoundary: string;
};

export type PublicationOutcomeEstimate = {
  topicTitle: string;
  publishabilityLikelihood: number;
  journalConferenceFit: number;
  citationPotential: number;
  noveltyDurability: number;
  methodologicalAcceptanceLikelihood: number;
  interdisciplinaryImpactPotential: number;
  reasoning: string[];
  evidence: string;
  warning: string;
};

export type AdvancedPredictiveEvaluation = {
  topicTitle: string;
  theoreticalCoherence: number;
  empiricalTestability: number;
  methodologicalRigor: number;
  replicationFeasibility: number;
  literatureSupportStrength: number;
  practicalRelevance: number;
  longTermResearchScalability: number;
  overall: number;
  reasoning: string[];
};

export type ResearchOptimizationVariant = {
  variant: "publication_likelihood" | "novelty" | "feasibility" | "risk_impact_balance";
  title: string;
  optimizedResearchQuestion: string;
  strategy: string;
  expectedTradeoff: string;
  scoreProfile: {
    novelty: number;
    feasibility: number;
    publishability: number;
    impact: number;
    risk: number;
  };
  evidence: string;
};

export type PredictiveStrategySimulation = {
  scenario:
    | "safe_publication_path"
    | "high_risk_high_impact_path"
    | "dissertation_strategy"
    | "multi_paper_agenda"
    | "interdisciplinary_expansion"
    | "long_term_positioning";
  predictedUpside: string;
  riskWarnings: string[];
  recommendedMoves: string[];
  comparativeScore: number;
  evidence: string;
};

export type ResearchImpactIntelligence = {
  predictedContributionAreas: PredictiveSignal[];
  likelyResearchCommunitiesImpacted: Array<{
    community: string;
    likelihood: number;
    evidence: string;
  }>;
  potentialInterdisciplinaryInfluence: PredictiveSignal[];
  futureExpansionOpportunities: string[];
  downstreamResearchPathways: string[];
  impactBoundary: string;
};

export type PredictiveAcademicIntelligence = {
  forecasting: PredictiveResearchForecasting;
  publicationOutcomes: PublicationOutcomeEstimate[];
  advancedEvaluation: AdvancedPredictiveEvaluation[];
  optimizationVariants: ResearchOptimizationVariant[];
  strategySimulations: PredictiveStrategySimulation[];
  impactIntelligence: ResearchImpactIntelligence;
  comparativeScenarioAnalysis: string[];
  predictionBoundary: string;
};

export type AutonomousWorkflowStageStatus = "completed" | "ready" | "needs_review" | "blocked";

export type AutonomousWorkflowStage = {
  id:
    | "topic_generation"
    | "proposal_generation"
    | "literature_synthesis"
    | "methodology_planning"
    | "optimization"
    | "production_export";
  label: string;
  status: AutonomousWorkflowStageStatus;
  ownerAgent: ResearchAgentRole | "operating_system";
  inputSummary: string;
  outputSummary: string;
  evidenceBoundary: string;
  nextAction: string;
};

export type ResearchProductionPipeline = {
  literatureReviewDraft: string;
  conceptualFrameworkDraft: string;
  methodologySectionDraft: string;
  discussionContributionDraft: string;
  futureResearchSection: string;
  conferenceAbstractDraft: string;
  productionBoundary: string;
};

export type StudyDependency = {
  study: string;
  dependsOn: string[];
  milestone: string;
  status: "planned" | "ready" | "needs_evidence";
};

export type IntelligentResearchPlanner = {
  dissertationThesisPlan: StudyDependency[];
  multiPaperAgenda: StudyDependency[];
  publicationSequencing: string[];
  longTermRoadmap: string[];
  milestoneTracking: Array<{
    milestone: string;
    dueOrder: number;
    evidence: string;
    status: "completed" | "ready" | "needs_review";
  }>;
  plannerBoundary: string;
};

export type ScholarlyReasoningPanel = {
  competingTheoryEvaluation: string[];
  causalVsExploratoryReasoning: string[];
  methodologyTradeoffAnalysis: string[];
  evidenceStrengthEstimation: string[];
  contradictionResolutionWorkflow: string[];
  interdisciplinarySynthesisReasoning: string[];
  reasoningBoundary: string;
};

export type AutonomousMonitoringAlert = {
  type:
    | "emerging_topic"
    | "rising_theory"
    | "publication_surge"
    | "declining_saturated_domain"
    | "interdisciplinary_opportunity"
    | "methodology_shift";
  label: string;
  severity: "info" | "watch" | "act";
  evidence: string;
  suggestedAction: string;
};

export type AdaptiveOptimizationControl = {
  objective:
    | "novelty"
    | "publishability"
    | "feasibility"
    | "interdisciplinary_impact"
    | "theoretical_rigor"
    | "practical_relevance"
    | "fast_publication"
    | "long_term_positioning";
  recommendedMove: string;
  expectedTradeoff: string;
  evidence: string;
  priority: number;
};

export type AutonomousWorkspaceCollaboration = {
  projectId: string;
  projectTitle: string;
  collaborators: string[];
  proposalVersions: Array<{
    version: string;
    title: string;
    changeSummary: string;
    evidence: string;
  }>;
  researchEvolutionHistory: string[];
  exportableDossierSections: string[];
  persistenceBoundary: string;
};

export type AutonomousAcademicOperatingSystem = {
  workflowRunId: string;
  workflowStages: AutonomousWorkflowStage[];
  adaptiveStateSummary: string;
  agentCoordination: MultiAgentWorkflow;
  productionPipeline: ResearchProductionPipeline;
  researchPlanner: IntelligentResearchPlanner;
  scholarlyReasoning: ScholarlyReasoningPanel;
  monitoringAlerts: AutonomousMonitoringAlert[];
  optimizationControls: AdaptiveOptimizationControl[];
  workspaceCollaboration: AutonomousWorkspaceCollaboration;
  progressDashboard: Array<{
    label: string;
    completed: number;
    total: number;
    status: "on_track" | "needs_review" | "blocked";
  }>;
  operatingBoundary: string;
};

export type ContinuousScholarlyLearning = {
  ingestionWorkflow: Array<{
    step: "retrieve" | "compare" | "update_graph" | "refine_gaps" | "rescore_topics" | "refresh_forecast";
    status: "completed" | "ready" | "needs_review";
    evidence: string;
    nextAction: string;
  }>;
  theoryRelationshipUpdates: Array<{
    source: string;
    target: string;
    previousSignal: string;
    updatedSignal: string;
    evidence: string;
    paperIds: string[];
  }>;
  gapRefinements: Array<{
    originalGap: string;
    refinedGap: string;
    evidence: string;
    confidence: "low" | "medium" | "high";
  }>;
  topicScoringEvolution: Array<{
    topicTitle: string;
    previousScore: number;
    evolvedScore: number;
    reason: string;
  }>;
  interdisciplinaryBridgeDetections: MultiHopDiscoveryPath[];
  forecastingModelAdaptations: string[];
  learningBoundary: string;
};

export type SelfEvolvingKnowledgeGraph = {
  ecosystemNodes: UnifiedKnowledgeGraphNode[];
  ecosystemEdges: UnifiedKnowledgeGraphEdge[];
  dynamicRelationshipUpdates: ContinuousScholarlyLearning["theoryRelationshipUpdates"];
  multiHopDiscovery: MultiHopDiscoveryPath[];
  hiddenConceptDiscovery: MultiHopDiscoveryPath[];
  evolvingTheoryLineage: Array<{
    theory: string;
    lineage: string[];
    evidence: string;
    paperIds: string[];
  }>;
  graphEvolutionSummary: string;
  graphBoundary: string;
};

export type EcosystemMonitoringFeed = {
  type:
    | "fast_growing_area"
    | "oversaturated_domain"
    | "funding_aligned_trend"
    | "institutional_shift"
    | "publication_surge"
    | "emerging_methodology"
    | "interdisciplinary_convergence";
  label: string;
  priority: "low" | "medium" | "high";
  evidence: string;
  generatedInterpretation: string;
  suggestedAction: string;
  paperIds: string[];
};

export type ResearchBenchmark = {
  topicTitle: string;
  literatureDensity: number;
  methodologicalRigorNormFit: number;
  journalExpectationFit: number;
  interdisciplinaryNovelty: number;
  likelyCitationPotential: number;
  longTermScalability: number;
  overallBenchmark: number;
  reasoning: string[];
  evidence: string;
};

export type AdaptiveAgentCoordination = {
  theoryDebates: Array<{
    positionA: string;
    positionB: string;
    resolution: string;
    evidence: string;
  }>;
  methodologyComparisons: Array<{
    methodA: string;
    methodB: string;
    recommendation: string;
    tradeoff: string;
    evidence: string;
  }>;
  proposalCritiques: string[];
  iterativePlanImprovements: string[];
  coordinationBoundary: string;
};

export type InstitutionalTeamIntelligence = {
  departmentResearchProfiling: InstitutionalIntelligence["departmentResearchMap"];
  labGroupCollaborationMapping: InstitutionalIntelligence["labGroupAlignment"];
  facultyExpertiseAlignment: InstitutionalIntelligence["facultyExpertiseMatches"];
  strategicResearchDashboard: string[];
  collaborationOpportunityDiscovery: InstitutionalIntelligence["collaborationOpportunities"];
  institutionalBoundary: string;
};

export type AdvancedWorkspaceEcosystem = {
  persistentWorkspaceStatus: string;
  teamCollaborationHub: string[];
  versionedProposalEvolution: AutonomousWorkspaceCollaboration["proposalVersions"];
  longTermResearchMemory: string[];
  crossProjectKnowledgeSharing: string[];
  exportableInstitutionalDossier: string[];
  workspaceBoundary: string;
};

export type LongTermResearchTrajectoryView = {
  trajectory: string;
  currentPosition: string;
  nextMilestones: string[];
  evidence: string;
};

export type SelfEvolvingAcademicEcosystem = {
  ecosystemRunId: string;
  continuousLearning: ContinuousScholarlyLearning;
  selfEvolvingKnowledgeGraph: SelfEvolvingKnowledgeGraph;
  ecosystemMonitoringFeeds: EcosystemMonitoringFeed[];
  researchBenchmarking: ResearchBenchmark[];
  adaptiveAgentCoordination: AdaptiveAgentCoordination;
  institutionalTeamIntelligence: InstitutionalTeamIntelligence;
  advancedWorkspaceEcosystem: AdvancedWorkspaceEcosystem;
  longTermTrajectoryViews: LongTermResearchTrajectoryView[];
  ecosystemBoundary: string;
};

export type SelfEvaluationWorkflow = {
  topicTitle: string;
  qualityScore: number;
  evidenceCoverage: number;
  weakReasoningChains: string[];
  unsupportedTheoreticalAssumptions: string[];
  methodologyCritique: string;
  autonomousImprovementActions: string[];
  evaluationBoundary: string;
};

export type AutonomousScholarlyEvolution = {
  theoryRelationshipRefinements: ContinuousScholarlyLearning["theoryRelationshipUpdates"];
  topicScoringModelUpdates: ContinuousScholarlyLearning["topicScoringEvolution"];
  forecastingLogicAdaptations: string[];
  gapDetectionImprovements: ContinuousScholarlyLearning["gapRefinements"];
  priorOutcomeLearning: string[];
  longTermRecommendationOptimizations: string[];
  evolutionBoundary: string;
};

export type GlobalAcademicEcosystemIntelligence = {
  disciplineEcosystems: Array<{
    discipline: string;
    signal: string;
    evidence: string;
  }>;
  institutionEcosystems: InstitutionalTeamIntelligence["facultyExpertiseAlignment"];
  journalConferenceEcosystems: Array<{
    venue: string;
    fitSignal: string;
    evidence: string;
  }>;
  fundingTrendProxies: EcosystemMonitoringFeed[];
  collaborationNetworkSignals: InstitutionalTeamIntelligence["collaborationOpportunityDiscovery"];
  emergingInterdisciplinaryEcosystems: EcosystemMonitoringFeed[];
  ecosystemBoundary: string;
};

export type AdvancedScholarlySignalDetection = {
  weakSignals: EcosystemMonitoringFeed[];
  earlyInterdisciplinaryConvergence: MultiHopDiscoveryPath[];
  acceleratingMethodologies: EcosystemMonitoringFeed[];
  hiddenConceptRelationships: MultiHopDiscoveryPath[];
  underRecognizedOpportunities: string[];
  futureHighImpactDomains: EcosystemMonitoringFeed[];
  signalBoundary: string;
};

export type AudienceResearchStrategy = {
  audience: "graduate_student" | "professor" | "research_lab" | "institution" | "interdisciplinary_team" | "publication_agenda" | "funding_aligned_direction";
  strategyTitle: string;
  recommendedMoves: string[];
  riskControls: string[];
  evidence: string;
};

export type ResearchQualityAssuranceLayer = {
  evidenceConfidenceEstimates: Array<{
    target: string;
    confidence: "low" | "medium" | "high";
    evidence: string;
  }>;
  hallucinationRiskFlags: Array<{
    target: string;
    risk: "low" | "medium" | "high";
    reason: string;
  }>;
  unsupportedClaimChecks: string[];
  citationConsistencyChecks: string[];
  reasoningChainValidation: string[];
  methodologicalPlausibilityValidation: string[];
  qaBoundary: string;
};

export type GlobalAutonomousScholarlyNetwork = {
  networkRunId: string;
  selfEvaluationWorkflows: SelfEvaluationWorkflow[];
  autonomousScholarlyEvolution: AutonomousScholarlyEvolution;
  globalAcademicEcosystemIntelligence: GlobalAcademicEcosystemIntelligence;
  advancedSignalDetection: AdvancedScholarlySignalDetection;
  autonomousResearchStrategies: AudienceResearchStrategy[];
  researchQualityAssurance: ResearchQualityAssuranceLayer;
  networkBoundary: string;
};

export type ReasoningTraceStep = {
  step: "retrieved_evidence" | "extracted_signal" | "generated_inference" | "scored_decision" | "human_review_needed";
  summary: string;
  evidencePaperIds: string[];
  confidence: "low" | "medium" | "high";
};

export type VerifiableReasoningTrace = {
  id: string;
  targetType: "topic" | "gap" | "methodology" | "theory_relationship" | "forecast";
  target: string;
  conclusion: string;
  traceSteps: ReasoningTraceStep[];
  supportingPapers: Array<{
    id: string;
    title: string;
    year: number | null;
    source: string;
  }>;
  supportingTheories: string[];
  confidenceScore: number;
  evidencePathSummary: string;
};

export type GovernanceReliabilityLayer = {
  hallucinationDetection: ResearchQualityAssuranceLayer["hallucinationRiskFlags"];
  unsupportedClaimDetection: ResearchQualityAssuranceLayer["unsupportedClaimChecks"];
  citationConsistencyValidation: ResearchQualityAssuranceLayer["citationConsistencyChecks"];
  methodologyPlausibilityChecks: ResearchQualityAssuranceLayer["methodologicalPlausibilityValidation"];
  contradictionAwareness: string[];
  outputConfidenceScores: ResearchQualityAssuranceLayer["evidenceConfidenceEstimates"];
  governanceBoundary: string;
};

export type TransparentAIDecision = {
  decisionType: "topic_ranking" | "methodology_recommendation" | "theory_relationship" | "gap_detection" | "forecast_influence";
  decision: string;
  why: string;
  evidenceInfluence: string[];
  relatedTraceIds: string[];
  confidence: "low" | "medium" | "high";
};

export type AutonomousResearchAudit = {
  auditId: string;
  target: string;
  theoryCoherence: number;
  evidenceStrength: number;
  methodologyValidity: number;
  noveltyJustification: number;
  interdisciplinaryPlausibility: number;
  publicationFeasibility: number;
  findings: string[];
  requiredHumanChecks: string[];
};

export type HumanInTheLoopWorkflow = {
  feedbackIntegration: string[];
  expertOverrides: Array<{
    target: string;
    editableDecision: string;
    currentRecommendation: string;
  }>;
  collaborativeReviewQueue: Array<{
    reviewerRole: "researcher" | "advisor" | "methodologist" | "domain_expert" | "institution_admin";
    item: string;
    requestedAction: string;
  }>;
  proposalApprovalStates: Array<{
    proposal: string;
    status: "draft" | "needs_review" | "approved_candidate" | "rejected_candidate";
    reason: string;
  }>;
  reviewerCommentPrompts: string[];
  reviewBoundary: string;
};

export type ScalableScholarlyInfrastructure = {
  ingestionPipelinePlan: string[];
  scheduledUpdatePlan: string[];
  institutionWorkspaceModel: string[];
  longTermPersistencePlan: string[];
  multiUserCollaborationModel: string[];
  roleBasedEnvironments: Array<{
    role: "student" | "researcher" | "advisor" | "lab_admin" | "institution_admin";
    permissions: string[];
  }>;
  infrastructureBoundary: string;
};

export type TrustedAcademicIntelligenceInfrastructure = {
  trustedRunId: string;
  reasoningTraces: VerifiableReasoningTrace[];
  evidenceLineageViews: VerifiableReasoningTrace[];
  governanceReliability: GovernanceReliabilityLayer;
  transparentDecisions: TransparentAIDecision[];
  autonomousResearchAudits: AutonomousResearchAudit[];
  humanInTheLoop: HumanInTheLoopWorkflow;
  scalableInfrastructure: ScalableScholarlyInfrastructure;
  trustBoundary: string;
};

export type ResearchInstrumentPackage = {
  surveyQuestionnaireDraft: Array<{
    construct: string;
    items: string[];
    responseScale: string;
    evidence: string;
  }>;
  interviewProtocol: string[];
  focusGroupGuide: string[];
  observationFramework: string[];
  experimentalProcedureOutline: string[];
  measurementScaleSuggestions: Array<{
    construct: string;
    scaleType: string;
    adaptationNote: string;
  }>;
  instrumentBoundary: string;
};

export type StatisticalWorkflowIntelligence = {
  recommendedStatisticalMethods: string[];
  analysisPipeline: string[];
  variableOperationalization: Array<{
    variable: string;
    operationalDefinition: string;
    measurementSuggestion: string;
  }>;
  dataPreprocessingWorkflow: string[];
  reliabilityValidityChecks: string[];
  modelSelectionSuggestions: string[];
  qualitativeCodingWorkflow: string[];
  workflowBoundary: string;
};

export type ResearchCodeTemplate = {
  language: "R" | "Python" | "SPSS" | "Stata" | "RMarkdown/Quarto" | "Jupyter";
  workflow: "regression" | "SEM/PLS-SEM" | "multilevel" | "Bayesian" | "thematic_analysis" | "bibliometric" | "visualization";
  title: string;
  code: string;
  notes: string[];
};

export type ResearchExecutionPlan = {
  stepByStepPlan: string[];
  dataCollectionTimeline: Array<{
    phase: string;
    duration: string;
    deliverable: string;
  }>;
  milestoneSchedule: string[];
  publicationRoadmap: string[];
  dissertationWorkflow: string[];
  replicationChecklist: string[];
};

export type AcademicWritingWorkflow = {
  publicationReadyOutline: string[];
  journalStyleFormattingGuidance: string[];
  discussionConclusionDraft: string;
  contributionFraming: string[];
  reviewerResponseSuggestions: string[];
  revisionStrategyRecommendations: string[];
  writingBoundary: string;
};

export type ResearchReproducibilityLayer = {
  reproducibilityChecklist: string[];
  methodologyCompletenessValidation: string[];
  missingVariableDetection: string[];
  citationConsistencyChecks: string[];
  workflowAuditTrail: string[];
  reproducibilityBoundary: string;
};

export type ExternalWorkflowIntegrationPlan = {
  zotero: string[];
  overleaf: string[];
  notion: string[];
  csvExcelDatasets: string[];
  jupyterNotebooks: string[];
  rmarkdownQuartoExports: string[];
  integrationBoundary: string;
};

export type FullResearchWorkflowCopilot = {
  workflowRunId: string;
  instrumentPackage: ResearchInstrumentPackage;
  statisticalWorkflow: StatisticalWorkflowIntelligence;
  codeTemplates: ResearchCodeTemplate[];
  executionPlan: ResearchExecutionPlan;
  academicWritingWorkflow: AcademicWritingWorkflow;
  reproducibilityLayer: ResearchReproducibilityLayer;
  externalIntegrations: ExternalWorkflowIntegrationPlan;
  workflowBoundary: string;
};

export type SimulatedPeerReview = {
  reviewerMode: "harsh" | "constructive" | "journal_specific";
  journalStyle: string;
  targetTitle: string;
  methodologyRigorCritique: string[];
  weakArguments: string[];
  unsupportedClaims: string[];
  noveltyContributionAssessment: string;
  publicationReadinessScore: number;
  reviewerStyleFeedback: string[];
  revisionStrategies: string[];
  evidencePaperIds: string[];
  simulationBoundary: string;
};

export type PublicationOptimizationPlan = {
  targetVenue: string;
  venueEvidence: string;
  formattingStyleExpectations: string[];
  methodologicalAlignment: string[];
  contributionFraming: string[];
  noveltyPositioning: string[];
  interdisciplinaryRelevance: string[];
  reviewerExpectationAlignment: string[];
  optimizationBoundary: string;
};

export type CollaborativeAcademicWorkspace = {
  projectRoles: Array<{
    role: "student" | "supervisor" | "coauthor" | "methodologist" | "librarian";
    permissions: string[];
  }>;
  sharedLiteratureMaps: string[];
  collaborativeAnnotations: string[];
  proposalCoEditingPlan: string[];
  versionComparison: Array<{
    version: string;
    changeSummary: string;
    reviewStatus: "draft" | "needs_review" | "ready_for_supervisor" | "revision_required";
  }>;
  supervisorStudentWorkflow: string[];
  collaborationBoundary: string;
};

export type AdvancedRevisionIntelligence = {
  revisionSuggestions: string[];
  clarityImprovements: string[];
  academicToneRefinements: string[];
  contributionStrengthening: string[];
  reviewerResponseDrafts: string[];
  rebuttalLetterDraft: string;
  publicationCoverLetterDraft: string;
  writingBoundary: string;
};

export type ResearchLifecycleManagement = {
  stages: Array<{
    stage: "topic_ideation" | "proposal_evolution" | "literature_review" | "data_collection" | "analysis" | "manuscript_drafting" | "submission_revision";
    status: "not_started" | "in_progress" | "needs_review" | "ready";
    milestone: string;
    evidence: string;
  }>;
  timelineSummary: string[];
  lifecycleBoundary: string;
};

export type AcademicBenchmarkingIntelligence = {
  topPaperComparisons: Array<{
    retrievedPaperTitle: string;
    comparisonSignal: string;
    evidence: string;
  }>;
  journalStandardProxies: string[];
  methodologicalNorms: string[];
  citationExpectationSignals: string[];
  contributionDepthAssessment: string[];
  interdisciplinaryCompetitiveness: string[];
  benchmarkBoundary: string;
};

export type AcademicWorkflowConnectivity = {
  zotero: string[];
  overleaf: string[];
  notion: string[];
  github: string[];
  googleDocs: string[];
  jupyterQuarto: string[];
  csvExcel: string[];
  connectivityBoundary: string;
};

export type FullAutonomousScholarlyCollaborationPlatform = {
  collaborationRunId: string;
  peerReviewSimulations: SimulatedPeerReview[];
  publicationOptimization: PublicationOptimizationPlan[];
  collaborativeWorkspace: CollaborativeAcademicWorkspace;
  revisionIntelligence: AdvancedRevisionIntelligence;
  lifecycleManagement: ResearchLifecycleManagement;
  benchmarkingIntelligence: AcademicBenchmarkingIntelligence;
  workflowConnectivity: AcademicWorkflowConnectivity;
  platformBoundary: string;
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
  agenticResearchLoop: AgenticResearchLoop;
  persistentScholarlyMemory: PersistentScholarlyMemory;
  predictiveAcademicIntelligence: PredictiveAcademicIntelligence;
  autonomousAcademicOS: AutonomousAcademicOperatingSystem;
  selfEvolvingAcademicEcosystem: SelfEvolvingAcademicEcosystem;
  globalAutonomousScholarlyNetwork: GlobalAutonomousScholarlyNetwork;
  trustedAcademicIntelligenceInfrastructure: TrustedAcademicIntelligenceInfrastructure;
  researchWorkflowCopilot: FullResearchWorkflowCopilot;
  scholarlyCollaborationPlatform: FullAutonomousScholarlyCollaborationPlatform;
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
