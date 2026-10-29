"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { GraphData } from "@/lib/graph";

const PostGraph = dynamic(() => import("./PostGraph"), { ssr: false, loading: () => <div className="h-[360px] rounded-xl bg-[#1c1c1c]" /> });

export default function GraphPreview({ data }: { data: GraphData }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} className="mx-auto my-16 w-full max-w-6xl px-4 md:px-6 lg:px-8">
    <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="font-display text-xl font-semibold">지식 지도</h2><p className="mt-2 text-sm text-muted-foreground">글과 주제 사이의 연결을 따라 탐색해 보세요.</p></div><Link href="/graph" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">전체 지도 보기</Link></div>
    {visible ? <PostGraph data={data} compact /> : <div className="h-[360px] rounded-xl bg-[#1c1c1c]" />}
  </section>;
}
