import { NextResponse } from "next/server";
import { buildResearchIntelligenceResult } from "@/lib/research/analysis";
import { fetchOpenAlexWorks } from "@/lib/research/openalex";
import { disciplines, methodologies, type Discipline, type Methodology } from "@/lib/research/types";

type RequestBody = {
  keywords?: unknown;
  discipline?: unknown;
  methodology?: unknown;
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

  try {
    const papers = await fetchOpenAlexWorks(keywords);
    return NextResponse.json(buildResearchIntelligenceResult(keywords, body.discipline, body.methodology, papers));
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
