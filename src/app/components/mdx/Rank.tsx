import { cn } from "@/lib/utils";
import React from "react";

export type RankType = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

interface rankColorsProps extends React.HTMLAttributes<HTMLSpanElement>{
    rank : RankType | string
    level : string
}

const RANK_COLORS: Record<string, string> = {
    Bronze : "text-[#ad5600]",
    Silver : "text-[#435f7a]",
    Gold : "text-[#ec9a00]", 
    Platinum : "text-[#27e2a4]",
    Diamond: "text-[#39a9ff]",
}

export function Rank({rank, level, className, ...props} : rankColorsProps){
    const colorClass = RANK_COLORS[rank] || "text-gray-500";
    return (
        <span className={cn(colorClass, className)} {...props} >{level}</span>
    )
}