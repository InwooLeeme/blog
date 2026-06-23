import { PlaygroundPreviewCard, type PreviewCardParams } from "./_components/PlaygroundPreviewCard";
import EffectCarousel from "./_components/EffectCarousel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/playground" },
};

export default function Playground(){
    return(
        <div className="mx-auto w-full max-w-6xl mt-6">
            <EffectCarousel />
        </div>
    )
}