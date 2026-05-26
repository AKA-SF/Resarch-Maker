import { describe, expect, it } from "vitest";
import { buildResearchIntelligenceResult, detectGaps, synthesizeLiterature } from "./analysis";
import { disciplines, methodologies, type RetrievedPaper } from "./types";

const papers: RetrievedPaper[] = [
  {
    id: "p1",
    title: "AI education and self-efficacy in adaptive learning",
    year: 2025,
    doi: null,
    source: "OpenAlex",
    url: "https://example.test/p1",
    citedByCount: 12,
    concepts: ["Artificial intelligence", "Education", "Self-efficacy", "Learning analytics"],
    abstract: "This quantitative survey examines self-efficacy and adaptive AI education. Future research should test longitudinal designs.",
    authors: ["A. Researcher"]
  },
  {
    id: "p2",
    title: "Technology acceptance model for AI tutors",
    year: 2024,
    doi: null,
    source: "OpenAlex",
    url: "https://example.test/p2",
    citedByCount: 8,
    concepts: ["Technology acceptance model", "Human-computer interaction"],
    abstract: "The technology acceptance model is used to study AI tutors and learning outcomes with regression analysis.",
    authors: ["B. Scholar"]
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
});
