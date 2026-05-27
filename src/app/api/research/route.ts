import { NextResponse } from "next/server";
import { buildResearchIntelligenceResult } from "@/lib/research/analysis";
import { fetchOpenAlexWorks } from "@/lib/research/openalex";
import {
  careerStages,
  disciplines,
  methodologies,
  researchStrategies,
  type CareerStage,
  type Discipline,
  type Methodology,
  type ResearcherProfile,
  type ResearchStrategy
} from "@/lib/research/types";

type RequestBody = {
  keywords?: unknown;
  discipline?: unknown;
  methodology?: unknown;
  strategy?: unknown;
  researcherProfile?: unknown;
};

function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((keyword) => keyword.trim()).filter(Boolean).slice(0, 8);
  }
  if (typeof value === "string") {
    return value.split(",").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 8);
  }
  return [];
}

function isDiscipline(value: unknown): value is Discipline {
  return typeof value === "string" && disciplines.includes(value as Discipline);
}

function isMethodology(value: unknown): value is Methodology {
  return typeof value === "string" && methodologies.includes(value as Methodology);
}

function isResearchStrategy(value: unknown): value is ResearchStrategy {
  return typeof value === "string" && researchStrategies.includes(value as ResearchStrategy);
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 12);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  return [];
}

function parseResearcherProfile(value: unknown): Partial<ResearcherProfile> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const profile = value as Record<string, unknown>;
  const preferredMethodologies = parseStringList(profile.preferredMethodologies).filter((item): item is Methodology =>
    methodologies.includes(item as Methodology)
  );
  const noveltyTolerance =
    profile.noveltyTolerance === "low" || profile.noveltyTolerance === "medium" || profile.noveltyTolerance === "high"
      ? profile.noveltyTolerance
      : undefined;
  const careerStage = careerStages.includes(profile.careerStage as CareerStage) ? profile.careerStage as CareerStage : undefined;
  return {
    interests: parseStringList(profile.interests),
    preferredMethodologies,
    publicationGoals: parseStringList(profile.publicationGoals),
    targetVenues: parseStringList(profile.targetVenues),
    theoreticalOrientation: typeof profile.theoreticalOrientation === "string" ? profile.theoreticalOrientation.slice(0, 160) : undefined,
    noveltyTolerance,
    careerStage
  };
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "요청 본문은 올바른 JSON이어야 합니다." }, { status: 400 });
  }

  const keywords = parseKeywords(body.keywords);
  if (keywords.length === 0) {
    return NextResponse.json({ error: "키워드를 하나 이상 입력해 주세요." }, { status: 400 });
  }

  if (!isDiscipline(body.discipline)) {
    return NextResponse.json({ error: "지원되는 학문 분야를 선택해 주세요." }, { status: 400 });
  }

  if (!isMethodology(body.methodology)) {
    return NextResponse.json({ error: "지원되는 연구방법을 선택해 주세요." }, { status: 400 });
  }

  const strategy = isResearchStrategy(body.strategy) ? body.strategy : "beginner-safe research";
  const researcherProfile = parseResearcherProfile(body.researcherProfile);

  try {
    const papers = await fetchOpenAlexWorks(keywords);
    return NextResponse.json(buildResearchIntelligenceResult(keywords, body.discipline, body.methodology, papers, strategy, researcherProfile));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown retrieval error";
    return NextResponse.json(
      {
        error: "학술 문헌 검색에 실패했습니다.",
        detail: message,
        source: "OpenAlex"
      },
      { status: 502 }
    );
  }
}
