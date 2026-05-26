import type { RetrievedPaper } from "./types";

type OpenAlexAuthor = {
  author?: { display_name?: string };
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
  abstract_inverted_index?: Record<string, number[]>;
  primary_location?: {
    landing_page_url?: string;
    source?: { display_name?: string };
  };
};

type OpenAlexResponse = {
  results?: OpenAlexWork[];
};

const OPENALEX_WORKS_URL = "https://api.openalex.org/works";

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
      .slice(0, 6)
  };
}

export async function fetchOpenAlexWorks(keywords: string[], perPage = 25): Promise<RetrievedPaper[]> {
  const search = keywords.join(" ");
  const params = new URLSearchParams({
    search,
    per_page: String(perPage),
    sort: "relevance_score:desc"
  });

  const response = await fetch(`${OPENALEX_WORKS_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Research Intelligence MVP (mailto:example@example.com)"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error(`OpenAlex returned ${response.status}`);
  }

  const payload = (await response.json()) as OpenAlexResponse;
  return (payload.results ?? []).map(normalizeWork).filter((work): work is RetrievedPaper => Boolean(work));
}
