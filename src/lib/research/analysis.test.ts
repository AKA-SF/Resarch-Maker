import { describe, expect, it } from "vitest";
import { buildResearchIntelligenceResult, detectGaps, synthesizeLiterature } from "./analysis";
import { disciplines, methodologies, type RetrievedPaper } from "./types";

const papers: RetrievedPaper[] = [
  {
    id: "p1",
    title: "AI education and self-efficacy in adaptive learning",
    year: 2025,
    doi: null,
    source: "Computers & Education",
    url: "https://example.test/p1",
    citedByCount: 12,
    concepts: ["Artificial intelligence", "Education", "Self-efficacy", "Learning analytics"],
    abstract: "This quantitative survey examines self-efficacy and adaptive AI education. Future research should test longitudinal designs.",
    authors: ["A. Researcher", "C. Collaborator"],
    institutions: ["Example University"],
    countries: ["KR"],
    referencedWorks: ["https://openalex.org/W100", "https://openalex.org/W101", "https://openalex.org/W102"],
    relatedWorks: ["p2"]
  },
  {
    id: "p2",
    title: "Technology acceptance model for AI tutors",
    year: 2024,
    doi: null,
    source: "Education and Information Technologies",
    url: "https://example.test/p2",
    citedByCount: 8,
    concepts: ["Technology acceptance model", "Human-computer interaction"],
    abstract: "The technology acceptance model is used to study AI tutors and learning outcomes with regression analysis. However, findings remain mixed across contexts.",
    authors: ["B. Scholar", "C. Collaborator"],
    institutions: ["Example University", "Second Institute"],
    countries: ["KR", "US"],
    referencedWorks: ["https://openalex.org/W100", "https://openalex.org/W101", "https://openalex.org/W102", "https://openalex.org/W103"],
    relatedWorks: ["p1"]
  }
];

describe("research analysis", () => {
  it("extracts theories from retrieved metadata", () => {
    const synthesis = synthesizeLiterature(papers);
    expect(synthesis.theories.map((item) => item.label)).toContain("self-efficacy");
    expect(synthesis.trends.length).toBeGreaterThan(0);
  });

  it("detects methodology coverage and gap signals without fabricated citations", () => {
    const synthesis = synthesizeLiterature(papers);
    const gaps = detectGaps(["AI", "education", "self-efficacy"], "meta-analysis", papers, synthesis);
    expect(gaps.some((gap) => gap.type === "weak_methodology_coverage")).toBe(true);
    expect(gaps.every((gap) => typeof gap.evidence === "string")).toBe(true);
  });

  it("flags weak causal quantitative coverage from evidence counts", () => {
    const synthesis = synthesizeLiterature(papers);
    const gaps = detectGaps(["AI", "education", "self-efficacy"], "quantitative", papers, synthesis);
    expect(gaps.some((gap) => gap.claim.includes("인과적 또는 종단적"))).toBe(true);
  });

  it("generates scored topics linked to retrieved paper ids", () => {
    const result = buildResearchIntelligenceResult(["AI", "education", "self-efficacy"], "education", "quantitative", papers);
    expect(result.papers).toHaveLength(2);
    expect(result.topics.length).toBeGreaterThan(0);
    expect(result.topics[0].scores.novelty).toBeGreaterThanOrEqual(1);
    expect(result.topics[0].scores.saturation).toBeGreaterThanOrEqual(1);
    expect(result.topics[0].inferenceNotice).toMatch(/생성된 추론/);
  });

  it("builds theory graph, relationships, and trend intelligence", () => {
    const result = buildResearchIntelligenceResult(["AI", "education", "self-efficacy"], "education", "quantitative", papers);
    expect(result.theoryGraph.nodes.length).toBeGreaterThan(0);
    expect(result.theoryGraph.edges.length).toBeGreaterThan(0);
    expect(result.relationshipAnalysis.length).toBeGreaterThan(0);
    expect(result.trendAnalysis.frequencyOverTime.length).toBeGreaterThan(0);
  });

  it("generates copilot planning, methodology guidance, and topic comparisons", () => {
    const result = buildResearchIntelligenceResult(["AI", "education", "self-efficacy"], "education", "quantitative", papers);
    expect(result.copilot.summary).toContain("코파일럿");
    expect(result.copilot.comparisons.length).toBe(result.topics.length);
    expect(result.topics[0].methodologyRecommendations.length).toBeGreaterThan(0);
    expect(result.topics[0].researchPlan.researchQuestions.length).toBeGreaterThan(0);
    expect(result.topics[0].risksLimitations.length).toBeGreaterThan(0);
  });

  it("supports expanded domains and advanced methodology guidance", () => {
    expect(disciplines).toContain("marketing");
    expect(disciplines).toContain("healthcare/public health");
    expect(disciplines).toContain("AI/data science");
    expect(methodologies).toContain("PLS-SEM");
    expect(methodologies).toContain("causal inference");
    expect(methodologies).toContain("bibliometric analysis");

    const result = buildResearchIntelligenceResult(["AI", "education", "self-efficacy"], "marketing", "PLS-SEM", papers);
    expect(result.domainIntelligence.label).toBe("마케팅");
    expect(result.topics[0].researchDesignGuidance.suggestedAnalysisMethod).toContain("PLS-SEM");
    expect(result.topics[0].methodologyRecommendations.some((item) => item.method === "PLS-SEM")).toBe(true);
  });

  it("builds citation, bibliometric, literature map, debate, review, and roadmap intelligence", () => {
    const result = buildResearchIntelligenceResult(["AI", "education", "self-efficacy"], "education", "bibliometric analysis", papers);
    expect(result.citationIntelligence.network.edges.length).toBeGreaterThan(0);
    expect(result.citationIntelligence.researchClusters.length).toBeGreaterThan(0);
    expect(result.bibliometricAnalysis.keywordCooccurrences.length).toBeGreaterThan(0);
    expect(result.bibliometricAnalysis.authorCollaborations.length).toBeGreaterThan(0);
    expect(result.bibliometricAnalysis.institutionTrends.length).toBeGreaterThan(0);
    expect(result.literatureMap.interdisciplinaryBridges.length).toBeGreaterThan(0);
    expect(result.debateAnalysis.length).toBeGreaterThan(0);
    expect(result.literatureReviewDraft.exportMarkdown).toContain("Retrieved evidence");
    expect(result.researchRoadmap.recommendedNextStepStudies.length).toBeGreaterThan(0);
  });

  it("adapts publication, dataset, roadmap, competition, and export outputs by strategy", () => {
    const result = buildResearchIntelligenceResult(
      ["AI", "education", "self-efficacy"],
      "education",
      "quantitative",
      papers,
      "high-impact/high-risk research"
    );
    expect(result.query.strategy).toBe("high-impact/high-risk research");
    expect(result.topics[0].title).toContain("고임팩트/고위험");
    expect(result.publicationIntelligence.journals.length).toBeGreaterThan(0);
    expect(result.datasetIntelligence.recommendations.some((item) => item.name.includes("PISA"))).toBe(true);
    expect(result.topics[0].datasetIntelligence.recommendations.length).toBeGreaterThan(0);
    expect(result.longTermResearchRoadmap.strategy).toBe("high-impact/high-risk research");
    expect(result.competitionIntelligence.oversaturatedTopics.length).toBeGreaterThan(0);
    expect(result.exportBundle.markdown).toContain("Research Strategy Export");
    expect(result.exportBundle.bibtex).toContain("@misc");
  });

  it("coordinates multi-agent workflow, autonomous exploration, synthesis, forecast, and memory seed", () => {
    const result = buildResearchIntelligenceResult(
      ["AI", "education", "self-efficacy"],
      "education",
      "quantitative",
      papers,
      "interdisciplinary innovation"
    );
    expect(result.multiAgentWorkflow.pipeline.map((agent) => agent.role)).toEqual([
      "literature_retrieval",
      "theory_extraction",
      "citation_intelligence",
      "research_gap_analysis",
      "methodology_recommendation",
      "topic_generation",
      "contradiction_detection",
      "roadmap_planning"
    ]);
    expect(result.autonomousExploration.refinedResearchGoals.length).toBeGreaterThan(0);
    expect(result.deepResearchSynthesis.structuredTheorySynthesis.length).toBeGreaterThan(0);
    expect(result.researchForecast.forecastBoundary).toContain("휴리스틱");
    expect(result.researchMemorySeed.priorGeneratedTopicTitles.length).toBeGreaterThan(0);
  });

  it("generates academic research OS proposal, framework, refinement, writing, and workflow outputs", () => {
    const result = buildResearchIntelligenceResult(
      ["AI", "education", "self-efficacy"],
      "education",
      "quantitative",
      papers,
      "theory-heavy research"
    );
    expect(result.academicResearchOS.proposalDraft.title).toContain("이론 중심형");
    expect(result.academicResearchOS.proposalDraft.abstract.length).toBeGreaterThan(40);
    expect(result.academicResearchOS.conceptualFramework.nodes.length).toBeGreaterThanOrEqual(4);
    expect(result.academicResearchOS.conceptualFramework.edges.length).toBeGreaterThan(0);
    expect(result.academicResearchOS.reasoningWorkflow.methodologyTradeoffs.length).toBeGreaterThan(0);
    expect(result.academicResearchOS.refinementActions.length).toBeGreaterThanOrEqual(6);
    expect(result.academicResearchOS.literatureWorkspace.annotations.length).toBeGreaterThan(0);
    expect(result.academicResearchOS.writingIntelligence.contributionStatements.length).toBeGreaterThan(0);
    expect(result.academicResearchOS.workflowAutomation.thesisDissertationPlan.length).toBeGreaterThan(0);
  });

  it("personalizes evaluation, mentor, institutional, graph, and simulation intelligence", () => {
    const result = buildResearchIntelligenceResult(
      ["AI", "education", "self-efficacy"],
      "education",
      "quantitative",
      papers,
      "fast publishable topics",
      {
        interests: ["AI education", "self-efficacy"],
        preferredMethodologies: ["quantitative", "regression"],
        publicationGoals: ["journal article"],
        targetVenues: ["Computers & Education"],
        theoreticalOrientation: "social cognitive theory",
        noveltyTolerance: "low",
        careerStage: "student"
      }
    );
    expect(result.selfImprovingIntelligence.researcherProfile.careerStage).toBe("student");
    expect(result.selfImprovingIntelligence.personalizedRecommendationSummary).toContain("학생 연구자");
    expect(result.selfImprovingIntelligence.evaluationEngine.evaluatedTopics[0].scores.length).toBe(8);
    expect(result.selfImprovingIntelligence.mentorMode.beginnerGuidanceSteps.length).toBeGreaterThan(0);
    expect(result.selfImprovingIntelligence.institutionalIntelligence.facultyExpertiseMatches.length).toBeGreaterThan(0);
    expect(result.selfImprovingIntelligence.advancedKnowledgeGraph.theoryEvolutionChains.length).toBeGreaterThan(0);
    expect(result.selfImprovingIntelligence.scenarioAnalysis.preferredScenario).toBe("safe publishable path");
    expect(result.selfImprovingIntelligence.continuousIntelligence.updateBoundary).toContain("스냅샷");
  });

  it("runs an agentic self-improving topic refinement loop", () => {
    const result = buildResearchIntelligenceResult(
      ["AI", "education", "self-efficacy"],
      "education",
      "quantitative",
      papers,
      "beginner-safe research",
      {
        preferredMethodologies: ["quantitative", "regression"],
        noveltyTolerance: "medium",
        careerStage: "student"
      }
    );
    const refinement = result.agenticResearchLoop.topicRefinements[0];
    expect(result.agenticResearchLoop.workflow.map((step) => step.stage)).toEqual(["generate", "critique", "improve", "rescore", "compare"]);
    expect(refinement.initialTopic.title).not.toBe(refinement.improvedTopic.title);
    expect(refinement.critiques.length).toBeGreaterThan(0);
    expect(refinement.improvementActions.length).toBeGreaterThanOrEqual(6);
    expect(refinement.refinedScores.theoryCoherence).toBeGreaterThanOrEqual(refinement.initialScores.theoryCoherence);
    expect(refinement.refinedScores.evidenceSupport).toBeGreaterThanOrEqual(refinement.initialScores.evidenceSupport);
    expect(refinement.iterationHistory.length).toBe(5);
    expect(result.agenticResearchLoop.rerankedTopics[0].rank).toBe(1);
    expect(result.agenticResearchLoop.loopBoundary).toContain("원문에 없는 논문");
  });
});
