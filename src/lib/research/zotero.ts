import type {
  EvidenceItem,
  GraphEdge,
  GraphNode,
  ZoteroCollection,
  ZoteroLibraryItem,
  ZoteroPdfInsight,
  ZoteroPersonalResearchIntelligence,
  ZoteroSyncResult
} from "./types";

export type ZoteroEvidenceMatch = {
  itemKey: string;
  title: string;
  year: number | null;
  publicationTitle: string;
  url: string | null;
  citationKey: string | null;
  matchedTerms: string[];
  support: number;
  source: "zotero-indexed-fulltext" | "metadata-only";
  evidenceBoundary: string;
};

const theoryTerms = [
  "self-efficacy",
  "technology acceptance model",
  "social cognitive theory",
  "constructivism",
  "activity theory",
  "expectancy value",
  "cognitive load",
  "diffusion of innovation",
  "uses and gratifications",
  "institutional theory"
];

const methodologyTerms = [
  "SEM",
  "PLS-SEM",
  "regression",
  "experiment",
  "quasi-experimental",
  "survey",
  "interview",
  "thematic analysis",
  "grounded theory",
  "systematic review",
  "meta-analysis",
  "bibliometric",
  "longitudinal",
  "case study"
];

const conceptTerms = [
  "AI",
  "education",
  "learning analytics",
  "motivation",
  "engagement",
  "self-efficacy",
  "achievement",
  "trust",
  "adoption",
  "ethics",
  "feedback",
  "personalization"
];

function normalize(text: string): string {
  return text.toLowerCase();
}

function itemText(item: ZoteroLibraryItem, pdfText = ""): string {
  return normalize([item.title, item.abstractNote, item.tags.join(" "), item.publicationTitle, pdfText].join(" "));
}

function uniqueTerms(terms: string[]): string[] {
  const seen = new Set<string>();
  return terms
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
    .filter((term) => {
      const key = term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function findTerms(text: string, terms: string[]): string[] {
  const lower = normalize(text);
  return terms.filter((term) => lower.includes(term.toLowerCase()));
}

export function buildZoteroEvidenceMatches(items: ZoteroLibraryItem[], pdfInsights: ZoteroPdfInsight[], terms: string[], limit = 6): ZoteroEvidenceMatch[] {
  const evidenceTerms = uniqueTerms(terms);
  return items
    .map((item) => {
      const pdfInsight = pdfInsights.find((insight) => insight.itemKey === item.key);
      const pdfSignalText = pdfInsight
        ? [
            pdfInsight.theoriesFrameworks.join(" "),
            pdfInsight.methodologies.join(" "),
            pdfInsight.variablesConcepts.join(" "),
            pdfInsight.limitations.join(" "),
            pdfInsight.futureWork.join(" "),
            pdfInsight.datasetsSamples.join(" "),
            pdfInsight.contradictionSignals.join(" ")
          ].join(" ")
        : "";
      const text = itemText(item, pdfSignalText);
      const matchedTerms = evidenceTerms.filter((term) => text.includes(term.toLowerCase()));
      const support = matchedTerms.length + (pdfInsight?.source === "zotero-indexed-fulltext" ? 1 : 0);
      return {
        itemKey: item.key,
        title: item.title,
        year: item.year,
        publicationTitle: item.publicationTitle || item.itemType,
        url: item.url,
        citationKey: item.citationKey,
        matchedTerms,
        support,
        source: pdfInsight?.source ?? "metadata-only",
        evidenceBoundary: pdfInsight?.evidenceBoundary ?? "Zotero 메타데이터의 제목, 초록, 태그, 출판원만 사용했습니다."
      };
    })
    .filter((match) => match.matchedTerms.length > 0)
    .sort((a, b) => b.support - a.support || (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function evidenceItems(items: ZoteroLibraryItem[], terms: string[], textForItem: (item: ZoteroLibraryItem) => string): EvidenceItem[] {
  return terms
    .map((term) => {
      const itemKeys = items.filter((item) => textForItem(item).includes(term.toLowerCase())).map((item) => item.key);
      return { label: term, paperIds: itemKeys, support: itemKeys.length };
    })
    .filter((item) => item.support > 0)
    .sort((a, b) => b.support - a.support || a.label.localeCompare(b.label));
}

function topKeywords(items: ZoteroLibraryItem[]): EvidenceItem[] {
  const counts = new Map<string, string[]>();
  for (const item of items) {
    for (const tag of item.tags) {
      const key = tag.trim();
      if (!key) continue;
      counts.set(key, [...(counts.get(key) ?? []), item.key]);
    }
  }
  return [...counts.entries()]
    .map(([label, paperIds]) => ({ label, paperIds, support: paperIds.length }))
    .sort((a, b) => b.support - a.support)
    .slice(0, 12);
}

function buildPersonalGraph(items: ZoteroLibraryItem[], theories: EvidenceItem[], concepts: EvidenceItem[], methodologies: EvidenceItem[]): ZoteroPersonalResearchIntelligence["personalTheoryGraph"] {
  const nodeMap = new Map<string, GraphNode>();
  const addNode = (label: string, type: GraphNode["type"], itemKeys: string[]) => {
    const id = `${type}:${label.toLowerCase()}`;
    nodeMap.set(id, { id, label, type, support: itemKeys.length, paperIds: itemKeys });
    return id;
  };
  for (const item of [...theories, ...concepts, ...methodologies]) {
    addNode(item.label, theories.includes(item) ? "theory" : methodologies.includes(item) ? "methodology" : "concept", item.paperIds);
  }
  const nodes = [...nodeMap.values()];
  const edges: GraphEdge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const shared = nodes[i].paperIds.filter((key) => nodes[j].paperIds.includes(key));
      if (shared.length === 0) continue;
      const sharedItems = items.filter((item) => shared.includes(item.key));
      edges.push({
        id: `${nodes[i].id}->${nodes[j].id}`,
        source: nodes[i].id,
        target: nodes[j].id,
        type: nodes[i].type === "methodology" || nodes[j].type === "methodology" ? "methodology_link" : nodes[i].type === "theory" && nodes[j].type === "theory" ? "theory_cooccurrence" : "concept_bridge",
        weight: shared.length,
        density: shared.length / Math.max(1, Math.min(nodes[i].support, nodes[j].support)),
        paperIds: shared,
        averageCitations: 0,
        years: [...new Set(sharedItems.map((item) => item.year).filter((year): year is number => typeof year === "number"))]
      });
    }
  }
  return { nodes: nodes.slice(0, 40), edges: edges.slice(0, 80) };
}

export function analyzeZoteroPdfText(item: ZoteroLibraryItem, indexedText: string | null): ZoteroPdfInsight {
  const text = indexedText ? itemText(item, indexedText.slice(0, 12000)) : itemText(item);
  const limitationSignals = ["limitation", "limitations", "future research", "further research", "small sample", "cross-sectional", "generalizability"].filter((term) => text.includes(term));
  return {
    itemKey: item.key,
    title: item.title,
    theoriesFrameworks: findTerms(text, theoryTerms),
    methodologies: findTerms(text, methodologyTerms),
    variablesConcepts: findTerms(text, conceptTerms),
    limitations: limitationSignals.filter((term) => term.includes("limitation") || term.includes("small sample") || term.includes("cross-sectional") || term.includes("generalizability")),
    futureWork: limitationSignals.filter((term) => term.includes("future") || term.includes("further")),
    datasetsSamples: ["sample", "dataset", "participants", "students", "survey", "interview"].filter((term) => text.includes(term)),
    contradictionSignals: ["mixed findings", "inconsistent", "contradict", "contradiction", "conflicting"].filter((term) => text.includes(term)),
    source: indexedText ? "zotero-indexed-fulltext" : "metadata-only",
    evidenceBoundary: indexedText
      ? "Zotero indexed full text의 제한된 텍스트 신호를 분석했습니다. PDF 원문 전체나 파일 경로는 반환하지 않습니다."
      : "PDF 전문을 읽지 못해 Zotero 메타데이터만 분석했습니다."
  };
}

export function buildZoteroPersonalIntelligence(items: ZoteroLibraryItem[], collections: ZoteroCollection[], pdfInsights: ZoteroPdfInsight[]): ZoteroPersonalResearchIntelligence {
  const textFor = (item: ZoteroLibraryItem) => itemText(item, pdfInsights.find((insight) => insight.itemKey === item.key)?.variablesConcepts.join(" ") ?? "");
  const inferredResearchInterests = topKeywords(items);
  const dominantTheories = evidenceItems(items, theoryTerms, textFor);
  const dominantMethodologies = evidenceItems(items, methodologyTerms, textFor);
  const concepts = evidenceItems(items, conceptTerms, textFor);
  const personalTheoryGraph = buildPersonalGraph(items, dominantTheories, concepts, dominantMethodologies);
  const adjacentUnexploredAreas = concepts
    .filter((concept) => concept.support <= 2)
    .map((concept) => `${concept.label}: 개인 라이브러리에서 약하게 나타나는 인접 탐색 후보`)
    .slice(0, 8);
  const personalizedResearchGaps = [
    ...dominantTheories.slice(0, 3).flatMap((theory) =>
      concepts.slice(0, 3).map((concept) => `${theory.label}와 ${concept.label} 연결은 개인 라이브러리 내 근거 ${theory.paperIds.filter((key) => concept.paperIds.includes(key)).length}편입니다. 원문 검토로 gap 후보 여부를 확인하세요.`)
    ),
    ...dominantMethodologies.length === 0 ? ["개인 라이브러리에서 명시적 방법론 신호가 부족합니다. 방법론별 분류 태그 또는 초록 보강이 필요합니다."] : []
  ].slice(0, 8);
  const recommendedTopics = personalizedResearchGaps.slice(0, 5).map((gap) => `개인 라이브러리 기반 연구주제 후보: ${gap}`);
  return {
    inferredResearchInterests,
    dominantTheories,
    dominantMethodologies,
    adjacentUnexploredAreas,
    personalizedResearchGaps,
    recommendedTopics,
    readingQueueRecommendations: items
      .slice()
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, 8)
      .map((item) => ({
        itemKey: item.key,
        title: item.title,
        reason: item.hasPdfAttachment ? "PDF 첨부가 있어 심층 읽기 후보입니다." : "최근/관련 메타데이터 기반 읽기 후보입니다."
      })),
    personalTheoryGraph,
    methodologyDistribution: dominantMethodologies.map((item) => ({ methodology: item.label, count: item.support })),
    topicClusters: collections.slice(0, 8).map((collection) => ({
      label: collection.name,
      itemKeys: items.filter((item) => item.collectionKeys.includes(collection.key)).map((item) => item.key),
      evidence: "Zotero collection membership 기반 클러스터입니다."
    })),
    literatureReviewDraft: {
      retrievedEvidence: items.slice(0, 8).map((item) => `${item.title}${item.year ? ` (${item.year})` : ""} · ${item.publicationTitle || item.itemType}`),
      generatedSynthesis: `개인 Zotero 라이브러리는 ${inferredResearchInterests.slice(0, 5).map((item) => item.label).join(", ") || "명시 태그 부족"} 주변으로 구성되어 있습니다. 이 문장은 메타데이터 기반 생성 요약입니다.`,
      gapSummary: personalizedResearchGaps,
      futureDirections: recommendedTopics
    },
    workflowIntegration: {
      exportableCollectionSuggestions: ["RIS Generated Topics", "RIS Reading Queue", "RIS Evidence Review"],
      citationExportFormats: ["BibTeX", "RIS", "CSL JSON"],
      savedAgendaSuggestions: recommendedTopics.slice(0, 4),
      persistenceBoundary: "현재 MVP는 Zotero에 쓰지 않고 읽기/분석 결과만 표시합니다. 컬렉션 생성이나 항목 저장은 명시 확인 후 별도 구현해야 합니다."
    },
    privacyBoundary: "분석은 로컬 Zotero API에서 받은 메타데이터와 허용된 indexed full text 신호만 사용합니다. PDF 파일 경로, 원문 전체, 개인 라이브러리 내용은 Git이나 로그에 저장하지 않습니다."
  };
}

export function emptyZoteroPersonalIntelligence(): ZoteroPersonalResearchIntelligence {
  return buildZoteroPersonalIntelligence([], [], []);
}

export function buildUnavailableZoteroResult(message: string): ZoteroSyncResult {
  return {
    status: {
      state: "unavailable",
      localApiUrl: "http://127.0.0.1:23119",
      localApiEnabled: null,
      message,
      checkedAt: new Date().toISOString(),
      privacyBoundary: "Zotero가 연결되지 않아 개인 라이브러리 데이터는 읽지 않았습니다."
    },
    collections: [],
    items: [],
    pdfInsights: [],
    personalIntelligence: emptyZoteroPersonalIntelligence(),
    diagnostics: {
      itemsImported: 0,
      collectionsImported: 0,
      pdfsDetected: 0,
      pdfsAnalyzed: 0,
      fullTextMode: "metadata-only",
      warnings: [message, "Mock 또는 fallback 논문 데이터는 생성하지 않았습니다."]
    }
  };
}
