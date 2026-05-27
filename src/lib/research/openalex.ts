import type { RetrievedPaper } from "./types";

type OpenAlexAuthor = {
  author?: { display_name?: string };
  institutions?: Array<{ display_name?: string; country_code?: string }>;
  countries?: string[];
};

type OpenAlexConcept = {
  display_name?: string;
};

type OpenAlexWork = {
  id?: string;
  display_name?: string;
  publication_year?: number;
  doi?: string;
  cited_by_count?: number;
  concepts?: OpenAlexConcept[];
  authorships?: OpenAlexAuthor[];
  referenced_works?: string[];
  related_works?: string[];
  abstract_inverted_index?: Record<string, number[]>;
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  };
};

type OpenAlexResponse = {
  meta?: {
    count?: number;
    db_response_time_ms?: number;
  };
  results?: OpenAlexWork[];
};

const OPENALEX_WORKS_URL = "https://api.openalex.org/works";

export type OpenAlexRetrievalDiagnostics = {
  liveConnection: boolean;
  retrievalMode: "live_openalex_api";
  apiUrl: string;
  apiStatus: number;
  apiResponseCount: number;
  apiDbResponseTimeMs: number | null;
  retrievedAt: string;
  query: string;
};

export type OpenAlexRetrievalResult = {
  papers: RetrievedPaper[];
  diagnostics: OpenAlexRetrievalDiagnostics;
};

function restoreAbstract(index?: Record<string, number[]>): string {
  if (!index) return "";
  const words: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) {
      words.push([position, word]);
    }
  }
  return words
    .sort(([a], [b]) => a - b)
    .map(([, word]) => word)
    .join(" ");
}

function normalizeWork(work: OpenAlexWork): RetrievedPaper | null {
  if (!work.id || !work.display_name) return null;
  if (work.display_name.trim().toLowerCase().startsWith("retracted:")) return null;
  const concepts = (work.concepts ?? [])
    .map((concept) => concept.display_name)
    .filter((concept): concept is string => Boolean(concept))
    .slice(0, 12);

  return {
    id: work.id,
    title: work.display_name,
    year: work.publication_year ?? null,
    doi: work.doi ?? null,
    source: work.primary_location?.source?.display_name ?? "OpenAlex",
    url: work.primary_location?.landing_page_url ?? work.id,
    citedByCount: work.cited_by_count ?? 0,
    concepts,
    abstract: restoreAbstract(work.abstract_inverted_index),
    authors: (work.authorships ?? [])
      .map((authorship) => authorship.author?.display_name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 6),
    institutions: [
      ...new Set(
        (work.authorships ?? [])
          .flatMap((authorship) => authorship.institutions ?? [])
          .map((institution) => institution.display_name)
          .filter((name): name is string => Boolean(name))
      )
    ].slice(0, 8),
    countries: [
      ...new Set(
        (work.authorships ?? []).flatMap((authorship) => [
          ...(authorship.countries ?? []),
          ...((authorship.institutions ?? []).map((institution) => institution.country_code).filter(Boolean) as string[])
        ])
      )
    ].slice(0, 8),
    referencedWorks: (work.referenced_works ?? []).slice(0, 120),
    relatedWorks: (work.related_works ?? []).slice(0, 20)
  };
}

export async function retrieveOpenAlexWorks(keywords: string[], perPage = 50): Promise<OpenAlexRetrievalResult> {
  const search = keywords.join(" ");
  const params = new URLSearchParams({
    search,
    per_page: String(perPage),
    sort: "relevance_score:desc"
  });
  const apiUrl = `${OPENALEX_WORKS_URL}?${params.toString()}`;

  const response = await fetch(apiUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Research Intelligence MVP (mailto:example@example.com)"
    }
  });

  if (!response.ok) {
    throw new Error(`OpenAlex returned ${response.status}`);
  }

  const payload = (await response.json()) as OpenAlexResponse;
  return {
    papers: (payload.results ?? []).map(normalizeWork).filter((work): work is RetrievedPaper => Boolean(work)),
    diagnostics: {
      liveConnection: true,
      retrievalMode: "live_openalex_api",
      apiUrl,
      apiStatus: response.status,
      apiResponseCount: payload.meta?.count ?? payload.results?.length ?? 0,
      apiDbResponseTimeMs: payload.meta?.db_response_time_ms ?? null,
      retrievedAt: new Date().toISOString(),
      query: search
    }
  };
}

export async function fetchOpenAlexWorks(keywords: string[], perPage = 50): Promise<RetrievedPaper[]> {
  const result = await retrieveOpenAlexWorks(keywords, perPage);
  return result.papers;
}
