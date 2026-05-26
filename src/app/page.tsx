"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GitFork,
  Layers3,
  Loader2,
  MapIcon,
  MessageSquare,
  Network,
  Rocket,
  Save,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  Users,
  Wand2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  disciplines,
  methodologies,
  researchStrategies,
  type CopilotMessage,
  type Discipline,
  type GraphNode,
  type Methodology,
  type ResearchStrategy,
  type ResearchIntelligenceResult,
  type Topic
} from "@/lib/research/types";
import { disciplineLabels, methodologyLabels } from "@/lib/research/domain";
import { strategyLabels } from "@/lib/research/strategy";

const initialKeywords = "AI, education, self-efficacy";

type SavedWorkspace = {
  id: string;
  title: string;
  keywords: string;
  strategy: ResearchStrategy;
  createdAt: string;
  topicCount: number;
  bookmarkedTopicTitles: string[];
};

const scoreLabels: Record<string, string> = {
  novelty: "참신성",
  feasibility: "실행가능성",
  publishability: "출판가능성",
  dataAvailability: "자료 확보성",
  saturation: "포화도"
};

const gapTypeLabels: Record<string, string> = {
  underexplored_intersection: "덜 탐색된 주제 교차점",
  sparse_theory_combination: "희소한 이론 조합",
  weak_methodology_coverage: "취약한 방법론 적용",
  emerging_immature_domain: "초기 단계의 부상 영역"
};

const confidenceLabels: Record<string, string> = {
  low: "낮음",
  medium: "중간",
  high: "높음"
};

const relationshipLabels: Record<string, string> = {
  co_occurring_theories: "이론 동시출현",
  adjacent_frameworks: "인접 프레임워크",
  weak_connection: "약한 연결",
  emerging_combination: "부상 조합",
  weak_citation_cluster: "낮은 인용 신호",
  methodology_gap: "방법론 갭"
};

const comparisonLabels: Record<string, string> = {
  safer: "안전한 방향",
  balanced: "균형형",
  high_novelty: "고참신성"
};

const nodeColors: Record<GraphNode["type"], string> = {
  theory: "#176b5f",
  concept: "#3b68a8",
  variable: "#c44f2f",
  methodology: "#946200"
};

function scoreColor(value: number): string {
  if (value >= 8) return "score high";
  if (value >= 6) return "score medium";
  return "score low";
}

function EvidenceList({ title, items }: { title: string; items: { label: string; support: number }[] }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">검색된 메타데이터에서 명시적인 신호를 찾지 못했습니다.</p>
      ) : (
        <ul className="evidence-list">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <span>{item.label}</span>
              <strong>{item.support}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function uniqueEvidence<T extends { label: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function TheoryGraphPanel({ result }: { result: ResearchIntelligenceResult }) {
  const width = 720;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const nodes = result.theoryGraph.nodes.slice(0, 16);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = result.theoryGraph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)).slice(0, 28);
  const positions = new Map(
    nodes.map((node, index) => {
      const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = node.type === "theory" ? 112 : 145;
      return [
        node.id,
        {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        }
      ];
    })
  );

  return (
    <section className="panel graph-panel">
      <div className="panel-head">
        <div>
          <p className="tag">Theory Graph</p>
          <h2>이론 그래프 시각화</h2>
        </div>
        <div className="graph-legend">
          <span><i className="theory-dot" /> 이론</span>
          <span><i className="concept-dot" /> 개념</span>
          <span><i className="variable-dot" /> 변수</span>
          <span><i className="method-dot" /> 방법론</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="검색 문헌 기반 이론 그래프">
        {edges.map((edge) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="#aab8b2"
              strokeWidth={Math.max(1, Math.min(6, edge.weight))}
              opacity={0.42}
            />
          );
        })}
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          return (
            <g key={node.id}>
              <circle cx={position.x} cy={position.y} r={Math.max(13, Math.min(25, 10 + node.support))} fill={nodeColors[node.type]} opacity={0.92} />
              <text x={position.x} y={position.y + 38} textAnchor="middle">
                {node.label.length > 22 ? `${node.label.slice(0, 21)}...` : node.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="muted">노드와 엣지는 검색된 논문의 제목, 초록, OpenAlex 개념 필드에서 함께 나타난 신호입니다. 이는 추론용 관계망이며 인과 관계나 확정적 인용 네트워크가 아닙니다.</p>
    </section>
  );
}

function CitationNetworkPanel({ result }: { result: ResearchIntelligenceResult }) {
  const width = 720;
  const height = 340;
  const nodes = result.citationIntelligence.network.nodes.slice(0, 14);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = result.citationIntelligence.network.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)).slice(0, 24);
  const positions = new Map(
    nodes.map((node, index) => {
      const angle = (index / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = 120;
      return [
        node.id,
        {
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius
        }
      ];
    })
  );

  return (
    <section className="panel graph-panel">
      <div className="panel-head">
        <div>
          <p className="tag">Citation Intelligence</p>
          <h2>인용 네트워크 시각화</h2>
        </div>
        <Network size={22} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="OpenAlex 인용 및 공통참고문헌 네트워크">
        {edges.map((edge) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edge.type === "direct_citation" ? "#c44f2f" : edge.type === "related_work" ? "#3b68a8" : "#176b5f"}
              strokeWidth={Math.max(1, Math.min(7, edge.weight / 2))}
              opacity={0.48}
            />
          );
        })}
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          return (
            <g key={node.id}>
              <circle cx={position.x} cy={position.y} r={Math.max(13, Math.min(28, 12 + node.citedByCount / 40))} fill="#2f4b6e" opacity={0.94} />
              <text x={position.x} y={position.y + 36} textAnchor="middle">
                {topicShortTitle(node.title).slice(0, 30)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="muted">직접 인용은 OpenAlex `referenced_works`, 연결 신호는 `related_works`와 공통 참고문헌 기반입니다. 원문 참고문헌 전체를 재구성한 완전한 인용망은 아닙니다.</p>
    </section>
  );
}

function topicShortTitle(title: string): string {
  return title.length > 72 ? `${title.slice(0, 71)}...` : title;
}

function buildImproveMessage(topic: Topic, mode: "improve" | "safe" | "novel" | "methods"): CopilotMessage {
  if (mode === "safe") {
    return {
      title: "안전한 연구 방향",
      message: `${topic.coreTheory}를 중심 이론으로 유지하고, ${topic.methodologyRecommendations[0]?.method ?? "regression"} 기반 검증 설계를 우선 고려하세요. 문헌 지지가 있는 변수부터 모델을 단순화하면 심사 리스크가 낮아집니다.`,
      evidence: `근거 논문 ${topic.evidencePaperIds.length}편, 실행가능성 ${topic.scores.feasibility}/10, 자료 확보성 ${topic.scores.dataAvailability}/10`
    };
  }
  if (mode === "novel") {
    return {
      title: "고참신성 연구 방향",
      message: `${topic.adjacentTheories[0] ?? topic.variables[1]}와 ${topic.mediatorsModerators[0] ?? topic.coreTheory}의 약한 연결을 전면에 두고, 새로운 매개/조절 구조를 제안하는 방향이 더 도전적입니다.`,
      evidence: `참신성 ${topic.scores.novelty}/10, 포화도 ${topic.scores.saturation}/10. 낮은 포화도는 기회이자 검증 부담입니다.`
    };
  }
  if (mode === "methods") {
    return {
      title: "대안 방법론",
      message: topic.methodologyRecommendations.map((item) => `${item.method}: 적합도 ${item.fit}/10`).join(" · "),
      evidence: topic.methodologyRecommendations[0]?.evidence ?? "방법론 추천 근거가 부족합니다."
    };
  }
  return {
    title: "토픽 개선 제안",
    message: `현재 토픽은 ${topic.coreTheory}를 핵심 이론으로 삼고 ${topic.mediatorsModerators.join(", ") || "매개/조절 후보"}를 정교화하면 더 연구 가능한 모델이 됩니다. 연구문제는 결과변수와 맥락을 더 좁히는 쪽이 좋습니다.`,
    evidence: `${topic.inferenceNotice} ${topic.academicContribution}`
  };
}

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [discipline, setDiscipline] = useState<Discipline>("education");
  const [methodology, setMethodology] = useState<Methodology>("quantitative");
  const [strategy, setStrategy] = useState<ResearchStrategy>("beginner-safe research");
  const [result, setResult] = useState<ResearchIntelligenceResult | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paperMap = useMemo(() => new Map(result?.papers.map((paper) => [paper.id, paper]) ?? []), [result]);
  const maxTrend = Math.max(1, ...(result?.synthesis.trends.map((trend) => trend.support) ?? [1]));
  const relatedAndEmerging = uniqueEvidence([...(result?.synthesis.relatedTheories ?? []), ...(result?.synthesis.emergingTopics ?? [])]).slice(0, 8);

  useEffect(() => {
    const saved = window.localStorage.getItem("ris-workspaces");
    const bookmarks = window.localStorage.getItem("ris-bookmarks");
    if (saved) setSavedWorkspaces(JSON.parse(saved) as SavedWorkspace[]);
    if (bookmarks) setBookmarkedTopics(JSON.parse(bookmarks) as string[]);
  }, []);

  async function runAnalysis(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = event?.currentTarget ?? formRef.current;
    const formData = form ? new FormData(form) : null;
    const submittedKeywords = String(formData?.get("keywords") ?? keywords);
    const submittedDiscipline = String(formData?.get("discipline") ?? discipline) as Discipline;
    const submittedMethodology = String(formData?.get("methodology") ?? methodology) as Methodology;
    const submittedStrategy = String(formData?.get("strategy") ?? strategy) as ResearchStrategy;
    setKeywords(submittedKeywords);
    setDiscipline(submittedDiscipline);
    setMethodology(submittedMethodology);
    setStrategy(submittedStrategy);
    setLoading(true);
    setError(null);
    setResult(null);
    setCopilotMessages([]);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: submittedKeywords,
          discipline: submittedDiscipline,
          methodology: submittedMethodology,
          strategy: submittedStrategy
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail ? `${payload.error} ${payload.detail}` : payload?.error ?? "분석에 실패했습니다.");
      }
      const typedPayload = payload as ResearchIntelligenceResult;
      setResult(typedPayload);
      setCopilotMessages(typedPayload.copilot.starterMessages);
      setSavedWorkspaces((current) => {
        const next = [
          {
            id: typedPayload.diagnostics.generatedAt,
            title: `${submittedKeywords} · ${strategyLabels[submittedStrategy]}`,
            keywords: submittedKeywords,
            strategy: submittedStrategy,
            createdAt: typedPayload.diagnostics.generatedAt,
            topicCount: typedPayload.topics.length,
            bookmarkedTopicTitles: []
          },
          ...current
        ].slice(0, 8);
        window.localStorage.setItem("ris-workspaces", JSON.stringify(next));
        return next;
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function addCopilotMessage(topic: Topic, mode: "improve" | "safe" | "novel" | "methods") {
    setCopilotMessages((current) => [buildImproveMessage(topic, mode), ...current].slice(0, 8));
  }

  function saveCurrentWorkspace() {
    if (!result) return;
    const saved: SavedWorkspace = {
      id: `${result.diagnostics.generatedAt}-manual`,
      title: `${keywords} · ${strategyLabels[result.query.strategy]}`,
      keywords,
      strategy: result.query.strategy,
      createdAt: new Date().toISOString(),
      topicCount: result.topics.length,
      bookmarkedTopicTitles: bookmarkedTopics
    };
    setSavedWorkspaces((current) => {
      const next = [saved, ...current].slice(0, 8);
      window.localStorage.setItem("ris-workspaces", JSON.stringify(next));
      return next;
    });
  }

  function toggleBookmark(topicTitle: string) {
    setBookmarkedTopics((current) => {
      const next = current.includes(topicTitle) ? current.filter((title) => title !== topicTitle) : [topicTitle, ...current].slice(0, 20);
      window.localStorage.setItem("ris-bookmarks", JSON.stringify(next));
      return next;
    });
  }

  function downloadText(filename: string, text: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <section className="topbar">
        <div>
          <p className="eyebrow">OpenAlex 기반 MVP</p>
          <h1>연구 인텔리전스 시스템</h1>
        </div>
        <div className="status-pill">
          <CheckCircle2 size={18} />
          검색 근거와 생성 추론을 분리 표시
        </div>
      </section>

      <section className="workspace">
        <form className="control-panel" ref={formRef} onSubmit={runAnalysis}>
          <label>
            <span>키워드</span>
            <textarea name="keywords" value={keywords} onChange={(event) => setKeywords(event.target.value)} rows={3} placeholder="AI, education, self-efficacy" />
          </label>

          <label>
            <span>학문 분야</span>
            <select name="discipline" value={discipline} onChange={(event) => setDiscipline(event.target.value as Discipline)}>
              {disciplines.map((option) => (
                <option value={option} key={option}>
                  {disciplineLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>연구방법</span>
            <select name="methodology" value={methodology} onChange={(event) => setMethodology(event.target.value as Methodology)}>
              {methodologies.map((option) => (
                <option value={option} key={option} title={`${methodologyLabels[option]}: 연구문제, 문헌 밀도, 분야 규범에 따라 추천 적합도가 달라집니다.`}>
                  {methodologyLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>연구 전략</span>
            <select name="strategy" value={strategy} onChange={(event) => setStrategy(event.target.value as ResearchStrategy)}>
              {researchStrategies.map((option) => (
                <option value={option} key={option}>
                  {strategyLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <button type="button" disabled={loading} onClick={() => void runAnalysis()}>
            {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
            연구주제 생성
          </button>
        </form>

        <section className="output">
          {loading && (
            <div className="empty-state">
              <Loader2 className="spin" size={34} />
              <h2>학술 메타데이터 검색 중</h2>
              <p>OpenAlex에서 문헌을 가져온 뒤 이론, 연구 갭, 주제, 점수를 종합합니다.</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <AlertCircle size={24} />
              <div>
                <h2>분석을 완료하지 못했습니다</h2>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="empty-state">
              <Brain size={38} />
              <h2>연구 방향을 만들 준비가 되었습니다</h2>
              <p>여러 키워드와 분야, 연구방법을 선택하면 근거 기반 연구주제 후보를 생성합니다.</p>
            </div>
          )}

          {result && (
            <div className="results">
              <section className="metrics-row">
                <div>
                  <BookOpen size={22} />
                  <span>검색 논문</span>
                  <strong>{result.diagnostics.retrievedCount}</strong>
                </div>
                <div>
                  <Brain size={22} />
                  <span>추출 이론</span>
                  <strong>{result.synthesis.theories.length}</strong>
                </div>
                <div>
                  <Sparkles size={22} />
                  <span>탐지된 갭</span>
                  <strong>{result.gaps.length}</strong>
                </div>
                <div>
                  <BarChart3 size={22} />
                  <span>생성 주제</span>
                  <strong>{result.topics.length}</strong>
                </div>
                <div>
                  <Network size={22} />
                  <span>그래프 노드</span>
                  <strong>{result.theoryGraph.nodes.length}</strong>
                </div>
                <div>
                  <GitFork size={22} />
                  <span>관계 엣지</span>
                  <strong>{result.theoryGraph.edges.length}</strong>
                </div>
                <div>
                  <Layers3 size={22} />
                  <span>연구 클러스터</span>
                  <strong>{result.citationIntelligence.researchClusters.length}</strong>
                </div>
                <div>
                  <FileText size={22} />
                  <span>리뷰 섹션</span>
                  <strong>{result.literatureReviewDraft.thematicGrouping.length + 6}</strong>
                </div>
              </section>

              <section className="split">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Research Strategy</p>
                      <h2>개인화 연구 전략</h2>
                    </div>
                    <Rocket size={22} />
                  </div>
                  <div className="domain-grid">
                    <div>
                      <span>선택 전략</span>
                      <strong>{strategyLabels[result.query.strategy]}</strong>
                    </div>
                    <div>
                      <span>자료 난이도</span>
                      <strong>{result.datasetIntelligence.dataDifficultyEstimate}</strong>
                    </div>
                    <div>
                      <span>저널 후보</span>
                      <strong>{result.publicationIntelligence.journals.length}</strong>
                    </div>
                    <div>
                      <span>저장된 워크스페이스</span>
                      <strong>{savedWorkspaces.length}</strong>
                    </div>
                  </div>
                  <div className="export-actions">
                    <button type="button" onClick={saveCurrentWorkspace}><Save size={16} /> 저장</button>
                    <button type="button" onClick={() => downloadText("research-strategy.md", result.exportBundle.markdown, "text/markdown")}><Download size={16} /> Markdown</button>
                    <button type="button" onClick={() => downloadText("research-citations.bib", result.exportBundle.bibtex, "text/plain")}><Download size={16} /> BibTeX</button>
                    <button type="button" onClick={() => window.print()}><FileText size={16} /> PDF</button>
                  </div>
                  <p className="muted">{result.exportBundle.citationNote}</p>
                </section>
                <section className="panel">
                  <p className="tag">Workspace History</p>
                  <h2>저장 워크스페이스 / 히스토리</h2>
                  <div className="rank-list compact">
                    {savedWorkspaces.length === 0 ? (
                      <article><strong>저장된 기록 없음</strong><span>분석을 실행하거나 저장 버튼을 누르면 이곳에 남습니다.</span></article>
                    ) : (
                      savedWorkspaces.slice(0, 5).map((item) => (
                        <article key={item.id}>
                          <strong>{item.title}</strong>
                          <span>{new Date(item.createdAt).toLocaleString()} · 토픽 {item.topicCount}개</span>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Journal Targeting</p>
                      <h2>저널·학회 타깃팅</h2>
                    </div>
                    <BookOpen size={22} />
                  </div>
                  <div className="rank-list">
                    {[...result.publicationIntelligence.journals, ...result.publicationIntelligence.conferences].slice(0, 6).map((venue) => (
                      <article key={`venue-${venue.name}`}>
                        <strong>{venue.name}</strong>
                        <span>{venue.type} · 색인: {venue.classification === "unknown" ? "확인 필요" : venue.classification} · 방법 적합 {venue.methodologyFit}/10 · 주제 적합 {venue.topicFit}/10</span>
                        <p>{venue.impactTrendEstimate}</p>
                        <p>{venue.publishabilityReasoning}</p>
                      </article>
                    ))}
                  </div>
                  <ul className="plain-list">
                    {result.publicationIntelligence.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </section>
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Dataset Intelligence</p>
                      <h2>데이터셋·수집 추천</h2>
                    </div>
                    <ClipboardList size={22} />
                  </div>
                  <div className="rank-list">
                    {result.datasetIntelligence.recommendations.slice(0, 5).map((dataset) => (
                      <article key={`dataset-${dataset.name}`}>
                        <strong>{dataset.name}</strong>
                        <span>{dataset.type} · 난이도 {dataset.difficulty}</span>
                        <p>{dataset.suitability}</p>
                        <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">공식 소스 확인</a>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.datasetIntelligence.apiScrapingPossibilities}</p>
                </section>
              </section>

              <section className="split">
                <section className="panel">
                  <p className="tag">Competition Intelligence</p>
                  <h2>연구 경쟁 지형</h2>
                  <div className="map-grid">
                    <div>
                      <h3>과포화 후보</h3>
                      <ul className="plain-list">
                        {result.competitionIntelligence.oversaturatedTopics.slice(0, 4).map((item) => (
                          <li key={`over-${item.label}`}>{item.label} · {item.level}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>빠른 성장</h3>
                      <ul className="plain-list">
                        {result.competitionIntelligence.rapidlyGrowingAreas.slice(0, 4).map((item) => (
                          <li key={`grow-${item.label}`}>{item.label} · {item.level}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>기회 영역</h3>
                      <ul className="plain-list">
                        {result.competitionIntelligence.emergingOpportunities.slice(0, 4).map((item) => (
                          <li key={`opp-${item.label}`}>{item.label} · {item.level}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
                <section className="panel">
                  <p className="tag">Long-term Roadmap</p>
                  <h2>장기 연구 로드맵</h2>
                  <div className="rank-list">
                    {[...result.longTermResearchRoadmap.shortTermPaperIdeas.slice(0, 2), ...result.longTermResearchRoadmap.dissertationThesisPathways.slice(0, 1), ...result.longTermResearchRoadmap.multiPaperResearchAgendas.slice(0, 1)].map((item) => (
                      <article key={`long-${item.title}`}>
                        <strong>{item.title}</strong>
                        <p>{item.rationale}</p>
                        <span>{item.evidence}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <CitationNetworkPanel result={result} />
                <section className="panel dashboard-panel">
                  <p className="tag">Bibliometric Dashboard</p>
                  <h2>인용·계량 분석</h2>
                  <div className="dashboard-metrics">
                    <div>
                      <span>직접 인용</span>
                      <strong>{result.citationIntelligence.network.metrics.directCitationEdges}</strong>
                    </div>
                    <div>
                      <span>공통참고문헌</span>
                      <strong>{result.citationIntelligence.network.metrics.sharedReferenceEdges}</strong>
                    </div>
                    <div>
                      <span>평균 인용</span>
                      <strong>{result.citationIntelligence.network.metrics.averageCitations.toFixed(1)}</strong>
                    </div>
                    <div>
                      <span>성숙도</span>
                      <strong>{result.bibliometricAnalysis.researchMaturity.score}/10</strong>
                    </div>
                  </div>
                  <p className="muted">{result.bibliometricAnalysis.researchMaturity.evidence}</p>
                  <div className="signal-list">
                    {result.citationIntelligence.highlyCitedPapers.slice(0, 4).map((paper) => (
                      <article key={`high-${paper.paperId}`}>
                        <strong>{topicShortTitle(paper.title)}</strong>
                        <span>{paper.year ?? "연도 미상"} · 인용 {paper.citedByCount}</span>
                        <p>{paper.reason}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Scientometric Analysis</p>
                      <h2>키워드 공출현·토픽 진화</h2>
                    </div>
                    <BarChart3 size={22} />
                  </div>
                  <div className="cooccurrence-list">
                    {result.bibliometricAnalysis.keywordCooccurrences.slice(0, 8).map((item) => (
                      <div key={`${item.source}-${item.target}`}>
                        <span>{item.source}</span>
                        <i />
                        <span>{item.target}</span>
                        <strong>{item.weight}</strong>
                      </div>
                    ))}
                  </div>
                  <h3 className="subsection-title">토픽 진화</h3>
                  <div className="timeline-list">
                    {result.bibliometricAnalysis.topicEvolution.slice(0, 6).map((topic) => (
                      <article key={`evo-${topic.label}`}>
                        <strong>{topic.label}</strong>
                        <span>{topic.firstYear ?? "?"} - {topic.latestYear ?? "?"} · {topic.trajectory}</span>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Collaboration Map</p>
                      <h2>저자·기관·국가 흐름</h2>
                    </div>
                    <Users size={22} />
                  </div>
                  <div className="rank-list">
                    {result.citationIntelligence.authorInfluence.slice(0, 5).map((author) => (
                      <article key={`author-${author.author}`}>
                        <strong>{author.author}</strong>
                        <span>{author.paperCount}편 · 총 인용 {author.totalCitations}</span>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">기관/국가</h3>
                  <div className="rank-list compact">
                    {result.bibliometricAnalysis.institutionTrends.slice(0, 4).map((institution) => (
                      <article key={`inst-${institution.institution}`}>
                        <strong>{institution.institution}</strong>
                        <span>{institution.countries.join(", ") || "국가 미상"} · {institution.paperCount}편</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel literature-map-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Literature Map</p>
                      <h2>문헌 지도</h2>
                    </div>
                    <MapIcon size={22} />
                  </div>
                  <div className="map-grid">
                    <div>
                      <h3>기초 이론</h3>
                      <ul className="plain-list">
                        {result.literatureMap.foundationalTheories.slice(0, 5).map((item) => (
                          <li key={`foundation-${item.label}`}>{item.label} · {item.support}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>인접 분야</h3>
                      <ul className="plain-list">
                        {result.literatureMap.adjacentDisciplines.slice(0, 5).map((item) => (
                          <li key={`adjacent-${item.label}`}>{item.label} · {item.support}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>융합 브리지</h3>
                      <ul className="plain-list">
                        {result.literatureMap.interdisciplinaryBridges.slice(0, 5).map((bridge) => (
                          <li key={`bridge-${bridge.source}-${bridge.target}`}>{bridge.source} ↔ {bridge.target}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
                <section className="panel">
                  <p className="tag">Theory Evolution Timeline</p>
                  <h2>이론 진화 타임라인</h2>
                  <div className="timeline-list">
                    {result.literatureMap.theoryEvolutionTimeline.length === 0 ? (
                      <p className="muted">연도와 이론 라벨이 함께 있는 명시 신호가 부족합니다.</p>
                    ) : (
                      result.literatureMap.theoryEvolutionTimeline.slice(0, 8).map((item) => (
                        <article key={`${item.year}-${item.label}-${item.evidence}`}>
                          <strong>{item.year} · {item.label}</strong>
                          <span>{topicShortTitle(item.evidence)}</span>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel debate-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Debate Detection</p>
                      <h2>모순·논쟁 신호</h2>
                    </div>
                    <TriangleAlert size={22} />
                  </div>
                  {result.debateAnalysis.length === 0 ? (
                    <p className="muted">검색 메타데이터에서 명시적인 모순·논쟁 신호를 충분히 찾지 못했습니다.</p>
                  ) : (
                    <div className="insight-list">
                      {result.debateAnalysis.map((debate) => (
                        <article key={`${debate.type}-${debate.claim}`}>
                          <p className="tag">{debate.type.replaceAll("_", " ")}</p>
                          <h4>{debate.claim}</h4>
                          <p>{debate.evidence}</p>
                          <span>신뢰도: {confidenceLabels[debate.confidence]}</span>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
                <section className="panel roadmap-panel">
                  <p className="tag">Research Roadmap</p>
                  <h2>연구 로드맵</h2>
                  <div className="rank-list">
                    {[...result.researchRoadmap.beginnerSafeTopics.slice(0, 2), ...result.researchRoadmap.highImpactHighRiskTopics.slice(0, 2)].map((item) => (
                      <article key={`roadmap-${item.title}`}>
                        <strong>{item.title}</strong>
                        <p>{item.rationale}</p>
                        <span>{item.evidence}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="panel review-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">AI-assisted Literature Review</p>
                    <h2>문헌고찰 초안 내보내기 뷰</h2>
                  </div>
                  <FileText size={22} />
                </div>
                <div className="review-section-grid">
                  {[result.literatureReviewDraft.introductionOverview, result.literatureReviewDraft.theorySynthesis, result.literatureReviewDraft.trendDiscussion, result.literatureReviewDraft.contradictionAnalysis, result.literatureReviewDraft.gapSummary, result.literatureReviewDraft.futureResearchDirections].map((section) => (
                    <article key={`review-${section.title}`}>
                      <h3>{section.title}</h3>
                      <p><strong>검색 근거:</strong> {section.retrievedEvidence.slice(0, 2).join(" / ") || "명시 근거 부족"}</p>
                      <p><strong>추론 종합:</strong> {section.inferredSynthesis}</p>
                      <p><strong>생성 서술:</strong> {section.generatedNarrative}</p>
                    </article>
                  ))}
                </div>
                <details>
                  <summary>Markdown 초안 보기</summary>
                  <pre className="review-export">{result.literatureReviewDraft.exportMarkdown}</pre>
                </details>
              </section>

              <section className="split wide-left">
                <section className="panel copilot-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Agentic Copilot</p>
                      <h2>연구 코파일럿</h2>
                    </div>
                    <MessageSquare size={22} />
                  </div>
                  <p>{result.copilot.summary}</p>
                  <div className="copilot-actions">
                    <button type="button" onClick={() => result.topics[0] && addCopilotMessage(result.topics[0], "safe")}>
                      <ShieldCheck size={16} /> 안전한 방향
                    </button>
                    <button type="button" onClick={() => result.topics[0] && addCopilotMessage(result.topics[0], "novel")}>
                      <Rocket size={16} /> 고참신성 방향
                    </button>
                    <button type="button" onClick={() => result.topics[0] && addCopilotMessage(result.topics[0], "methods")}>
                      <ClipboardList size={16} /> 방법론 대안
                    </button>
                  </div>
                  <div className="copilot-stream">
                    {copilotMessages.map((message, index) => (
                      <article key={`${message.title}-${index}`}>
                        <h3>{message.title}</h3>
                        <p>{message.message}</p>
                        <span>{message.evidence}</span>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="panel comparison-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Comparative Intelligence</p>
                      <h2>토픽 비교</h2>
                    </div>
                    <Scale size={22} />
                  </div>
                  <div className="comparison-table">
                    <div className="comparison-row comparison-head">
                      <span>토픽</span>
                      <span>참신성</span>
                      <span>실행</span>
                      <span>출판</span>
                      <span>근거</span>
                      <span>판정</span>
                    </div>
                    {result.copilot.comparisons.map((comparison, index) => (
                      <div className="comparison-row" key={`${comparison.topicTitle}-${index}`}>
                        <strong>{topicShortTitle(comparison.topicTitle)}</strong>
                        <span>{comparison.novelty}</span>
                        <span>{comparison.feasibility}</span>
                        <span>{comparison.publishability}</span>
                        <span>{comparison.literatureSupportStrength}</span>
                        <em>{comparisonLabels[comparison.recommendation]}</em>
                      </div>
                    ))}
                  </div>
                  <div className="direction-boxes">
                    <p><strong>안전한 방향:</strong> {result.copilot.saferDirection}</p>
                    <p><strong>고참신성 방향:</strong> {result.copilot.highNoveltyDirection}</p>
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel domain-panel">
                  <p className="tag">Domain Intelligence</p>
                  <h2>분야별 연구 설계 가이드</h2>
                  <div className="domain-grid">
                    <div>
                      <span>선택 분야</span>
                      <strong>{result.domainIntelligence.label}</strong>
                    </div>
                    <div>
                      <span>선호 방법론</span>
                      <strong>{result.domainIntelligence.preferredMethodologies.slice(0, 5).join(", ")}</strong>
                    </div>
                    <div>
                      <span>대표 이론</span>
                      <strong>{result.domainIntelligence.dominantTheories.slice(0, 4).join(", ")}</strong>
                    </div>
                    <div>
                      <span>전형 자료/표본</span>
                      <strong>{result.domainIntelligence.typicalDatasetsSamples.slice(0, 3).join(", ")}</strong>
                    </div>
                  </div>
                  <ul className="plain-list">
                    {result.domainIntelligence.methodologicalExpectations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="panel method-compare-panel">
                  <p className="tag">Methodology Intelligence</p>
                  <h2>방법론 비교 패널</h2>
                  <div className="method-rank-list">
                    {result.copilot.methodologyAlternatives.map((method) => (
                      <article key={`alt-${method.method}`}>
                        <div>
                          <strong>{method.method}</strong>
                          <span>적합도 {method.fit}/10</span>
                        </div>
                        <p>{method.rationale}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <TheoryGraphPanel result={result} />
                <section className="panel dashboard-panel">
                  <p className="tag">Gap Intelligence</p>
                  <h2>연구 갭 대시보드</h2>
                  <div className="dashboard-metrics">
                    <div>
                      <span>그래프 밀도</span>
                      <strong>{result.theoryGraph.metrics.density.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>약한 연결</span>
                      <strong>{result.theoryGraph.metrics.weakConnectionCount}</strong>
                    </div>
                    <div>
                      <span>부상 조합</span>
                      <strong>{result.theoryGraph.metrics.emergingConnectionCount}</strong>
                    </div>
                    <div>
                      <span>방법론 다양성</span>
                      <strong>{result.theoryGraph.metrics.methodologyDiversity}</strong>
                    </div>
                  </div>
                  <h3>관계 인사이트</h3>
                  <div className="insight-list">
                    {result.relationshipAnalysis.slice(0, 6).map((insight, index) => (
                      <article key={`${insight.type}-${index}`}>
                        <p className="tag">{relationshipLabels[insight.type]}</p>
                        <h4>{insight.title}</h4>
                        <p>{insight.evidence}</p>
                        <span>신뢰도: {confidenceLabels[insight.confidence]}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <EvidenceList title="핵심 이론 및 프레임워크" items={result.synthesis.theories} />
                <section className="panel">
                  <h2>연구 동향 시각화</h2>
                  <div className="trend-bars">
                    {result.synthesis.trends.slice(0, 8).map((trend) => (
                      <div className="trend" key={trend.label}>
                        <span>{trend.label}</span>
                        <div>
                          <i style={{ width: `${(trend.support / maxTrend) * 100}%` }} />
                        </div>
                        <strong>{trend.support}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <EvidenceList title="한계 및 후속 연구" items={result.synthesis.limitations} />
                <EvidenceList title="관련 이론 및 부상 주제" items={relatedAndEmerging} />
              </section>

              <section className="split">
                <section className="panel">
                  <h2>상승 / 하락 주제</h2>
                  <div className="trend-bars">
                    {result.trendAnalysis.risingTopics.length === 0 ? (
                      <p className="muted">최근 증가 신호가 뚜렷한 주제를 찾지 못했습니다.</p>
                    ) : (
                      result.trendAnalysis.risingTopics.map((trend) => (
                        <div className="trend comparison" key={`rising-${trend.label}`}>
                          <span>{trend.label}</span>
                          <div><i style={{ width: `${Math.min(100, trend.recentCount * 18)}%` }} /></div>
                          <strong>{trend.recentCount}</strong>
                        </div>
                      ))
                    )}
                  </div>
                  <h3 className="subsection-title">하락 주제</h3>
                  <div className="trend-bars">
                    {result.trendAnalysis.decliningTopics.length === 0 ? (
                      <p className="muted">이 검색 집합에서는 하락 신호가 뚜렷한 주제가 없습니다.</p>
                    ) : (
                      result.trendAnalysis.decliningTopics.map((trend) => (
                        <div className="trend declining" key={`declining-${trend.label}`}>
                          <span>{trend.label}</span>
                          <div><i style={{ width: `${Math.min(100, trend.priorCount * 18)}%` }} /></div>
                          <strong>{trend.priorCount}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </section>
                <section className="panel">
                  <h2>연도별 빈도</h2>
                  <div className="mini-chart-grid">
                    {result.trendAnalysis.frequencyOverTime.slice(0, 6).map((trend) => (
                      <div className="mini-chart" key={`freq-${trend.label}`}>
                        <span>{trend.label}</span>
                        <div>
                          {trend.years.slice(-6).map((item) => (
                            <i key={`${trend.label}-${item.year}`} style={{ height: `${Math.max(8, item.count * 14)}px` }} title={`${item.year}: ${item.count}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </section>

              <section className="panel">
                <h2>연구 갭 분석</h2>
                <div className="gap-grid">
                  {result.gaps.map((gap) => (
                    <article className="gap-card" key={`${gap.type}-${gap.claim}`}>
                      <p className="tag">{gapTypeLabels[gap.type] ?? gap.type.replaceAll("_", " ")}</p>
                      <h3>{gap.claim}</h3>
                      <p>{gap.evidence}</p>
                      <span>신뢰도: {confidenceLabels[gap.confidence]}</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="topic-grid">
                {result.topics.map((topic, index) => (
                  <article className="topic-card" key={`${topic.title}-${index}`}>
                    <div className="topic-head">
                      <p className="tag">생성된 추론</p>
                      <h2>{topic.title}</h2>
                    </div>
                    <p>{topic.rationale}</p>
                    <h3>연구문제</h3>
                    <p>{topic.researchQuestion}</p>
                    <h3>가설 / 명제</h3>
                    <ul>
                      {topic.hypotheses.map((hypothesis) => (
                        <li key={hypothesis}>{hypothesis}</li>
                      ))}
                    </ul>
                    <h3>변수 / 개념</h3>
                    <div className="chips">
                      {topic.variables.map((variable) => (
                        <span key={variable}>{variable}</span>
                      ))}
                    </div>
                    <section className="topic-intelligence">
                      <h3>고급 토픽 인텔리전스</h3>
                      <div className="intelligence-grid">
                        <div>
                          <span>핵심 이론</span>
                          <strong>{topic.coreTheory}</strong>
                        </div>
                        <div>
                          <span>인접 이론</span>
                          <strong>{topic.adjacentTheories.slice(0, 3).join(", ") || "명시 신호 부족"}</strong>
                        </div>
                        <div>
                          <span>매개/조절 후보</span>
                          <strong>{topic.mediatorsModerators.join(", ") || "추가 검토 필요"}</strong>
                        </div>
                        <div>
                          <span>출판 적합성</span>
                          <strong>{topic.publicationSuitabilityEstimate}</strong>
                        </div>
                      </div>
                      <p>{topic.expectedContribution}</p>
                    </section>
                    <details>
                      <summary>방법론 추천 가이드</summary>
                      <div className="method-list">
                        {topic.methodologyRecommendations.map((recommendation) => (
                          <article key={`${topic.title}-${recommendation.method}`}>
                            <h4>{recommendation.method} · 적합도 {recommendation.fit}/10</h4>
                            <p>{recommendation.rationale}</p>
                            <span>{recommendation.evidence}</span>
                            <ul>
                              {recommendation.risks.map((risk) => (
                                <li key={risk}>{risk}</li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      </div>
                    </details>
                    <details>
                      <summary>연구계획 산출물</summary>
                      <div className="planning-output">
                        <h4>개념 모델</h4>
                        <p>{topic.researchPlan.conceptualModel}</p>
                        <h4>연구 설계 가이드</h4>
                        <p><strong>권장 표본:</strong> {topic.researchDesignGuidance.recommendedSampleType}</p>
                        <p><strong>표본 크기:</strong> {topic.researchDesignGuidance.estimatedSampleSizeGuidance}</p>
                        <p><strong>분석 방법:</strong> {topic.researchDesignGuidance.suggestedAnalysisMethod}</p>
                        <h4>자료 / 표본 추천</h4>
                        <ul>
                          {topic.researchPlan.sampleDataRecommendations.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <h4>수집 방법</h4>
                        <div className="chips">
                          {topic.researchPlan.dataCollectionMethods.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                        <h4>확장 방향</h4>
                        <ul>
                          {topic.researchPlan.futureExpansionDirections.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <h4>저널 / 학회 방향</h4>
                        <ul>
                          {topic.researchDesignGuidance.journalConferenceDirections.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <h4>방법론 리스크</h4>
                        <ul>
                          {topic.researchDesignGuidance.methodologyRisks.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </details>
                    <details>
                      <summary>데이터셋 및 수집 전략</summary>
                      <div className="planning-output">
                        <p><strong>설문/인터뷰:</strong> {topic.datasetIntelligence.surveyInterviewSuitability}</p>
                        <p><strong>실험 가능성:</strong> {topic.datasetIntelligence.experimentalFeasibility}</p>
                        <p><strong>자료 난이도:</strong> {topic.datasetIntelligence.dataDifficultyEstimate}</p>
                        <h4>공개 데이터 후보</h4>
                        <ul>
                          {topic.datasetIntelligence.recommendations.slice(0, 4).map((dataset) => (
                            <li key={`${topic.title}-${dataset.name}`}>
                              <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">{dataset.name}</a> · {dataset.difficulty} · {dataset.evidence}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                    <div className="refinement-actions">
                      <button type="button" onClick={() => toggleBookmark(topic.title)}>
                        <Star size={16} /> {bookmarkedTopics.includes(topic.title) ? "북마크 해제" : "북마크"}
                      </button>
                      <button type="button" onClick={() => addCopilotMessage(topic, "improve")}>
                        <Wand2 size={16} /> 이 토픽 개선
                      </button>
                      <button type="button" onClick={() => addCopilotMessage(topic, "safe")}>
                        <ShieldCheck size={16} /> 안전하게
                      </button>
                      <button type="button" onClick={() => addCopilotMessage(topic, "novel")}>
                        <Rocket size={16} /> 더 참신하게
                      </button>
                    </div>
                    <div className="contrib">
                      <p>
                        <strong>학술적 기여:</strong> {topic.academicContribution}
                      </p>
                      <p>
                        <strong>실무적 기여:</strong> {topic.practicalContribution}
                      </p>
                    </div>
                    <div className="scores">
                      {Object.entries(topic.scores).map(([label, value]) => (
                        <div className={scoreColor(value)} key={label}>
                          <span>{scoreLabels[label] ?? label}</span>
                          <strong>{value}/10</strong>
                        </div>
                      ))}
                    </div>
                    <details>
                      <summary>사용된 검색 근거</summary>
                      <ul>
                        {topic.evidencePaperIds.slice(0, 4).map((paperId) => {
                          const paper = paperMap.get(paperId);
                          return paper ? (
                            <li key={paperId}>
                              <a href={paper.url} target="_blank" rel="noreferrer">
                                {paper.title}
                              </a>{" "}
                              <span>{paper.year ?? "연도 미상"}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                      <p className="muted">{topic.inferenceNotice}</p>
                    </details>
                  </article>
                ))}
              </section>

              <section className="panel">
                <h2>근거 패널</h2>
                <div className="evidence-panel-grid">
                  {result.papers.slice(0, 6).map((paper) => (
                    <article key={paper.id}>
                      <a href={paper.url} target="_blank" rel="noreferrer">{paper.title}</a>
                      <p>{paper.year ?? "연도 미상"} · 인용 {paper.citedByCount} · {paper.source}</p>
                      <div className="chips">
                        {paper.concepts.slice(0, 4).map((concept) => (
                          <span key={`${paper.id}-${concept}`}>{concept}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
