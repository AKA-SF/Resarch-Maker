import { NextResponse } from "next/server";
import {
  analyzeZoteroPdfText,
  buildUnavailableZoteroResult,
  buildZoteroPersonalIntelligence
} from "@/lib/research/zotero";
import type {
  ZoteroCollection,
  ZoteroLibraryItem,
  ZoteroPdfInsight,
  ZoteroSyncResult
} from "@/lib/research/types";

const ZOTERO_LOCAL_API = "http://127.0.0.1:23119";

type ZoteroCreator = {
  firstName?: string;
  lastName?: string;
  name?: string;
};

type ZoteroTag = {
  tag?: string;
};

type ZoteroApiItem = {
  key: string;
  data?: {
    key?: string;
    title?: string;
    date?: string;
    year?: number;
    itemType?: string;
    creators?: ZoteroCreator[];
    publicationTitle?: string;
    bookTitle?: string;
    proceedingsTitle?: string;
    DOI?: string;
    doi?: string;
    url?: string;
    abstractNote?: string;
    tags?: ZoteroTag[];
    collections?: string[];
    citationKey?: string;
    contentType?: string;
  };
  meta?: {
    creatorSummary?: string;
    parsedDate?: string;
  };
};

type ZoteroFullText = {
  content?: string;
  indexedChars?: number;
  totalChars?: number;
};

async function zoteroFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${ZOTERO_LOCAL_API}${path}`, {
    headers: {
      "Zotero-API-Version": "3"
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Zotero Local API ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function parseYear(item: ZoteroApiItem): number | null {
  const raw = item.data?.year ?? item.meta?.parsedDate ?? item.data?.date ?? "";
  const match = String(raw).match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function creatorName(creator: ZoteroCreator): string {
  if (creator.name) return creator.name;
  return [creator.firstName, creator.lastName].filter(Boolean).join(" ").trim();
}

function toLibraryItem(item: ZoteroApiItem, children: ZoteroApiItem[]): ZoteroLibraryItem {
  const data = item.data ?? {};
  const pdfAttachments = children.filter((child) => {
    const childData = child.data ?? {};
    return childData.itemType === "attachment" && /pdf/i.test([childData.contentType, childData.title].filter(Boolean).join(" "));
  });
  return {
    key: item.key,
    title: data.title ?? "(제목 없음)",
    year: parseYear(item),
    itemType: data.itemType ?? "unknown",
    creators: (data.creators ?? []).map(creatorName).filter(Boolean),
    publicationTitle: data.publicationTitle ?? data.proceedingsTitle ?? data.bookTitle ?? "",
    doi: data.DOI ?? data.doi ?? null,
    url: data.url ?? null,
    abstractNote: data.abstractNote ?? "",
    tags: (data.tags ?? []).map((tag) => tag.tag).filter((tag): tag is string => Boolean(tag)),
    collectionKeys: data.collections ?? [],
    citationKey: data.citationKey ?? null,
    hasPdfAttachment: pdfAttachments.length > 0,
    pdfAttachmentKeys: pdfAttachments.map((attachment) => attachment.key)
  };
}

function toCollection(item: ZoteroApiItem): ZoteroCollection {
  return {
    key: item.key,
    name: item.data?.title ?? item.data?.key ?? item.key,
    parentKey: null,
    itemCount: null
  };
}

async function childrenFor(itemKey: string): Promise<ZoteroApiItem[]> {
  try {
    return await zoteroFetch<ZoteroApiItem[]>(`/api/users/0/items/${encodeURIComponent(itemKey)}/children?limit=50&format=json`);
  } catch {
    return [];
  }
}

async function fullTextFor(attachmentKey: string): Promise<string | null> {
  try {
    const fulltext = await zoteroFetch<ZoteroFullText>(`/api/users/0/items/${encodeURIComponent(attachmentKey)}/fulltext`);
    return fulltext.content?.slice(0, 12000) ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [rawItems, rawCollections] = await Promise.all([
      zoteroFetch<ZoteroApiItem[]>("/api/users/0/items/top?limit=50&format=json"),
      zoteroFetch<ZoteroApiItem[]>("/api/users/0/collections?limit=100&format=json")
    ]);
    const topItems = rawItems.filter((item) => item.data?.itemType !== "attachment").slice(0, 40);
    const childEntries = await Promise.all(topItems.slice(0, 20).map(async (item) => [item.key, await childrenFor(item.key)] as const));
    const childrenByItem = new Map(childEntries);
    const items = topItems.map((item) => toLibraryItem(item, childrenByItem.get(item.key) ?? []));
    const collections = rawCollections.map(toCollection);
    const pdfItems = items.filter((item) => item.hasPdfAttachment).slice(0, 8);
    const pdfInsights: ZoteroPdfInsight[] = await Promise.all(pdfItems.map(async (item) => {
      const indexedText = item.pdfAttachmentKeys[0] ? await fullTextFor(item.pdfAttachmentKeys[0]) : null;
      return analyzeZoteroPdfText(item, indexedText);
    }));
    const personalIntelligence = buildZoteroPersonalIntelligence(items, collections, pdfInsights);
    const result: ZoteroSyncResult = {
      status: {
        state: "connected",
        localApiUrl: ZOTERO_LOCAL_API,
        localApiEnabled: true,
        message: "Zotero Local API에서 개인 라이브러리 메타데이터를 읽었습니다.",
        checkedAt: new Date().toISOString(),
        privacyBoundary: "응답은 현재 브라우저 세션에만 표시됩니다. API 키, 토큰, PDF 파일 경로, 원문 전체를 반환하지 않습니다."
      },
      collections,
      items,
      pdfInsights,
      personalIntelligence,
      diagnostics: {
        itemsImported: items.length,
        collectionsImported: collections.length,
        pdfsDetected: items.filter((item) => item.hasPdfAttachment).length,
        pdfsAnalyzed: pdfInsights.filter((insight) => insight.source === "zotero-indexed-fulltext").length,
        fullTextMode: pdfInsights.some((insight) => insight.source === "zotero-indexed-fulltext") ? "indexed-snippets-only" : "metadata-only",
        warnings: [
          "Zotero 쓰기 작업은 수행하지 않았습니다.",
          "PDF 파일 경로나 원문 전체는 반환하지 않습니다.",
          "분석은 Zotero 메타데이터와 허용된 indexed full text 신호에 한정됩니다."
        ]
      }
    };
    return NextResponse.json(result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Zotero connection failed";
    return NextResponse.json(buildUnavailableZoteroResult(`Zotero Local API에 연결할 수 없습니다: ${detail}`));
  }
}
