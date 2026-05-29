import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import ResultClient from "./ResultClient";

type Props = {
  searchParams: {
    score?: string;
    mode?: string;
    name?: string;
    level?: string;
    avg?: string;
    best?: string;
  };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const score = searchParams.score ?? "0";
  const mode = searchParams.mode ?? "train";
  const name = searchParams.name ?? "Player";
  const ogUrl = `/og?score=${score}&mode=${mode}&name=${encodeURIComponent(name)}`;

  return {
    title: `${name} scored ${score} — The Brain Rot Game`,
    description: "Can you beat my Brain Rot Game score?",
    openGraph: {
      title: `${name} scored ${score} on The Brain Rot Game`,
      description: "Can you beat me?",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} scored ${score} on The Brain Rot Game`,
      images: [ogUrl],
    },
  };
}

export default function ResultPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResultClient
        score={Number(searchParams.score ?? 0)}
        mode={searchParams.mode ?? "train"}
        level={Number(searchParams.level ?? 1)}
        avg={searchParams.avg}
        best={searchParams.best}
        initialName={searchParams.name ?? ""}
      />
    </Suspense>
  );
}
