"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardList,
  Compass,
  Download,
  FileText,
  GitFork,
  GraduationCap,
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
  Target,
  TriangleAlert,
  UserRound,
  Users,
  Wand2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  disciplines,
  methodologies,
  researchStrategies,
  type CareerStage,
  type CopilotMessage,
  type Discipline,
  type GraphNode,
  type Methodology,
  type ResearcherProfile,
  type ResearchStrategy,
  type ResearchIntelligenceResult,
  type Topic,
  type TopicCritiqueType,
  type ZoteroSyncResult
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
  theoryGraphNodeCount?: number;
  literatureMapItems?: number;
  evolvingAgenda?: string[];
  collaborators?: string[];
};

type RefinementHistoryRecord = {
  id: string;
  loopId: string;
  topicTitle: string;
  createdAt: string;
  summary: string;
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

const careerStageLabels: Record<CareerStage, string> = {
  student: "학생 연구자",
  researcher: "연구자",
  professor: "교수 / PI"
};

const noveltyToleranceLabels: Record<ResearcherProfile["noveltyTolerance"], string> = {
  low: "낮음",
  medium: "중간",
  high: "높음"
};

const evaluationLabels: Record<string, string> = {
  novelty: "참신성",
  feasibility: "실행가능성",
  methodological_rigor: "방법론 엄밀성",
  publication_potential: "출판 잠재력",
  interdisciplinary_strength: "융합 강도",
  theoretical_coherence: "이론 정합성",
  empirical_testability: "실증 검증성",
  replication_potential: "재현 가능성"
};

const critiqueLabels: Record<TopicCritiqueType, string> = {
  weak_theory_grounding: "약한 이론 기반",
  low_novelty: "낮은 참신성",
  oversaturation: "과포화 위험",
  weak_methodology_fit: "취약한 방법론 적합도",
  poor_data_feasibility: "낮은 데이터 실행가능성",
  unclear_contribution: "불명확한 기여"
};

const refinedScoreLabels: Record<string, string> = {
  novelty: "참신성",
  feasibility: "실행가능성",
  publishability: "출판가능성",
  theoryCoherence: "이론 정합성",
  evidenceSupport: "근거 지지"
};

const predictionDirectionLabels: Record<string, string> = {
  rising: "상승",
  declining: "하락",
  stable: "안정",
  saturated: "포화",
  accelerating: "가속"
};

const optimizationVariantLabels: Record<string, string> = {
  publication_likelihood: "출판가능성",
  novelty: "참신성",
  feasibility: "실행가능성",
  risk_impact_balance: "위험/임팩트 균형"
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

function splitProfileList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);
  const [keywords, setKeywords] = useState(initialKeywords);
  const [discipline, setDiscipline] = useState<Discipline>("education");
  const [methodology, setMethodology] = useState<Methodology>("quantitative");
  const [strategy, setStrategy] = useState<ResearchStrategy>("beginner-safe research");
  const [profileInterests, setProfileInterests] = useState("AI education, self-efficacy, learning analytics");
  const [profilePreferredMethods, setProfilePreferredMethods] = useState("quantitative, SEM, regression");
  const [profileGoals, setProfileGoals] = useState("journal article, dissertation chapter");
  const [profileTargetVenues, setProfileTargetVenues] = useState("Computers & Education, Education and Information Technologies");
  const [theoreticalOrientation, setTheoreticalOrientation] = useState("social cognitive theory with practical education impact");
  const [noveltyTolerance, setNoveltyTolerance] = useState<ResearcherProfile["noveltyTolerance"]>("medium");
  const [careerStage, setCareerStage] = useState<CareerStage>("student");
  const [result, setResult] = useState<ResearchIntelligenceResult | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([]);
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [refinementHistory, setRefinementHistory] = useState<RefinementHistoryRecord[]>([]);
  const [zoteroResult, setZoteroResult] = useState<ZoteroSyncResult | null>(null);
  const [zoteroLoading, setZoteroLoading] = useState(false);
  const [zoteroError, setZoteroError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paperMap = useMemo(() => new Map(result?.papers.map((paper) => [paper.id, paper]) ?? []), [result]);
  const maxTrend = Math.max(1, ...(result?.synthesis.trends.map((trend) => trend.support) ?? [1]));
  const relatedAndEmerging = uniqueEvidence([...(result?.synthesis.relatedTheories ?? []), ...(result?.synthesis.emergingTopics ?? [])]).slice(0, 8);

  useEffect(() => {
    const saved = window.localStorage.getItem("ris-workspaces");
    const bookmarks = window.localStorage.getItem("ris-bookmarks");
    const refinements = window.localStorage.getItem("ris-refinement-history");
    if (saved) setSavedWorkspaces(JSON.parse(saved) as SavedWorkspace[]);
    if (bookmarks) setBookmarkedTopics(JSON.parse(bookmarks) as string[]);
    if (refinements) setRefinementHistory(JSON.parse(refinements) as RefinementHistoryRecord[]);
  }, []);

  async function runAnalysis(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = event?.currentTarget ?? formRef.current;
    const formData = form ? new FormData(form) : null;
    const submittedKeywords = String(formData?.get("keywords") ?? keywords);
    const submittedDiscipline = String(formData?.get("discipline") ?? discipline) as Discipline;
    const submittedMethodology = String(formData?.get("methodology") ?? methodology) as Methodology;
    const submittedStrategy = String(formData?.get("strategy") ?? strategy) as ResearchStrategy;
    const submittedProfile: Partial<ResearcherProfile> = {
      interests: splitProfileList(String(formData?.get("profileInterests") ?? profileInterests)),
      preferredMethodologies: splitProfileList(String(formData?.get("profilePreferredMethods") ?? profilePreferredMethods)).filter((item): item is Methodology =>
        methodologies.includes(item as Methodology)
      ),
      publicationGoals: splitProfileList(String(formData?.get("profileGoals") ?? profileGoals)),
      targetVenues: splitProfileList(String(formData?.get("profileTargetVenues") ?? profileTargetVenues)),
      theoreticalOrientation: String(formData?.get("theoreticalOrientation") ?? theoreticalOrientation),
      noveltyTolerance: String(formData?.get("noveltyTolerance") ?? noveltyTolerance) as ResearcherProfile["noveltyTolerance"],
      careerStage: String(formData?.get("careerStage") ?? careerStage) as CareerStage
    };
    setKeywords(submittedKeywords);
    setDiscipline(submittedDiscipline);
    setMethodology(submittedMethodology);
    setStrategy(submittedStrategy);
    setProfileInterests(submittedProfile.interests?.join(", ") ?? "");
    setProfilePreferredMethods(submittedProfile.preferredMethodologies?.join(", ") ?? "");
    setProfileGoals(submittedProfile.publicationGoals?.join(", ") ?? "");
    setProfileTargetVenues(submittedProfile.targetVenues?.join(", ") ?? "");
    setTheoreticalOrientation(submittedProfile.theoreticalOrientation ?? "");
    setNoveltyTolerance(submittedProfile.noveltyTolerance ?? "medium");
    setCareerStage(submittedProfile.careerStage ?? "student");
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
          strategy: submittedStrategy,
          researcherProfile: submittedProfile
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
            bookmarkedTopicTitles: [],
            theoryGraphNodeCount: typedPayload.researchMemorySeed.savedTheoryGraphNodeCount,
            literatureMapItems: typedPayload.researchMemorySeed.savedLiteratureMapItems,
            evolvingAgenda: typedPayload.researchMemorySeed.evolvingResearchAgenda,
            collaborators: ["사용자", "Retrieval Agent", "Synthesis Agent", "Roadmap Agent"]
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

  async function syncZoteroLibrary() {
    setZoteroLoading(true);
    setZoteroError(null);
    try {
      const response = await fetch("/api/zotero", { method: "GET" });
      const payload = await response.json() as ZoteroSyncResult;
      setZoteroResult(payload);
      if (payload.status.state !== "connected") {
        setZoteroError(payload.status.message);
      }
    } catch (caught) {
      setZoteroError(caught instanceof Error ? caught.message : "Zotero 동기화에 실패했습니다.");
    } finally {
      setZoteroLoading(false);
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
      bookmarkedTopicTitles: bookmarkedTopics,
      theoryGraphNodeCount: result.researchMemorySeed.savedTheoryGraphNodeCount,
      literatureMapItems: result.researchMemorySeed.savedLiteratureMapItems,
      evolvingAgenda: result.researchMemorySeed.evolvingResearchAgenda,
      collaborators: ["사용자", "Retrieval Agent", "Synthesis Agent", "Roadmap Agent"]
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

  function refineAgain(topicTitle: string, summary: string) {
    if (!result) return;
    const record: RefinementHistoryRecord = {
      id: `${result.agenticResearchLoop.loopId}-${Date.now()}`,
      loopId: result.agenticResearchLoop.loopId,
      topicTitle,
      createdAt: new Date().toISOString(),
      summary
    };
    setRefinementHistory((current) => {
      const next = [record, ...current].slice(0, 18);
      window.localStorage.setItem("ris-refinement-history", JSON.stringify(next));
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

          <div className="profile-editor">
            <div className="profile-editor-head">
              <UserRound size={17} />
              <strong>연구자 프로필</strong>
            </div>
            <label>
              <span>관심 주제</span>
              <textarea name="profileInterests" value={profileInterests} onChange={(event) => setProfileInterests(event.target.value)} rows={2} />
            </label>
            <label>
              <span>선호 방법론</span>
              <textarea name="profilePreferredMethods" value={profilePreferredMethods} onChange={(event) => setProfilePreferredMethods(event.target.value)} rows={2} />
            </label>
            <label>
              <span>출판 목표</span>
              <textarea name="profileGoals" value={profileGoals} onChange={(event) => setProfileGoals(event.target.value)} rows={2} />
            </label>
            <label>
              <span>목표 저널/학회</span>
              <textarea name="profileTargetVenues" value={profileTargetVenues} onChange={(event) => setProfileTargetVenues(event.target.value)} rows={2} />
            </label>
            <label>
              <span>이론 성향</span>
              <textarea name="theoreticalOrientation" value={theoreticalOrientation} onChange={(event) => setTheoreticalOrientation(event.target.value)} rows={2} />
            </label>
            <label>
              <span>참신성 허용도</span>
              <select name="noveltyTolerance" value={noveltyTolerance} onChange={(event) => setNoveltyTolerance(event.target.value as ResearcherProfile["noveltyTolerance"])}>
                <option value="low">낮음</option>
                <option value="medium">중간</option>
                <option value="high">높음</option>
              </select>
            </label>
            <label>
              <span>경력 단계</span>
              <select name="careerStage" value={careerStage} onChange={(event) => setCareerStage(event.target.value as CareerStage)}>
                <option value="student">학생 연구자</option>
                <option value="researcher">연구자</option>
                <option value="professor">교수 / PI</option>
              </select>
            </label>
          </div>

          <button type="button" disabled={loading} onClick={() => void runAnalysis()}>
            {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
            연구주제 생성
          </button>

          <section className="zotero-connector">
            <div className="profile-editor-head">
              <BookOpen size={17} />
              <strong>Zotero 개인 라이브러리</strong>
            </div>
            <p>로컬 Zotero Desktop API에서만 읽습니다. API 키, PDF 경로, 원문 전체는 저장하거나 표시하지 않습니다.</p>
            <button type="button" disabled={zoteroLoading} onClick={() => void syncZoteroLibrary()}>
              {zoteroLoading ? <Loader2 className="spin" size={18} /> : <Network size={18} />}
              Zotero 동기화
            </button>
            {zoteroResult && (
              <div className={`zotero-status ${zoteroResult.status.state}`}>
                <strong>{zoteroResult.status.state === "connected" ? "연결됨" : "연결 필요"}</strong>
                <span>{zoteroResult.status.message}</span>
                <em>items {zoteroResult.diagnostics.itemsImported} · collections {zoteroResult.diagnostics.collectionsImported} · PDFs {zoteroResult.diagnostics.pdfsDetected}</em>
              </div>
            )}
            {zoteroError && <p className="zotero-warning">{zoteroError}</p>}
          </section>
        </form>

        <section className="output">
          {zoteroResult && (
            <section className="panel zotero-dashboard-panel">
              <div className="panel-head">
                <div>
                  <p className="tag">Zotero Personal Intelligence</p>
                  <h2>개인 연구 라이브러리 대시보드</h2>
                </div>
                <BookOpen size={22} />
              </div>
              <div className="domain-grid">
                <div>
                  <span>저장 논문</span>
                  <strong>{zoteroResult.items.length}</strong>
                </div>
                <div>
                  <span>컬렉션</span>
                  <strong>{zoteroResult.collections.length}</strong>
                </div>
                <div>
                  <span>PDF 감지</span>
                  <strong>{zoteroResult.diagnostics.pdfsDetected}</strong>
                </div>
                <div>
                  <span>분석 모드</span>
                  <strong>{zoteroResult.diagnostics.fullTextMode === "indexed-snippets-only" ? "Indexed" : "Metadata"}</strong>
                </div>
              </div>
              <p className="muted">{zoteroResult.status.privacyBoundary}</p>
              {zoteroResult.status.state === "connected" ? (
                <>
                  <section className="split">
                    <div className="zotero-panel-block">
                      <h3>관심 주제 / 이론</h3>
                      <div className="chips">
                        {[...zoteroResult.personalIntelligence.inferredResearchInterests.slice(0, 6), ...zoteroResult.personalIntelligence.dominantTheories.slice(0, 4)].map((item) => (
                          <span key={`zotero-interest-${item.label}`}>{item.label} · {item.support}</span>
                        ))}
                      </div>
                    </div>
                    <div className="zotero-panel-block">
                      <h3>방법론 분포</h3>
                      <div className="rank-list compact">
                        {zoteroResult.personalIntelligence.methodologyDistribution.slice(0, 6).map((item) => (
                          <article key={`zotero-method-${item.methodology}`}>
                            <strong>{item.methodology}</strong>
                            <span>{item.count}개 항목</span>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section className="split wide-left">
                    <div className="zotero-panel-block">
                      <h3>개인화 연구 갭 / 주제</h3>
                      <ul className="plain-list">
                        {zoteroResult.personalIntelligence.personalizedResearchGaps.slice(0, 6).map((gap, index) => (
                          <li key={`zotero-gap-${index}-${gap.slice(0, 24)}`}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="zotero-panel-block">
                      <h3>읽기 큐</h3>
                      <div className="rank-list compact">
                        {zoteroResult.personalIntelligence.readingQueueRecommendations.slice(0, 5).map((item) => (
                          <article key={`zotero-reading-${item.itemKey}`}>
                            <strong>{topicShortTitle(item.title)}</strong>
                            <span>{item.reason}</span>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section className="split">
                    <div className="zotero-panel-block">
                      <h3>PDF 분석 신호</h3>
                      <div className="rank-list compact">
                        {zoteroResult.pdfInsights.length === 0 ? (
                          <article>
                            <strong>PDF indexed text 없음</strong>
                            <span>첨부 PDF가 없거나 Zotero indexed full text를 읽지 못했습니다.</span>
                          </article>
                        ) : (
                          zoteroResult.pdfInsights.slice(0, 5).map((insight) => (
                            <article key={`zotero-pdf-${insight.itemKey}`}>
                              <strong>{topicShortTitle(insight.title)}</strong>
                              <span>{insight.source} · theories {insight.theoriesFrameworks.length} · methods {insight.methodologies.length}</span>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="zotero-panel-block">
                      <h3>개인 문헌고찰 초안</h3>
                      <p>{zoteroResult.personalIntelligence.literatureReviewDraft.generatedSynthesis}</p>
                      <ul className="plain-list">
                        {zoteroResult.personalIntelligence.literatureReviewDraft.futureDirections.slice(0, 3).map((item, index) => (
                          <li key={`zotero-future-${index}-${item.slice(0, 24)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </>
              ) : (
                <div className="error-state compact-error">
                  <AlertCircle size={22} />
                  <div>
                    <h2>Zotero 연결이 필요합니다</h2>
                    <p>Zotero Desktop을 실행하고 로컬 API가 켜진 상태에서 다시 동기화하세요. 현재는 개인 라이브러리를 읽지 않았고 mock 데이터도 만들지 않았습니다.</p>
                  </div>
                </div>
              )}
            </section>
          )}

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

              <section className="split wide-left">
                <section className="panel autonomous-os-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Academic OS</p>
                      <h2>자율 연구 운영 대시보드</h2>
                    </div>
                    <ClipboardList size={22} />
                  </div>
                  <p>{result.autonomousAcademicOS.adaptiveStateSummary}</p>
                  <div className="progress-grid">
                    {result.autonomousAcademicOS.progressDashboard.map((item) => (
                      <div key={`os-progress-${item.label}`}>
                        <span>{item.label}</span>
                        <strong>{item.completed}/{item.total}</strong>
                        <em>{item.status === "on_track" ? "진행 양호" : "검토 필요"}</em>
                      </div>
                    ))}
                  </div>
                  <div className="autonomous-stage-grid">
                    {result.autonomousAcademicOS.workflowStages.map((stage) => (
                      <article key={`os-stage-${stage.id}`}>
                        <div>
                          <span>{stage.status.replaceAll("_", " ")}</span>
                          <strong>{stage.label}</strong>
                        </div>
                        <p>{stage.outputSummary}</p>
                        <small>{stage.evidenceBoundary}</small>
                        <em>{stage.nextAction}</em>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.autonomousAcademicOS.operatingBoundary}</p>
                </section>

                <section className="panel monitoring-os-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Monitoring</p>
                      <h2>모니터링 / 알림</h2>
                    </div>
                    <TriangleAlert size={22} />
                  </div>
                  <div className="monitoring-alert-list">
                    {result.autonomousAcademicOS.monitoringAlerts.map((alert) => (
                      <article key={`monitoring-${alert.type}-${alert.label}`}>
                        <span>{alert.severity}</span>
                        <strong>{alert.label}</strong>
                        <p>{alert.evidence}</p>
                        <em>{alert.suggestedAction}</em>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel production-pipeline-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Research Production</p>
                      <h2>연구 생산 파이프라인</h2>
                    </div>
                    <FileText size={22} />
                  </div>
                  <div className="production-draft-grid">
                    {[
                      ["문헌고찰", result.autonomousAcademicOS.productionPipeline.literatureReviewDraft],
                      ["개념 프레임워크", result.autonomousAcademicOS.productionPipeline.conceptualFrameworkDraft],
                      ["방법론 섹션", result.autonomousAcademicOS.productionPipeline.methodologySectionDraft],
                      ["토론/기여", result.autonomousAcademicOS.productionPipeline.discussionContributionDraft],
                      ["후속 연구", result.autonomousAcademicOS.productionPipeline.futureResearchSection],
                      ["학회 초록", result.autonomousAcademicOS.productionPipeline.conferenceAbstractDraft]
                    ].map(([label, draft]) => (
                      <article key={`production-${label}`}>
                        <strong>{label}</strong>
                        <p>{draft}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.autonomousAcademicOS.productionPipeline.productionBoundary}</p>
                </section>

                <section className="panel planner-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Intelligent Planner</p>
                      <h2>지능형 연구 플래너</h2>
                    </div>
                    <MapIcon size={22} />
                  </div>
                  <div className="timeline-list">
                    {result.autonomousAcademicOS.researchPlanner.milestoneTracking.map((item) => (
                      <article key={`planner-milestone-${item.dueOrder}-${item.milestone}`}>
                        <strong>{item.dueOrder}. {item.milestone}</strong>
                        <span>{item.status}</span>
                        <p>{item.evidence}</p>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">출판 순서 전략</h3>
                  <ul className="plain-list">
                    {result.autonomousAcademicOS.researchPlanner.publicationSequencing.slice(0, 4).map((item) => (
                      <li key={`publication-sequence-${item.slice(0, 34)}`}>{item}</li>
                    ))}
                  </ul>
                  <p className="muted">{result.autonomousAcademicOS.researchPlanner.plannerBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel scholarly-reasoning-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Scholarly Reasoning</p>
                      <h2>학술 추론 패널</h2>
                    </div>
                    <Brain size={22} />
                  </div>
                  <div className="reasoning-grid">
                    <div>
                      <h3>이론 비교</h3>
                      <ul className="plain-list">
                        {result.autonomousAcademicOS.scholarlyReasoning.competingTheoryEvaluation.slice(0, 4).map((item, index) => (
                          <li key={`reasoning-theory-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>방법론 트레이드오프</h3>
                      <ul className="plain-list">
                        {result.autonomousAcademicOS.scholarlyReasoning.methodologyTradeoffAnalysis.slice(0, 4).map((item, index) => (
                          <li key={`reasoning-method-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>논쟁/모순 해소</h3>
                      <ul className="plain-list">
                        {result.autonomousAcademicOS.scholarlyReasoning.contradictionResolutionWorkflow.slice(0, 4).map((item, index) => (
                          <li key={`reasoning-debate-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.autonomousAcademicOS.scholarlyReasoning.reasoningBoundary}</p>
                </section>

                <section className="panel os-workspace-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Workspace</p>
                      <h2>워크스페이스 / 버전 추적</h2>
                    </div>
                    <Users size={22} />
                  </div>
                  <strong>{topicShortTitle(result.autonomousAcademicOS.workspaceCollaboration.projectTitle)}</strong>
                  <div className="version-list">
                    {result.autonomousAcademicOS.workspaceCollaboration.proposalVersions.map((version) => (
                      <article key={`proposal-version-${version.version}`}>
                        <span>{version.version}</span>
                        <strong>{topicShortTitle(version.title)}</strong>
                        <p>{version.changeSummary}</p>
                      </article>
                    ))}
                  </div>
                  <div className="chips">
                    {result.autonomousAcademicOS.workspaceCollaboration.exportableDossierSections.map((section) => (
                      <span key={`dossier-${section}`}>{section}</span>
                    ))}
                  </div>
                  <p className="muted">{result.autonomousAcademicOS.workspaceCollaboration.persistenceBoundary}</p>
                </section>
              </section>

              <section className="panel os-optimization-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Adaptive Optimization</p>
                    <h2>최적화 컨트롤</h2>
                  </div>
                  <ShieldCheck size={22} />
                </div>
                <div className="os-control-grid">
                  {result.autonomousAcademicOS.optimizationControls.map((control) => (
                    <article key={`os-control-${control.objective}`}>
                      <span>우선순위 {control.priority}</span>
                      <strong>{control.objective.replaceAll("_", " ")}</strong>
                      <p>{control.recommendedMove}</p>
                      <em>{control.expectedTradeoff}</em>
                      <small>{control.evidence}</small>
                    </article>
                  ))}
                </div>
              </section>

              <section className="split wide-left">
                <section className="panel evolving-ecosystem-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Self-Evolving Ecosystem</p>
                      <h2>라이브 학술 생태계 대시보드</h2>
                    </div>
                    <Compass size={22} />
                  </div>
                  <div className="domain-grid">
                    <div>
                      <span>학습 단계</span>
                      <strong>{result.selfEvolvingAcademicEcosystem.continuousLearning.ingestionWorkflow.length}</strong>
                    </div>
                    <div>
                      <span>동적 관계</span>
                      <strong>{result.selfEvolvingAcademicEcosystem.continuousLearning.theoryRelationshipUpdates.length}</strong>
                    </div>
                    <div>
                      <span>그래프 노드</span>
                      <strong>{result.selfEvolvingAcademicEcosystem.selfEvolvingKnowledgeGraph.ecosystemNodes.length}</strong>
                    </div>
                    <div>
                      <span>모니터링 피드</span>
                      <strong>{result.selfEvolvingAcademicEcosystem.ecosystemMonitoringFeeds.length}</strong>
                    </div>
                  </div>
                  <div className="learning-workflow-grid">
                    {result.selfEvolvingAcademicEcosystem.continuousLearning.ingestionWorkflow.map((step) => (
                      <article key={`learning-step-${step.step}`}>
                        <span>{step.status}</span>
                        <strong>{step.step.replaceAll("_", " ")}</strong>
                        <p>{step.evidence}</p>
                        <em>{step.nextAction}</em>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfEvolvingAcademicEcosystem.ecosystemBoundary}</p>
                </section>

                <section className="panel ecosystem-feed-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Monitoring Feed</p>
                      <h2>생태계 모니터링</h2>
                    </div>
                    <BarChart3 size={22} />
                  </div>
                  <div className="ecosystem-feed-list">
                    {result.selfEvolvingAcademicEcosystem.ecosystemMonitoringFeeds.slice(0, 8).map((feed) => (
                      <article key={`ecosystem-feed-${feed.type}-${feed.label}`}>
                        <span>{feed.type.replaceAll("_", " ")} · {feed.priority}</span>
                        <strong>{feed.label}</strong>
                        <p>{feed.generatedInterpretation}</p>
                        <small>{feed.evidence}</small>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel evolving-graph-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Evolving Knowledge Graph</p>
                      <h2>진화형 지식 그래프</h2>
                    </div>
                    <Network size={22} />
                  </div>
                  <p>{result.selfEvolvingAcademicEcosystem.selfEvolvingKnowledgeGraph.graphEvolutionSummary}</p>
                  <div className="relationship-update-grid">
                    {result.selfEvolvingAcademicEcosystem.selfEvolvingKnowledgeGraph.dynamicRelationshipUpdates.slice(0, 6).map((edge) => (
                      <article key={`evolving-edge-${edge.source}-${edge.target}`}>
                        <strong>{edge.source} → {edge.target}</strong>
                        <span>{edge.previousSignal} · {edge.updatedSignal}</span>
                        <p>{edge.evidence}</p>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">숨은 개념 발견</h3>
                  <div className="timeline-list">
                    {result.selfEvolvingAcademicEcosystem.selfEvolvingKnowledgeGraph.hiddenConceptDiscovery.slice(0, 4).map((path) => (
                      <article key={`hidden-concept-${path.path.join("-")}`}>
                        <strong>{path.path.join(" → ")}</strong>
                        <span>{confidenceLabels[path.confidence]} · {path.evidence}</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfEvolvingAcademicEcosystem.selfEvolvingKnowledgeGraph.graphBoundary}</p>
                </section>

                <section className="panel benchmark-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Research Benchmarking</p>
                      <h2>연구 벤치마킹</h2>
                    </div>
                    <Scale size={22} />
                  </div>
                  <div className="benchmark-list">
                    {result.selfEvolvingAcademicEcosystem.researchBenchmarking.slice(0, 3).map((benchmark) => (
                      <article key={`benchmark-${benchmark.topicTitle}`}>
                        <div>
                          <strong>{topicShortTitle(benchmark.topicTitle)}</strong>
                          <span>종합 {benchmark.overallBenchmark}/10</span>
                        </div>
                        <p>문헌 {benchmark.literatureDensity} · 방법론 {benchmark.methodologicalRigorNormFit} · 저널 기대 {benchmark.journalExpectationFit}</p>
                        <small>{benchmark.evidence}</small>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel agent-coordination-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Adaptive Agent Coordination</p>
                      <h2>에이전트 토론 / 개선 루프</h2>
                    </div>
                    <MessageSquare size={22} />
                  </div>
                  <div className="map-grid">
                    <div>
                      <h3>이론 토론</h3>
                      <ul className="plain-list">
                        {result.selfEvolvingAcademicEcosystem.adaptiveAgentCoordination.theoryDebates.slice(0, 3).map((debate, index) => (
                          <li key={`theory-debate-${index}-${debate.positionA}`}>{debate.positionA} vs {debate.positionB}: {debate.resolution}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>방법론 비교</h3>
                      <ul className="plain-list">
                        {result.selfEvolvingAcademicEcosystem.adaptiveAgentCoordination.methodologyComparisons.slice(0, 3).map((comparison) => (
                          <li key={`method-compare-${comparison.methodA}-${comparison.methodB}`}>{comparison.methodA} / {comparison.methodB}: {comparison.recommendation}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>반복 개선</h3>
                      <ul className="plain-list">
                        {result.selfEvolvingAcademicEcosystem.adaptiveAgentCoordination.iterativePlanImprovements.slice(0, 4).map((item, index) => (
                          <li key={`iterative-improvement-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.selfEvolvingAcademicEcosystem.adaptiveAgentCoordination.coordinationBoundary}</p>
                </section>

                <section className="panel ecosystem-workspace-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Collaborative Research Hub</p>
                      <h2>협업 워크스페이스 생태계</h2>
                    </div>
                    <Users size={22} />
                  </div>
                  <p>{result.selfEvolvingAcademicEcosystem.advancedWorkspaceEcosystem.persistentWorkspaceStatus}</p>
                  <div className="chips">
                    {result.selfEvolvingAcademicEcosystem.advancedWorkspaceEcosystem.teamCollaborationHub.map((member) => (
                      <span key={`ecosystem-collab-${member}`}>{member}</span>
                    ))}
                  </div>
                  <h3 className="subsection-title">장기 연구 궤적</h3>
                  <div className="timeline-list">
                    {result.selfEvolvingAcademicEcosystem.longTermTrajectoryViews.slice(0, 4).map((view) => (
                      <article key={`trajectory-${view.trajectory}`}>
                        <strong>{view.trajectory}</strong>
                        <span>{topicShortTitle(view.currentPosition)}</span>
                        <p>{view.nextMilestones.join(" → ")}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfEvolvingAcademicEcosystem.advancedWorkspaceEcosystem.workspaceBoundary}</p>
                </section>
              </section>

              <section className="panel institutional-ecosystem-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Institutional & Team Intelligence</p>
                    <h2>기관 규모 연구 인텔리전스</h2>
                  </div>
                  <Building2 size={22} />
                </div>
                <div className="map-grid">
                  <div>
                    <h3>학과 프로필</h3>
                    <ul className="plain-list">
                      {result.selfEvolvingAcademicEcosystem.institutionalTeamIntelligence.departmentResearchProfiling.slice(0, 5).map((item) => (
                        <li key={`ecosystem-dept-${item.area}`}>{item.area} · {item.paperCount}편</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>연구실/그룹 정렬</h3>
                    <ul className="plain-list">
                      {result.selfEvolvingAcademicEcosystem.institutionalTeamIntelligence.labGroupCollaborationMapping.slice(0, 5).map((item) => (
                        <li key={`ecosystem-lab-${item.group}`}>{item.group}: {item.alignment}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>협업 기회</h3>
                    <ul className="plain-list">
                      {result.selfEvolvingAcademicEcosystem.institutionalTeamIntelligence.collaborationOpportunityDiscovery.slice(0, 5).map((item) => (
                        <li key={`ecosystem-opportunity-${item.source}-${item.target}`}>{item.source} ↔ {item.target}: {item.opportunity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="muted">{result.selfEvolvingAcademicEcosystem.institutionalTeamIntelligence.institutionalBoundary}</p>
              </section>

              <section className="split wide-left">
                <section className="panel global-network-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Global Scholarly Network</p>
                      <h2>글로벌 학술 생태계 인텔리전스</h2>
                    </div>
                    <Network size={22} />
                  </div>
                  <div className="domain-grid">
                    <div>
                      <span>자기평가</span>
                      <strong>{result.globalAutonomousScholarlyNetwork.selfEvaluationWorkflows.length}</strong>
                    </div>
                    <div>
                      <span>약신호</span>
                      <strong>{result.globalAutonomousScholarlyNetwork.advancedSignalDetection.weakSignals.length}</strong>
                    </div>
                    <div>
                      <span>전략</span>
                      <strong>{result.globalAutonomousScholarlyNetwork.autonomousResearchStrategies.length}</strong>
                    </div>
                    <div>
                      <span>QA 체크</span>
                      <strong>{result.globalAutonomousScholarlyNetwork.researchQualityAssurance.citationConsistencyChecks.length}</strong>
                    </div>
                  </div>
                  <div className="global-ecosystem-grid">
                    {result.globalAutonomousScholarlyNetwork.globalAcademicEcosystemIntelligence.disciplineEcosystems.slice(0, 5).map((item) => (
                      <article key={`global-discipline-${item.discipline}`}>
                        <strong>{item.discipline}</strong>
                        <p>{item.signal}</p>
                        <small>{item.evidence}</small>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.globalAutonomousScholarlyNetwork.networkBoundary}</p>
                </section>

                <section className="panel research-qa-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Research QA</p>
                      <h2>품질 / 신뢰도 패널</h2>
                    </div>
                    <ShieldCheck size={22} />
                  </div>
                  <div className="qa-list">
                    {result.globalAutonomousScholarlyNetwork.researchQualityAssurance.evidenceConfidenceEstimates.slice(0, 4).map((item) => (
                      <article key={`qa-confidence-${item.target}`}>
                        <span>{confidenceLabels[item.confidence]}</span>
                        <strong>{topicShortTitle(item.target)}</strong>
                        <p>{item.evidence}</p>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">환각/비근거 위험</h3>
                  <div className="qa-list compact">
                    {result.globalAutonomousScholarlyNetwork.researchQualityAssurance.hallucinationRiskFlags.slice(0, 4).map((item) => (
                      <article key={`qa-risk-${item.target}`}>
                        <span>{item.risk}</span>
                        <strong>{topicShortTitle(item.target)}</strong>
                        <p>{item.reason}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.globalAutonomousScholarlyNetwork.researchQualityAssurance.qaBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel self-evaluation-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Self-Evaluating Intelligence</p>
                      <h2>연구 아이디어 자기평가</h2>
                    </div>
                    <Target size={22} />
                  </div>
                  <div className="self-eval-grid">
                    {result.globalAutonomousScholarlyNetwork.selfEvaluationWorkflows.slice(0, 3).map((evaluation) => (
                      <article key={`self-eval-${evaluation.topicTitle}`}>
                        <div>
                          <strong>{topicShortTitle(evaluation.topicTitle)}</strong>
                          <span>품질 {evaluation.qualityScore}/10 · 근거 {evaluation.evidenceCoverage}/10</span>
                        </div>
                        <p>{evaluation.methodologyCritique}</p>
                        <ul className="plain-list">
                          {evaluation.autonomousImprovementActions.slice(0, 3).map((action) => (
                            <li key={`self-eval-action-${evaluation.topicTitle}-${action}`}>{action}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel signal-map-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Scholarly Signal Map</p>
                      <h2>약신호 / 미래 기회 탐지</h2>
                    </div>
                    <Sparkles size={22} />
                  </div>
                  <div className="signal-list">
                    {[
                      ...result.globalAutonomousScholarlyNetwork.advancedSignalDetection.weakSignals,
                      ...result.globalAutonomousScholarlyNetwork.advancedSignalDetection.futureHighImpactDomains
                    ].slice(0, 8).map((signal) => (
                      <article key={`signal-${signal.type}-${signal.label}`}>
                        <span>{signal.type.replaceAll("_", " ")}</span>
                        <strong>{signal.label}</strong>
                        <p>{signal.generatedInterpretation}</p>
                        <small>{signal.evidence}</small>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.globalAutonomousScholarlyNetwork.advancedSignalDetection.signalBoundary}</p>
                </section>
              </section>

              <section className="split">
                <section className="panel strategy-network-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Strategy Engine</p>
                      <h2>대상별 연구 전략</h2>
                    </div>
                    <Rocket size={22} />
                  </div>
                  <div className="strategy-card-grid">
                    {result.globalAutonomousScholarlyNetwork.autonomousResearchStrategies.map((strategy) => (
                      <article key={`global-strategy-${strategy.audience}`}>
                        <span>{strategy.audience.replaceAll("_", " ")}</span>
                        <strong>{strategy.strategyTitle}</strong>
                        <ul className="plain-list">
                          {strategy.recommendedMoves.slice(0, 3).map((move) => (
                            <li key={`strategy-move-${strategy.audience}-${move}`}>{move}</li>
                          ))}
                        </ul>
                        <small>{strategy.evidence}</small>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel evolution-network-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Scholarly Evolution</p>
                      <h2>장기 연구 진화 타임라인</h2>
                    </div>
                    <GitFork size={22} />
                  </div>
                  <div className="timeline-list">
                    {[
                      ...result.globalAutonomousScholarlyNetwork.autonomousScholarlyEvolution.forecastingLogicAdaptations,
                      ...result.globalAutonomousScholarlyNetwork.autonomousScholarlyEvolution.longTermRecommendationOptimizations
                    ].slice(0, 8).map((item, index) => (
                      <article key={`network-evolution-${index}-${item.slice(0, 28)}`}>
                        <strong>{index + 1}. evolution update</strong>
                        <span>{item}</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.globalAutonomousScholarlyNetwork.autonomousScholarlyEvolution.evolutionBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel trusted-reasoning-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Trusted Reasoning</p>
                      <h2>추론 경로 탐색기</h2>
                    </div>
                    <Search size={22} />
                  </div>
                  <div className="trace-grid">
                    {result.trustedAcademicIntelligenceInfrastructure.reasoningTraces.slice(0, 6).map((trace) => (
                      <article key={`trace-${trace.id}`}>
                        <span>{trace.targetType} · 신뢰 {trace.confidenceScore}/10</span>
                        <strong>{topicShortTitle(trace.target)}</strong>
                        <p>{trace.evidencePathSummary}</p>
                        <div className="trace-steps">
                          {trace.traceSteps.slice(0, 3).map((step) => (
                            <em key={`trace-step-${trace.id}-${step.step}`}>{step.step.replaceAll("_", " ")} · {confidenceLabels[step.confidence]}</em>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.trustedAcademicIntelligenceInfrastructure.trustBoundary}</p>
                </section>

                <section className="panel evidence-lineage-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Evidence Lineage</p>
                      <h2>근거 계보</h2>
                    </div>
                    <BookOpen size={22} />
                  </div>
                  <div className="lineage-list">
                    {result.trustedAcademicIntelligenceInfrastructure.evidenceLineageViews.slice(0, 5).map((trace) => (
                      <article key={`lineage-${trace.id}`}>
                        <strong>{topicShortTitle(trace.target)}</strong>
                        <span>{trace.supportingPapers.length} papers · {trace.supportingTheories.slice(0, 3).join(", ") || "theory signal 부족"}</span>
                        <ul className="plain-list">
                          {trace.supportingPapers.slice(0, 2).map((paper) => (
                            <li key={`lineage-paper-${trace.id}-${paper.id}`}>{paper.title} ({paper.year ?? "n.d."})</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel governance-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Governance Reliability</p>
                      <h2>거버넌스 / 위험 패널</h2>
                    </div>
                    <ShieldCheck size={22} />
                  </div>
                  <div className="governance-grid">
                    <div>
                      <h3>환각 위험</h3>
                      <ul className="plain-list">
                        {result.trustedAcademicIntelligenceInfrastructure.governanceReliability.hallucinationDetection.slice(0, 4).map((item) => (
                          <li key={`trusted-hallucination-${item.target}`}>{topicShortTitle(item.target)} · {item.risk}: {item.reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>인용 일관성</h3>
                      <ul className="plain-list">
                        {result.trustedAcademicIntelligenceInfrastructure.governanceReliability.citationConsistencyValidation.slice(0, 4).map((item, index) => (
                          <li key={`trusted-citation-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>모순 인식</h3>
                      <ul className="plain-list">
                        {result.trustedAcademicIntelligenceInfrastructure.governanceReliability.contradictionAwareness.slice(0, 4).map((item, index) => (
                          <li key={`trusted-contradiction-${index}-${item.slice(0, 28)}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.trustedAcademicIntelligenceInfrastructure.governanceReliability.governanceBoundary}</p>
                </section>

                <section className="panel transparent-decision-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Transparent Decisions</p>
                      <h2>AI 의사결정 설명</h2>
                    </div>
                    <Brain size={22} />
                  </div>
                  <div className="decision-list">
                    {result.trustedAcademicIntelligenceInfrastructure.transparentDecisions.slice(0, 8).map((decision) => (
                      <article key={`transparent-decision-${decision.decisionType}-${decision.decision}`}>
                        <span>{decision.decisionType.replaceAll("_", " ")} · {confidenceLabels[decision.confidence]}</span>
                        <strong>{topicShortTitle(decision.decision)}</strong>
                        <p>{decision.why}</p>
                        <small>근거 {decision.evidenceInfluence.length}개 · trace {decision.relatedTraceIds.join(", ") || "직접 trace 없음"}</small>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel audit-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Audit</p>
                      <h2>연구 감사 엔진</h2>
                    </div>
                    <ClipboardList size={22} />
                  </div>
                  <div className="audit-grid">
                    {result.trustedAcademicIntelligenceInfrastructure.autonomousResearchAudits.slice(0, 4).map((audit) => (
                      <article key={`audit-${audit.auditId}`}>
                        <strong>{topicShortTitle(audit.target)}</strong>
                        <div className="audit-scores">
                          <span>이론 {audit.theoryCoherence}</span>
                          <span>근거 {audit.evidenceStrength}</span>
                          <span>방법 {audit.methodologyValidity}</span>
                          <span>출판 {audit.publicationFeasibility}</span>
                        </div>
                        <p>{audit.findings.slice(0, 2).join(" ")}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel human-review-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Human-in-the-Loop</p>
                      <h2>협업 리뷰 / 승인 워크플로</h2>
                    </div>
                    <Users size={22} />
                  </div>
                  <div className="timeline-list">
                    {result.trustedAcademicIntelligenceInfrastructure.humanInTheLoop.collaborativeReviewQueue.map((item) => (
                      <article key={`review-queue-${item.reviewerRole}-${item.item}`}>
                        <strong>{item.reviewerRole.replaceAll("_", " ")}</strong>
                        <span>{item.item}</span>
                        <p>{item.requestedAction}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.trustedAcademicIntelligenceInfrastructure.humanInTheLoop.reviewBoundary}</p>
                </section>
              </section>

              <section className="panel infrastructure-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Scalable Research Governance</p>
                    <h2>대규모 학술 인프라 설계</h2>
                  </div>
                  <Building2 size={22} />
                </div>
                <div className="map-grid">
                  <div>
                    <h3>수집 파이프라인</h3>
                    <ul className="plain-list">
                      {result.trustedAcademicIntelligenceInfrastructure.scalableInfrastructure.ingestionPipelinePlan.map((item) => (
                        <li key={`infra-ingestion-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>역할 기반 환경</h3>
                    <ul className="plain-list">
                      {result.trustedAcademicIntelligenceInfrastructure.scalableInfrastructure.roleBasedEnvironments.map((role) => (
                        <li key={`infra-role-${role.role}`}>{role.role}: {role.permissions.slice(0, 2).join(", ")}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>장기 지속성</h3>
                    <ul className="plain-list">
                      {result.trustedAcademicIntelligenceInfrastructure.scalableInfrastructure.longTermPersistencePlan.map((item) => (
                        <li key={`infra-persistence-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="muted">{result.trustedAcademicIntelligenceInfrastructure.scalableInfrastructure.infrastructureBoundary}</p>
              </section>

              <section className="panel workflow-copilot-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Full Research Workflow Copilot</p>
                    <h2>연구 실행 대시보드</h2>
                  </div>
                  <ClipboardList size={22} />
                </div>
                <div className="workflow-metric-grid">
                  <article>
                    <span>도구 초안</span>
                    <strong>{result.researchWorkflowCopilot.instrumentPackage.surveyQuestionnaireDraft.length}</strong>
                    <p>설문 구성개념</p>
                  </article>
                  <article>
                    <span>분석 코드</span>
                    <strong>{result.researchWorkflowCopilot.codeTemplates.length}</strong>
                    <p>재사용 템플릿</p>
                  </article>
                  <article>
                    <span>재현성</span>
                    <strong>{result.researchWorkflowCopilot.reproducibilityLayer.reproducibilityChecklist.length}</strong>
                    <p>체크 항목</p>
                  </article>
                  <article>
                    <span>연동</span>
                    <strong>6</strong>
                    <p>Zotero / Overleaf / Notion 등</p>
                  </article>
                </div>
                <p className="muted">{result.researchWorkflowCopilot.workflowBoundary}</p>
              </section>

              <section className="split wide-left">
                <section className="panel instrument-builder-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Instrument Builder</p>
                      <h2>연구도구 생성기</h2>
                    </div>
                    <FileText size={22} />
                  </div>
                  <div className="instrument-grid">
                    {result.researchWorkflowCopilot.instrumentPackage.surveyQuestionnaireDraft.slice(0, 4).map((instrument) => (
                      <article key={`survey-${instrument.construct}`}>
                        <span>{instrument.responseScale}</span>
                        <strong>{instrument.construct}</strong>
                        <ul className="plain-list">
                          {instrument.items.map((item) => (
                            <li key={`survey-item-${instrument.construct}-${item}`}>{item}</li>
                          ))}
                        </ul>
                        <small>{instrument.evidence}</small>
                      </article>
                    ))}
                  </div>
                  <div className="protocol-grid">
                    <div>
                      <h3>인터뷰 프로토콜</h3>
                      <ul className="plain-list">
                        {result.researchWorkflowCopilot.instrumentPackage.interviewProtocol.map((item) => (
                          <li key={`interview-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>포커스 그룹 / 관찰</h3>
                      <ul className="plain-list">
                        {[...result.researchWorkflowCopilot.instrumentPackage.focusGroupGuide.slice(0, 3), ...result.researchWorkflowCopilot.instrumentPackage.observationFramework.slice(0, 3)].map((item) => (
                          <li key={`field-guide-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.researchWorkflowCopilot.instrumentPackage.instrumentBoundary}</p>
                </section>

                <section className="panel stat-workflow-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Statistical Workflow</p>
                      <h2>통계 / 분석 워크플로</h2>
                    </div>
                    <BarChart3 size={22} />
                  </div>
                  <div className="method-chip-list">
                    {result.researchWorkflowCopilot.statisticalWorkflow.recommendedStatisticalMethods.map((method) => (
                      <span key={`workflow-method-${method}`}>{method}</span>
                    ))}
                  </div>
                  <ol className="workflow-step-list">
                    {result.researchWorkflowCopilot.statisticalWorkflow.analysisPipeline.map((step) => (
                      <li key={`analysis-step-${step}`}>{step}</li>
                    ))}
                  </ol>
                  <div className="variable-grid">
                    {result.researchWorkflowCopilot.statisticalWorkflow.variableOperationalization.slice(0, 4).map((item) => (
                      <article key={`operational-${item.variable}`}>
                        <strong>{item.variable}</strong>
                        <p>{item.operationalDefinition}</p>
                        <small>{item.measurementSuggestion}</small>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.researchWorkflowCopilot.statisticalWorkflow.workflowBoundary}</p>
                </section>
              </section>

              <section className="panel code-workspace-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Code Generation Workspace</p>
                    <h2>분석 코드 생성 워크스페이스</h2>
                  </div>
                  <FileText size={22} />
                </div>
                <div className="code-template-list">
                  {result.researchWorkflowCopilot.codeTemplates.map((template) => (
                    <details key={`code-template-${template.language}-${template.workflow}-${template.title}`}>
                      <summary>{template.language} · {template.workflow} · {template.title}</summary>
                      <pre>{template.code}</pre>
                      <ul className="plain-list">
                        {template.notes.map((note) => (
                          <li key={`code-note-${template.title}-${note}`}>{note}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>

              <section className="split">
                <section className="panel execution-plan-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Execution Planning</p>
                      <h2>실행 계획 / 일정</h2>
                    </div>
                    <Target size={22} />
                  </div>
                  <ol className="workflow-step-list">
                    {result.researchWorkflowCopilot.executionPlan.stepByStepPlan.slice(0, 8).map((step) => (
                      <li key={`execution-step-${step}`}>{step}</li>
                    ))}
                  </ol>
                  <div className="timeline-list compact">
                    {result.researchWorkflowCopilot.executionPlan.dataCollectionTimeline.map((phase) => (
                      <article key={`timeline-${phase.phase}`}>
                        <strong>{phase.phase}</strong>
                        <span>{phase.duration}</span>
                        <p>{phase.deliverable}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel writing-workflow-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Academic Writing</p>
                      <h2>논문 작성 보조</h2>
                    </div>
                    <BookOpen size={22} />
                  </div>
                  <ul className="plain-list">
                    {result.researchWorkflowCopilot.academicWritingWorkflow.publicationReadyOutline.slice(0, 7).map((item) => (
                      <li key={`writing-outline-${item}`}>{item}</li>
                    ))}
                  </ul>
                  <p>{result.researchWorkflowCopilot.academicWritingWorkflow.discussionConclusionDraft}</p>
                  <p className="muted">{result.researchWorkflowCopilot.academicWritingWorkflow.writingBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel reproducibility-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Reproducibility Layer</p>
                      <h2>재현성 / 감사 패널</h2>
                    </div>
                    <ShieldCheck size={22} />
                  </div>
                  <div className="governance-grid">
                    <div>
                      <h3>체크리스트</h3>
                      <ul className="plain-list">
                        {result.researchWorkflowCopilot.reproducibilityLayer.reproducibilityChecklist.slice(0, 6).map((item) => (
                          <li key={`repro-check-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>누락 변수 점검</h3>
                      <ul className="plain-list">
                        {result.researchWorkflowCopilot.reproducibilityLayer.missingVariableDetection.slice(0, 5).map((item) => (
                          <li key={`missing-variable-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>감사 경로</h3>
                      <ul className="plain-list">
                        {result.researchWorkflowCopilot.reproducibilityLayer.workflowAuditTrail.map((item) => (
                          <li key={`audit-trail-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.researchWorkflowCopilot.reproducibilityLayer.reproducibilityBoundary}</p>
                </section>

                <section className="panel external-integration-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Workflow Connectivity</p>
                      <h2>외부 워크플로 연동</h2>
                    </div>
                    <Download size={22} />
                  </div>
                  <div className="integration-grid">
                    {Object.entries(result.researchWorkflowCopilot.externalIntegrations)
                      .filter(([key]) => key !== "integrationBoundary")
                      .map(([key, items]) => (
                        <article key={`integration-${key}`}>
                          <strong>{key}</strong>
                          <ul className="plain-list">
                            {(items as string[]).slice(0, 3).map((item) => (
                              <li key={`integration-${key}-${item}`}>{item}</li>
                            ))}
                          </ul>
                        </article>
                      ))}
                  </div>
                  <p className="muted">{result.researchWorkflowCopilot.externalIntegrations.integrationBoundary}</p>
                </section>
              </section>

              <section className="panel scholarly-collaboration-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Scholarly Collaboration Platform</p>
                    <h2>협업 / 심사 / 출판 준비 대시보드</h2>
                  </div>
                  <Users size={22} />
                </div>
                <div className="workflow-metric-grid">
                  <article>
                    <span>피어리뷰 시뮬레이션</span>
                    <strong>{result.scholarlyCollaborationPlatform.peerReviewSimulations.length}</strong>
                    <p>harsh / constructive / journal style</p>
                  </article>
                  <article>
                    <span>출판 최적화</span>
                    <strong>{result.scholarlyCollaborationPlatform.publicationOptimization.length}</strong>
                    <p>검색 출처 기반 후보</p>
                  </article>
                  <article>
                    <span>협업 역할</span>
                    <strong>{result.scholarlyCollaborationPlatform.collaborativeWorkspace.projectRoles.length}</strong>
                    <p>학생 / 지도교수 / 공저자 등</p>
                  </article>
                  <article>
                    <span>라이프사이클</span>
                    <strong>{result.scholarlyCollaborationPlatform.lifecycleManagement.stages.length}</strong>
                    <p>아이디어부터 수정까지</p>
                  </article>
                </div>
                <p className="muted">{result.scholarlyCollaborationPlatform.platformBoundary}</p>
              </section>

              <section className="split wide-left">
                <section className="panel peer-review-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">AI Peer Review Simulation</p>
                      <h2>피어리뷰 시뮬레이션</h2>
                    </div>
                    <MessageSquare size={22} />
                  </div>
                  <div className="reviewer-grid">
                    {result.scholarlyCollaborationPlatform.peerReviewSimulations.slice(0, 6).map((review) => (
                      <article key={`peer-review-${review.reviewerMode}-${review.targetTitle}`}>
                        <span>{review.reviewerMode.replaceAll("_", " ")} · readiness {review.publicationReadinessScore}/10</span>
                        <strong>{topicShortTitle(review.targetTitle)}</strong>
                        <p>{review.noveltyContributionAssessment}</p>
                        <ul className="plain-list">
                          {review.reviewerStyleFeedback.slice(0, 2).map((item) => (
                            <li key={`review-feedback-${review.reviewerMode}-${item}`}>{item}</li>
                          ))}
                        </ul>
                        <small>{review.simulationBoundary}</small>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel publication-optimization-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Publication Optimization</p>
                      <h2>출판 최적화 엔진</h2>
                    </div>
                    <Rocket size={22} />
                  </div>
                  <div className="publication-fit-list">
                    {result.scholarlyCollaborationPlatform.publicationOptimization.map((plan) => (
                      <article key={`pub-opt-${plan.targetVenue}`}>
                        <strong>{plan.targetVenue}</strong>
                        <p>{plan.venueEvidence}</p>
                        <ul className="plain-list">
                          {[...plan.methodologicalAlignment.slice(0, 2), ...plan.contributionFraming.slice(0, 2)].map((item) => (
                            <li key={`pub-opt-item-${plan.targetVenue}-${item}`}>{item}</li>
                          ))}
                        </ul>
                        <small>{plan.optimizationBoundary}</small>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel collaborative-workspace-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Collaborative Workspace</p>
                      <h2>공동 원고 워크스페이스</h2>
                    </div>
                    <Users size={22} />
                  </div>
                  <div className="role-grid">
                    {result.scholarlyCollaborationPlatform.collaborativeWorkspace.projectRoles.map((role) => (
                      <article key={`collab-role-${role.role}`}>
                        <strong>{role.role}</strong>
                        <p>{role.permissions.slice(0, 3).join(" · ")}</p>
                      </article>
                    ))}
                  </div>
                  <div className="timeline-list compact">
                    {result.scholarlyCollaborationPlatform.collaborativeWorkspace.versionComparison.map((version) => (
                      <article key={`version-${version.version}`}>
                        <strong>{version.version}</strong>
                        <span>{version.reviewStatus.replaceAll("_", " ")}</span>
                        <p>{version.changeSummary}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.scholarlyCollaborationPlatform.collaborativeWorkspace.collaborationBoundary}</p>
                </section>

                <section className="panel revision-intelligence-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Writing & Revision</p>
                      <h2>수정 / 답변 지능</h2>
                    </div>
                    <FileText size={22} />
                  </div>
                  <ul className="plain-list">
                    {[
                      ...result.scholarlyCollaborationPlatform.revisionIntelligence.revisionSuggestions.slice(0, 3),
                      ...result.scholarlyCollaborationPlatform.revisionIntelligence.clarityImprovements.slice(0, 3)
                    ].map((item) => (
                      <li key={`revision-item-${item}`}>{item}</li>
                    ))}
                  </ul>
                  <div className="draft-box">
                    <strong>Rebuttal draft boundary</strong>
                    <p>{result.scholarlyCollaborationPlatform.revisionIntelligence.rebuttalLetterDraft}</p>
                  </div>
                  <p className="muted">{result.scholarlyCollaborationPlatform.revisionIntelligence.writingBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel lifecycle-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Lifecycle Management</p>
                      <h2>연구 생애주기 타임라인</h2>
                    </div>
                    <ClipboardList size={22} />
                  </div>
                  <div className="lifecycle-list">
                    {result.scholarlyCollaborationPlatform.lifecycleManagement.stages.map((stage) => (
                      <article key={`lifecycle-${stage.stage}`}>
                        <span>{stage.status.replaceAll("_", " ")}</span>
                        <strong>{stage.stage.replaceAll("_", " ")}</strong>
                        <p>{stage.milestone}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.scholarlyCollaborationPlatform.lifecycleManagement.lifecycleBoundary}</p>
                </section>

                <section className="panel benchmarking-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Academic Benchmarking</p>
                      <h2>벤치마킹 비교</h2>
                    </div>
                    <Scale size={22} />
                  </div>
                  <div className="benchmark-grid">
                    {result.scholarlyCollaborationPlatform.benchmarkingIntelligence.topPaperComparisons.slice(0, 4).map((item) => (
                      <article key={`benchmark-paper-${item.retrievedPaperTitle}`}>
                        <strong>{topicShortTitle(item.retrievedPaperTitle)}</strong>
                        <span>{item.comparisonSignal}</span>
                        <p>{item.evidence}</p>
                      </article>
                    ))}
                  </div>
                  <ul className="plain-list">
                    {result.scholarlyCollaborationPlatform.benchmarkingIntelligence.methodologicalNorms.slice(0, 4).map((item) => (
                      <li key={`method-norm-${item}`}>{item}</li>
                    ))}
                  </ul>
                  <p className="muted">{result.scholarlyCollaborationPlatform.benchmarkingIntelligence.benchmarkBoundary}</p>
                </section>
              </section>

              <section className="panel academic-connectivity-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Academic Workflow Integrations</p>
                    <h2>외부 학술 워크플로 연결</h2>
                  </div>
                  <Download size={22} />
                </div>
                <div className="integration-grid">
                  {Object.entries(result.scholarlyCollaborationPlatform.workflowConnectivity)
                    .filter(([key]) => key !== "connectivityBoundary")
                    .map(([key, items]) => (
                      <article key={`academic-connectivity-${key}`}>
                        <strong>{key}</strong>
                        <ul className="plain-list">
                          {(items as string[]).slice(0, 3).map((item) => (
                            <li key={`academic-connectivity-${key}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                </div>
                <p className="muted">{result.scholarlyCollaborationPlatform.workflowConnectivity.connectivityBoundary}</p>
              </section>

              <section className="split wide-left">
                <section className="panel refinement-loop-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Agentic Self-Improving Loop</p>
                      <h2>토픽 비평 → 개선 → 재점수화</h2>
                    </div>
                    <Wand2 size={22} />
                  </div>
                  <div className="loop-steps">
                    {result.agenticResearchLoop.workflow.map((step) => (
                      <article key={`loop-step-${step.iteration}-${step.stage}`}>
                        <span>{step.iteration}</span>
                        <strong>{step.stage}</strong>
                        <p>{step.summary}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.agenticResearchLoop.loopBoundary}</p>
                </section>
                <section className="panel rerank-panel">
                  <p className="tag">Re-ranked Topics</p>
                  <h2>개선 후 재정렬</h2>
                  <div className="rank-list compact">
                    {result.agenticResearchLoop.rerankedTopics.map((item) => (
                      <article key={`rerank-${item.rank}-${item.title}`}>
                        <strong>{item.rank}. {topicShortTitle(item.title)}</strong>
                        <span>종합 {item.overallScore}/10</span>
                        <p>{item.rationale}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="panel topic-refinement-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Before / After Comparison</p>
                    <h2>토픽 개선 비교</h2>
                  </div>
                  <Scale size={22} />
                </div>
                <div className="refinement-grid">
                  {result.agenticResearchLoop.topicRefinements.map((item) => (
                    <article key={item.topicId}>
                      <div className="before-after">
                        <div>
                          <span>Before</span>
                          <strong>{topicShortTitle(item.initialTopic.title)}</strong>
                          <p>{item.initialTopic.researchQuestion}</p>
                        </div>
                        <div>
                          <span>After</span>
                          <strong>{topicShortTitle(item.improvedTopic.title)}</strong>
                          <p>{item.improvedTopic.researchQuestion}</p>
                        </div>
                      </div>
                      <div className="critique-list">
                        {item.critiques.map((critique) => (
                          <div key={`${item.topicId}-${critique.type}`}>
                            <strong>{critiqueLabels[critique.type]} · {confidenceLabels[critique.severity]}</strong>
                            <p>{critique.critique}</p>
                            <span>{critique.evidence}</span>
                          </div>
                        ))}
                      </div>
                      <div className="score-compare">
                        {Object.entries(item.refinedScores).map(([label, value]) => (
                          <div key={`${item.topicId}-${label}`}>
                            <span>{refinedScoreLabels[label] ?? label}</span>
                            <strong>{item.initialScores[label as keyof typeof item.initialScores]} → {value}</strong>
                            <em>{item.scoreDelta[label as keyof typeof item.scoreDelta] >= 0 ? "+" : ""}{item.scoreDelta[label as keyof typeof item.scoreDelta]}</em>
                          </div>
                        ))}
                      </div>
                      <details>
                        <summary>개선 근거와 변형 보기</summary>
                        <div className="improvement-list">
                          {item.improvementActions.map((action) => (
                            <article key={`${item.topicId}-${action.action}`}>
                              <strong>{action.recommendation}</strong>
                              <p>{action.rationale}</p>
                              <span>{action.evidence}</span>
                            </article>
                          ))}
                        </div>
                        <p><strong>안전형:</strong> {item.saferVariant}</p>
                        <p><strong>참신형:</strong> {item.novelVariant}</p>
                      </details>
                      <button type="button" onClick={() => refineAgain(item.improvedTopic.title, item.comparisonSummary)}>
                        <Wand2 size={16} /> 다시 정제
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel iteration-history-panel">
                <p className="tag">Iteration History</p>
                <h2>반복 개선 히스토리</h2>
                <div className="timeline-list">
                  {[
                    ...result.agenticResearchLoop.topicRefinements.flatMap((item) => item.iterationHistory.slice(0, 5).map((history) => ({
                      id: `${item.topicId}-${history.iteration}-${history.stage}`,
                      title: `${history.iteration}. ${history.stage}`,
                      summary: history.summary,
                      evidence: history.evidenceBoundary
                    }))),
                    ...refinementHistory.filter((record) => record.loopId === result.agenticResearchLoop.loopId).map((record) => ({
                      id: record.id,
                      title: `refine again · ${new Date(record.createdAt).toLocaleString()}`,
                      summary: record.topicTitle,
                      evidence: record.summary
                    }))
                  ].slice(0, 14).map((item) => (
                    <article key={`iteration-${item.id}`}>
                      <strong>{item.title}</strong>
                      <span>{item.summary}</span>
                      <p>{item.evidence}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="split wide-left">
                <section className="panel scholarly-memory-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Persistent Scholarly Memory</p>
                      <h2>장기 학술 메모리</h2>
                    </div>
                    <Save size={22} />
                  </div>
                  <div className="domain-grid">
                    <div>
                      <span>이전 세션</span>
                      <strong>{result.persistentScholarlyMemory.priorSessionCount}</strong>
                    </div>
                    <div>
                      <span>저장 토픽</span>
                      <strong>{result.persistentScholarlyMemory.storedTopicCount}</strong>
                    </div>
                    <div>
                      <span>이론 관계</span>
                      <strong>{result.persistentScholarlyMemory.storedTheoryRelationshipCount}</strong>
                    </div>
                    <div>
                      <span>저장 상태</span>
                      <strong>{result.persistentScholarlyMemory.persistence.enabled ? "로컬 저장됨" : "세션 스냅샷"}</strong>
                    </div>
                  </div>
                  <div className="rank-list compact">
                    {result.persistentScholarlyMemory.memoryRecords.slice(0, 4).map((record) => (
                      <article key={`memory-record-${record.sessionId}`}>
                        <strong>{record.keywords.join(", ")}</strong>
                        <span>{new Date(record.createdAt).toLocaleString()} · 토픽 {record.generatedTopicTitles.length}개 · 갭 {record.gapAnalyses.length}개</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.persistentScholarlyMemory.persistence.warning}</p>
                </section>
                <section className="panel semantic-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Vector Retrieval</p>
                      <h2>의미 검색 / 벡터 회상</h2>
                    </div>
                    <Search size={22} />
                  </div>
                  <div className="domain-grid">
                    <div>
                      <span>임베딩 모델</span>
                      <strong>{result.persistentScholarlyMemory.vectorRetrieval.embeddingModel}</strong>
                    </div>
                    <div>
                      <span>생성 임베딩</span>
                      <strong>{result.persistentScholarlyMemory.vectorRetrieval.embeddingsGenerated}</strong>
                    </div>
                  </div>
                  <div className="rank-list compact">
                    {result.persistentScholarlyMemory.vectorRetrieval.semanticSearchResults.slice(0, 5).map((item) => (
                      <article key={`semantic-${item.id}`}>
                        <strong>{topicShortTitle(item.label)}</strong>
                        <span>{item.type} · 유사도 {item.similarity} · 세션 {item.sourceSessionId.slice(-8)}</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.persistentScholarlyMemory.vectorRetrieval.retrievalBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel knowledge-graph-explorer">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Unified Knowledge Graph</p>
                      <h2>통합 학술 지식 그래프</h2>
                    </div>
                    <Network size={22} />
                  </div>
                  <div className="graph-summary-grid">
                    {["paper", "author", "theory", "concept", "methodology", "dataset", "venue", "institution", "discipline", "topic"].map((type) => (
                      <div key={`kg-type-${type}`}>
                        <span>{type}</span>
                        <strong>{result.persistentScholarlyMemory.unifiedKnowledgeGraph.nodes.filter((node) => node.type === type).length}</strong>
                      </div>
                    ))}
                  </div>
                  <h3 className="subsection-title">멀티홉 발견</h3>
                  <div className="timeline-list">
                    {result.persistentScholarlyMemory.unifiedKnowledgeGraph.multiHopDiscoveries.slice(0, 5).map((path) => (
                      <article key={`multi-hop-${path.path.join("-")}`}>
                        <strong>{path.path.join(" → ")}</strong>
                        <span>{path.evidence} · 신뢰도 {confidenceLabels[path.confidence]}</span>
                        <p>{path.explanation}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.persistentScholarlyMemory.unifiedKnowledgeGraph.graphBoundary}</p>
                </section>
                <section className="panel recall-panel">
                  <p className="tag">Research Recall</p>
                  <h2>교차 세션 연구 회상</h2>
                  <div className="rank-list compact">
                    {result.persistentScholarlyMemory.researchRecall.oldSessionConnections.length === 0 ? (
                      <article>
                        <strong>이전 세션 연결 없음</strong>
                        <span>분석을 몇 번 실행하면 로컬 메모리에서 유사 아이디어를 회상합니다.</span>
                      </article>
                    ) : (
                      result.persistentScholarlyMemory.researchRecall.oldSessionConnections.slice(0, 5).map((item) => (
                        <article key={`recall-${item.id}`}>
                          <strong>{topicShortTitle(item.label)}</strong>
                          <span>{item.type} · 유사도 {item.similarity} · 세션 {item.sourceSessionId.slice(-8)}</span>
                        </article>
                      ))
                    )}
                  </div>
                  <h3 className="subsection-title">이어갈 연구 아젠다</h3>
                  <ul className="plain-list">
                    {result.persistentScholarlyMemory.researchRecall.continuedResearchAgenda.slice(0, 5).map((item, index) => (
                      <li key={`continued-agenda-${index}-${item.slice(0, 32)}`}>{item}</li>
                    ))}
                  </ul>
                </section>
              </section>

              <section className="panel discovery-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Advanced Discovery Workflows</p>
                    <h2>관련 영역 / 숨은 연결 탐색</h2>
                  </div>
                  <Compass size={22} />
                </div>
                <div className="map-grid">
                  <div>
                    <h3>의미 탐색</h3>
                    <ul className="plain-list">
                      {result.persistentScholarlyMemory.discoveryWorkflows.semanticExplorationMode.slice(0, 5).map((item, index) => (
                        <li key={`semantic-mode-${index}-${item.slice(0, 32)}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>숨은 이론 연결</h3>
                    <ul className="plain-list">
                      {result.persistentScholarlyMemory.discoveryWorkflows.hiddenTheoryConnectionDiscovery.slice(0, 5).map((item, index) => (
                        <li key={`hidden-theory-${index}-${item.path.join("-")}`}>{item.path.join(" → ")} · {item.evidence}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>인접 기회</h3>
                    <ul className="plain-list">
                      {result.persistentScholarlyMemory.discoveryWorkflows.adjacentResearchOpportunities.slice(0, 5).map((item, index) => (
                        <li key={`adjacent-opportunity-${index}-${item.slice(0, 32)}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="split wide-left">
                <section className="panel predictive-forecast-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Predictive Forecasting</p>
                      <h2>예측 연구 인텔리전스</h2>
                    </div>
                    <BarChart3 size={22} />
                  </div>
                  <div className="prediction-signal-grid">
                    {result.predictiveAcademicIntelligence.forecasting.likelyFutureHotTopics.slice(0, 6).map((item) => (
                      <article key={`hot-topic-${item.label}-${item.direction}`}>
                        <span>{predictionDirectionLabels[item.direction]} · {item.horizon} · {confidenceLabels[item.confidence]}</span>
                        <strong>{item.label}</strong>
                        <em>{item.score}/10</em>
                        <p>{item.generatedForecast}</p>
                        <small>{item.evidence}</small>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.predictiveAcademicIntelligence.forecasting.forecastBoundary}</p>
                </section>
                <section className="panel publication-prediction-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Publication Prediction</p>
                      <h2>출판 결과 추정</h2>
                    </div>
                    <Target size={22} />
                  </div>
                  <div className="rank-list">
                    {result.predictiveAcademicIntelligence.publicationOutcomes.slice(0, 3).map((item) => (
                      <article key={`publication-outcome-${item.topicTitle}`}>
                        <strong>{topicShortTitle(item.topicTitle)}</strong>
                        <span>출판가능성 {item.publishabilityLikelihood}/10 · venue fit {item.journalConferenceFit}/10 · citation potential {item.citationPotential}/10</span>
                        <p>{item.reasoning[0]}</p>
                        <p className="muted">{item.warning}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel predictive-evaluation-panel">
                  <p className="tag">Advanced Evaluation</p>
                  <h2>예측 평가 엔진</h2>
                  <div className="evaluation-list">
                    {result.predictiveAcademicIntelligence.advancedEvaluation.slice(0, 3).map((item) => (
                      <article key={`predictive-eval-${item.topicTitle}`}>
                        <div>
                          <strong>{topicShortTitle(item.topicTitle)}</strong>
                          <span>종합 {item.overall}/10</span>
                        </div>
                        <div className="evaluation-bars">
                          {[
                            ["이론 정합성", item.theoreticalCoherence],
                            ["실증 검증성", item.empiricalTestability],
                            ["방법론 엄밀성", item.methodologicalRigor],
                            ["장기 확장성", item.longTermResearchScalability]
                          ].map(([label, value]) => (
                            <p key={`predictive-score-${item.topicTitle}-${label}`}>
                              <span>{label}</span>
                              <i style={{ width: `${Number(value) * 10}%` }} />
                              <strong>{value}</strong>
                            </p>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
                <section className="panel optimization-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Autonomous Optimization</p>
                      <h2>연구 전략 자동 최적화</h2>
                    </div>
                    <Rocket size={22} />
                  </div>
                  <div className="optimization-grid">
                    {result.predictiveAcademicIntelligence.optimizationVariants.map((variant) => (
                      <article key={`optimization-${variant.variant}`}>
                        <span>{optimizationVariantLabels[variant.variant]}</span>
                        <strong>{variant.title}</strong>
                        <p>{variant.optimizedResearchQuestion}</p>
                        <small>{variant.expectedTradeoff}</small>
                        <div>
                          <em>신규성 {variant.scoreProfile.novelty}</em>
                          <em>실행 {variant.scoreProfile.feasibility}</em>
                          <em>출판 {variant.scoreProfile.publishability}</em>
                          <em>위험 {variant.scoreProfile.risk}</em>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel predictive-simulation-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Strategy Simulation</p>
                      <h2>예측 전략 시뮬레이션</h2>
                    </div>
                    <Scale size={22} />
                  </div>
                  <div className="scenario-grid">
                    {result.predictiveAcademicIntelligence.strategySimulations.map((scenario) => (
                      <article key={`predictive-scenario-${scenario.scenario}`}>
                        <span>{scenario.scenario.replaceAll("_", " ")}</span>
                        <strong>{scenario.comparativeScore}/10</strong>
                        <p>{scenario.predictedUpside}</p>
                        <em>{scenario.evidence}</em>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">비교 시나리오</h3>
                  <ul className="plain-list">
                    {result.predictiveAcademicIntelligence.comparativeScenarioAnalysis.map((item, index) => (
                      <li key={`comparative-scenario-${index}-${item.slice(0, 30)}`}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="panel impact-panel">
                  <p className="tag">Impact Intelligence</p>
                  <h2>연구 임팩트 추정</h2>
                  <div className="rank-list compact">
                    {result.predictiveAcademicIntelligence.impactIntelligence.likelyResearchCommunitiesImpacted.slice(0, 5).map((community) => (
                      <article key={`impact-community-${community.community}`}>
                        <strong>{community.community}</strong>
                        <span>영향 가능성 {community.likelihood}/10</span>
                        <p>{community.evidence}</p>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">후속 경로</h3>
                  <ul className="plain-list">
                    {result.predictiveAcademicIntelligence.impactIntelligence.downstreamResearchPathways.map((item) => (
                      <li key={`downstream-${item}`}>{item}</li>
                    ))}
                  </ul>
                  <p className="muted">{result.predictiveAcademicIntelligence.impactIntelligence.impactBoundary}</p>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel profile-dashboard">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Researcher Profile</p>
                      <h2>개인화 연구자 대시보드</h2>
                    </div>
                    <UserRound size={22} />
                  </div>
                  <p>{result.selfImprovingIntelligence.personalizedRecommendationSummary}</p>
                  <div className="domain-grid">
                    <div>
                      <span>경력 단계</span>
                      <strong>{careerStageLabels[result.selfImprovingIntelligence.researcherProfile.careerStage]}</strong>
                    </div>
                    <div>
                      <span>참신성 허용도</span>
                      <strong>{noveltyToleranceLabels[result.selfImprovingIntelligence.researcherProfile.noveltyTolerance]}</strong>
                    </div>
                    <div>
                      <span>선호 방법론</span>
                      <strong>{result.selfImprovingIntelligence.researcherProfile.preferredMethodologies.join(", ") || methodologyLabels[result.query.methodology]}</strong>
                    </div>
                    <div>
                      <span>목표 venue</span>
                      <strong>{result.selfImprovingIntelligence.researcherProfile.targetVenues.slice(0, 2).join(", ") || "미설정"}</strong>
                    </div>
                  </div>
                  <div className="chips">
                    {result.selfImprovingIntelligence.researcherProfile.interests.slice(0, 8).map((interest) => (
                      <span key={`profile-interest-${interest}`}>{interest}</span>
                    ))}
                  </div>
                </section>
                <section className="panel monitor-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Continuous Intelligence</p>
                      <h2>연속 트렌드 모니터링</h2>
                    </div>
                    <Compass size={22} />
                  </div>
                  <div className="rank-list compact">
                    {result.selfImprovingIntelligence.continuousIntelligence.newlyRisingTheoriesTopics.slice(0, 5).map((item) => (
                      <article key={`continuous-${item.label}`}>
                        <strong>{item.label}</strong>
                        <span>최근/부상 신호 {item.support} · 근거 {item.paperIds.length}편</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfImprovingIntelligence.continuousIntelligence.updateBoundary}</p>
                </section>
              </section>

              <section className="split">
                <section className="panel evaluation-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Evaluation Engine</p>
                      <h2>지능형 연구 평가</h2>
                    </div>
                    <Target size={22} />
                  </div>
                  <div className="evaluation-list">
                    {result.selfImprovingIntelligence.evaluationEngine.evaluatedTopics.slice(0, 3).map((evaluation) => (
                      <article key={`evaluation-${evaluation.topicTitle}`}>
                        <div>
                          <strong>{topicShortTitle(evaluation.topicTitle)}</strong>
                          <span>종합 {evaluation.overall}/10</span>
                        </div>
                        <div className="evaluation-bars">
                          {evaluation.scores.slice(0, 4).map((score) => (
                            <p key={`${evaluation.topicTitle}-${score.criterion}`}>
                              <span>{evaluationLabels[score.criterion]}</span>
                              <i style={{ width: `${score.score * 10}%` }} />
                              <strong>{score.score}</strong>
                            </p>
                          ))}
                        </div>
                        <p>{evaluation.recommendation}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfImprovingIntelligence.evaluationEngine.evaluationBoundary}</p>
                </section>
                <section className="panel mentor-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">AI Research Mentor</p>
                      <h2>연구 멘토 피드백</h2>
                    </div>
                    <GraduationCap size={22} />
                  </div>
                  <div className="mentor-columns">
                    <div>
                      <h3>비평</h3>
                      <ul className="plain-list">
                        {result.selfImprovingIntelligence.mentorMode.critique.map((item) => (
                          <li key={`critique-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>숨은 가정</h3>
                      <ul className="plain-list">
                        {result.selfImprovingIntelligence.mentorMode.hiddenAssumptions.slice(0, 3).map((item) => (
                          <li key={`assumption-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <h3 className="subsection-title">초보자 단계별 가이드</h3>
                  <ol className="step-list">
                    {result.selfImprovingIntelligence.mentorMode.beginnerGuidanceSteps.map((item) => (
                      <li key={`mentor-step-${item}`}>{item}</li>
                    ))}
                  </ol>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel institutional-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Institutional Intelligence</p>
                      <h2>기관·학과 연구 지능</h2>
                    </div>
                    <Building2 size={22} />
                  </div>
                  <div className="map-grid">
                    <div>
                      <h3>학과 연구맵</h3>
                      <ul className="plain-list">
                        {result.selfImprovingIntelligence.institutionalIntelligence.departmentResearchMap.slice(0, 5).map((item) => (
                          <li key={`dept-${item.area}`}>{item.area} · {item.paperCount}편</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>전문가 매칭</h3>
                      <ul className="plain-list">
                        {result.selfImprovingIntelligence.institutionalIntelligence.facultyExpertiseMatches.slice(0, 5).map((item) => (
                          <li key={`faculty-${item.author}`}>{item.author} · {item.paperCount}편 · 인용 {item.totalCitations}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>협업 기회</h3>
                      <ul className="plain-list">
                        {result.selfImprovingIntelligence.institutionalIntelligence.collaborationOpportunities.slice(0, 4).map((item) => (
                          <li key={`collab-op-${item.source}-${item.target}`}>{item.source} ↔ {item.target}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.selfImprovingIntelligence.institutionalIntelligence.evidenceBoundary}</p>
                </section>
                <section className="panel ecosystem-panel">
                  <p className="tag">Scholarly Ecosystem Map</p>
                  <h2>확장 지식 그래프</h2>
                  <div className="timeline-list">
                    {result.selfImprovingIntelligence.advancedKnowledgeGraph.theoryEvolutionChains.slice(0, 5).map((chain) => (
                      <article key={`theory-chain-${chain.theory}`}>
                        <strong>{chain.theory}</strong>
                        <span>{chain.chain.join(" → ")}</span>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">기관 연결</h3>
                  <div className="rank-list compact">
                    {result.selfImprovingIntelligence.advancedKnowledgeGraph.institutionRelationships.slice(0, 4).map((edge) => (
                      <article key={`inst-edge-${edge.source}-${edge.target}`}>
                        <strong>{edge.source} ↔ {edge.target}</strong>
                        <span>{edge.weight}편에서 동시 등장</span>
                      </article>
                    ))}
                  </div>
                  <h3 className="subsection-title">저자 연결</h3>
                  <div className="rank-list compact">
                    {result.selfImprovingIntelligence.advancedKnowledgeGraph.authorRelationships.slice(0, 4).map((edge) => (
                      <article key={`author-edge-${edge.source}-${edge.target}`}>
                        <strong>{edge.source} ↔ {edge.target}</strong>
                        <span>{edge.weight}편 공동 저자 신호</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.selfImprovingIntelligence.advancedKnowledgeGraph.graphBoundary}</p>
                </section>
              </section>

              <section className="panel simulation-panel">
                <div className="panel-head">
                  <div>
                    <p className="tag">Scenario Simulation</p>
                    <h2>연구 시뮬레이션 / 시나리오 분석</h2>
                  </div>
                  <Rocket size={22} />
                </div>
                <div className="scenario-grid">
                  {result.selfImprovingIntelligence.scenarioAnalysis.scenarios.map((scenario) => (
                    <article className={scenario.scenario === result.selfImprovingIntelligence.scenarioAnalysis.preferredScenario ? "preferred" : ""} key={`scenario-${scenario.scenario}`}>
                      <span>{scenario.scenario}</span>
                      <strong>{scenario.recommendation}</strong>
                      <p>{scenario.expectedUpside}</p>
                      <em>{scenario.evidence}</em>
                    </article>
                  ))}
                </div>
                <p className="muted">{result.selfImprovingIntelligence.scenarioAnalysis.simulationBoundary}</p>
              </section>

              <section className="split wide-left">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Multi-Agent Workflow</p>
                      <h2>에이전트 활동 패널</h2>
                    </div>
                    <Network size={22} />
                  </div>
                  <div className="agent-timeline">
                    {result.multiAgentWorkflow.pipeline.map((agent, index) => (
                      <article key={agent.role}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{agent.name}</strong>
                          <p>{agent.outputSummary}</p>
                          <em>{agent.evidence}</em>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.multiAgentWorkflow.evidenceBoundary}</p>
                </section>
                <section className="panel">
                  <p className="tag">Autonomous Exploration</p>
                  <h2>자율 탐색 경로</h2>
                  <div className="rank-list">
                    {[...result.autonomousExploration.adjacentTheoryPaths, ...result.autonomousExploration.emergingConceptPaths, ...result.autonomousExploration.weakDomainExpansionPaths].slice(0, 5).map((path) => (
                      <article key={`${path.seed}-${path.path.join("-")}`}>
                        <strong>{path.path.join(" → ")}</strong>
                        <p>{path.rationale}</p>
                        <span>{path.evidence} · 신뢰도 {confidenceLabels[path.confidence]}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split">
                <section className="panel">
                  <p className="tag">Deep Research Synthesis</p>
                  <h2>딥 연구 합성</h2>
                  <div className="map-grid">
                    <div>
                      <h3>이론 종합</h3>
                      <ul className="plain-list">
                        {result.deepResearchSynthesis.structuredTheorySynthesis.slice(0, 3).map((item, index) => (
                          <li key={`theory-synth-${index}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>경쟁 프레임워크</h3>
                      <ul className="plain-list">
                        {result.deepResearchSynthesis.competingFrameworkAnalysis.slice(0, 3).map((item, index) => (
                          <li key={`competing-${index}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>개념 통합 제안</h3>
                      <ul className="plain-list">
                        {result.deepResearchSynthesis.conceptualIntegrationProposals.slice(0, 3).map((item, index) => (
                          <li key={`integration-${index}-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.deepResearchSynthesis.evidenceBoundary}</p>
                </section>
                <section className="panel">
                  <p className="tag">Forecast Dashboard</p>
                  <h2>연구 예측 대시보드</h2>
                  <div className="rank-list">
                    {result.researchForecast.likelyFutureResearchTrends.slice(0, 4).map((item) => (
                      <article key={`forecast-${item.title}`}>
                        <strong>{item.title}</strong>
                        <p>{item.rationale}</p>
                        <span>{item.evidence}</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.researchForecast.forecastBoundary}</p>
                </section>
              </section>

              <section className="split">
                <section className="panel">
                  <p className="tag">Research Memory</p>
                  <h2>연구 메모리 / 진화 아젠다</h2>
                  <div className="domain-grid">
                    <div>
                      <span>세션</span>
                      <strong>{result.researchMemorySeed.sessionId}</strong>
                    </div>
                    <div>
                      <span>저장 그래프 노드</span>
                      <strong>{result.researchMemorySeed.savedTheoryGraphNodeCount}</strong>
                    </div>
                    <div>
                      <span>문헌지도 항목</span>
                      <strong>{result.researchMemorySeed.savedLiteratureMapItems}</strong>
                    </div>
                    <div>
                      <span>비교 스냅샷</span>
                      <strong>{result.researchMemorySeed.comparisonSnapshot.length}</strong>
                    </div>
                  </div>
                  <ul className="plain-list">
                    {result.researchMemorySeed.evolvingResearchAgenda.slice(0, 4).map((item) => (
                      <li key={`agenda-${item}`}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="panel">
                  <p className="tag">Collaborative Workspace</p>
                  <h2>협업 연구 세션</h2>
                  <div className="rank-list compact">
                    {savedWorkspaces.slice(0, 4).map((item) => (
                      <article key={`collab-${item.id}`}>
                        <strong>{item.title}</strong>
                        <span>{(item.collaborators ?? ["사용자"]).join(", ")} · 그래프 {item.theoryGraphNodeCount ?? 0} · 지도 {item.literatureMapItems ?? 0}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel proposal-panel">
                  <div className="panel-head">
                    <div>
                      <p className="tag">Proposal Builder</p>
                      <h2>연구 제안서 생성 워크스페이스</h2>
                    </div>
                    <FileText size={22} />
                  </div>
                  <h3>{result.academicResearchOS.proposalDraft.title}</h3>
                  <p><strong>초록:</strong> {result.academicResearchOS.proposalDraft.abstract}</p>
                  <p><strong>문제 진술:</strong> {result.academicResearchOS.proposalDraft.problemStatement}</p>
                  <div className="proposal-grid">
                    <div>
                      <h4>연구목표</h4>
                      <ul className="plain-list">
                        {result.academicResearchOS.proposalDraft.researchObjectives.map((item) => (
                          <li key={`objective-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>한계</h4>
                      <ul className="plain-list">
                        {result.academicResearchOS.proposalDraft.limitations.slice(0, 4).map((item) => (
                          <li key={`limit-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="muted">{result.academicResearchOS.proposalDraft.evidenceBoundary}</p>
                </section>
                <section className="panel framework-panel">
                  <p className="tag">Conceptual Framework</p>
                  <h2>개념 프레임워크 시각화</h2>
                  <div className="framework-map">
                    {result.academicResearchOS.conceptualFramework.nodes.map((node) => (
                      <div className={`framework-node ${node.type}`} key={node.id}>
                        <span>{node.type}</span>
                        <strong>{node.label}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="timeline-list">
                    {result.academicResearchOS.conceptualFramework.edges.map((edge) => (
                      <article key={`${edge.source}-${edge.target}-${edge.label}`}>
                        <strong>{edge.label}</strong>
                        <span>{edge.explanation}</span>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.academicResearchOS.conceptualFramework.causalPathwayExplanation}</p>
                </section>
              </section>

              <section className="split">
                <section className="panel">
                  <p className="tag">Advanced Reasoning</p>
                  <h2>연구 추론 워크플로우</h2>
                  <div className="map-grid">
                    <div>
                      <h3>이론 비교</h3>
                      <ul className="plain-list">
                        {result.academicResearchOS.reasoningWorkflow.theoryComparison.slice(0, 3).map((item) => (
                          <li key={`reason-theory-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>방법론 트레이드오프</h3>
                      <ul className="plain-list">
                        {result.academicResearchOS.reasoningWorkflow.methodologyTradeoffs.slice(0, 3).map((item) => (
                          <li key={`reason-method-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>출판 전략</h3>
                      <ul className="plain-list">
                        {result.academicResearchOS.reasoningWorkflow.publicationStrategyReasoning.slice(0, 3).map((item) => (
                          <li key={`reason-pub-${item}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
                <section className="panel">
                  <p className="tag">Refinement Workflow</p>
                  <h2>자율 연구 개선 액션</h2>
                  <div className="rank-list">
                    {result.academicResearchOS.refinementActions.map((action) => (
                      <article key={action.action}>
                        <strong>{action.title}</strong>
                        <p>{action.recommendation}</p>
                        <span>{action.evidence}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </section>

              <section className="split wide-left">
                <section className="panel">
                  <p className="tag">Literature Review Workspace</p>
                  <h2>지능형 문헌리뷰 작업공간</h2>
                  <div className="rank-list">
                    {result.academicResearchOS.literatureWorkspace.annotations.slice(0, 6).map((item) => (
                      <article key={`annotation-${item.paperId}`}>
                        <strong>{topicShortTitle(item.title)}</strong>
                        <span>{item.cluster} · {item.theme} · 근거강도 {item.evidenceStrength} · {item.contradictionTag}</span>
                        <p>{item.annotation}</p>
                      </article>
                    ))}
                  </div>
                  <p className="muted">{result.academicResearchOS.literatureWorkspace.evidenceStrengthSummary}</p>
                </section>
                <section className="panel">
                  <p className="tag">Academic Writing Assistant</p>
                  <h2>학술 글쓰기 보조</h2>
                  <p><strong>학술 톤 문장:</strong> {result.academicResearchOS.writingIntelligence.academicToneRewrite}</p>
                  <h3>기여문장</h3>
                  <ul className="plain-list">
                    {result.academicResearchOS.writingIntelligence.contributionStatements.map((item) => (
                      <li key={`contrib-statement-${item}`}>{item}</li>
                    ))}
                  </ul>
                  <h3 className="subsection-title">토론/후속 연구 제안</h3>
                  <ul className="plain-list">
                    {[...result.academicResearchOS.writingIntelligence.discussionSuggestions, ...result.academicResearchOS.writingIntelligence.futureResearchSuggestions].slice(0, 5).map((item) => (
                      <li key={`writing-${item}`}>{item}</li>
                    ))}
                  </ul>
                </section>
              </section>

              <section className="panel">
                <p className="tag">Workflow Automation</p>
                <h2>학위·학회·저널·다편 논문 자동화 플랜</h2>
                <div className="workflow-grid">
                  <div>
                    <h3>학위논문</h3>
                    {result.academicResearchOS.workflowAutomation.thesisDissertationPlan.map((item) => (
                      <article key={`thesis-${item.title}`}><strong>{item.title}</strong><p>{item.rationale}</p></article>
                    ))}
                  </div>
                  <div>
                    <h3>학회/저널</h3>
                    {[...result.academicResearchOS.workflowAutomation.conferencePaperPlan, ...result.academicResearchOS.workflowAutomation.journalTargetingPlan.slice(0, 2)].map((item) => (
                      <article key={`venue-plan-${item.title}`}><strong>{item.title}</strong><p>{item.rationale}</p></article>
                    ))}
                  </div>
                  <div>
                    <h3>다편 연구 아젠다</h3>
                    {result.academicResearchOS.workflowAutomation.multiPaperAgendaConstruction.map((item) => (
                      <article key={`agenda-plan-${item.title}`}><strong>{item.title}</strong><p>{item.rationale}</p></article>
                    ))}
                  </div>
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
