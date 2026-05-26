"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardList,
  GitFork,
  Loader2,
  MessageSquare,
  Network,
  Rocket,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  disciplines,
  methodologies,
  type CopilotMessage,
  type Discipline,
  type GraphNode,
  type Methodology,
  type ResearchIntelligenceResult,
  type Topic
} from "@/lib/research/types";
import { disciplineLabels, methodologyLabels } from "@/lib/research/domain";

const initialKeywords = "AI, education, self-efficacy";

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
  const [result, setResult] = useState<ResearchIntelligenceResult | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paperMap = useMemo(() => new Map(result?.papers.map((paper) => [paper.id, paper]) ?? []), [result]);
  const maxTrend = Math.max(1, ...(result?.synthesis.trends.map((trend) => trend.support) ?? [1]));
  const relatedAndEmerging = uniqueEvidence([...(result?.synthesis.relatedTheories ?? []), ...(result?.synthesis.emergingTopics ?? [])]).slice(0, 8);

  async function runAnalysis(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = event?.currentTarget ?? formRef.current;
    const formData = form ? new FormData(form) : null;
    const submittedKeywords = String(formData?.get("keywords") ?? keywords);
    const submittedDiscipline = String(formData?.get("discipline") ?? discipline) as Discipline;
    const submittedMethodology = String(formData?.get("methodology") ?? methodology) as Methodology;
    setKeywords(submittedKeywords);
    setDiscipline(submittedDiscipline);
    setMethodology(submittedMethodology);
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
          methodology: submittedMethodology
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail ? `${payload.error} ${payload.detail}` : payload?.error ?? "분석에 실패했습니다.");
      }
      const typedPayload = payload as ResearchIntelligenceResult;
      setResult(typedPayload);
      setCopilotMessages(typedPayload.copilot.starterMessages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function addCopilotMessage(topic: Topic, mode: "improve" | "safe" | "novel" | "methods") {
    setCopilotMessages((current) => [buildImproveMessage(topic, mode), ...current].slice(0, 8));
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
                    <div className="refinement-actions">
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
