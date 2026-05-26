import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "연구 인텔리전스 시스템",
  description: "학술 메타데이터 기반 근거 중심 연구주제 생성 도구."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
