import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatPostDate } from "@/lib/post-display";

interface IHeaderProps {
    title: string;
    date: string;
    readingTime?: number;
    summary?: string;
    series?: string;
}
export default function PostHeader({title, date, readingTime, summary, series}: IHeaderProps){
    return (
        <header className="mt-14 text-left">
            {series ? (
                <Link
                    href={`/blog/series/${encodeURIComponent(series)}`}
                    className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-brand/10 px-3 py-1 text-xs font-semibold text-accent-brand transition hover:bg-accent-brand/20"
                >
                    SERIES · {series}
                </Link>
            ) : null}
            <h1 className="mb-2 text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
            {summary ? (
                <p className="mt-2 mb-4 text-base text-muted-foreground">{summary}</p>
            ) : null}
            <p className="mt-0 mb-8 text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatPostDate(date)}{readingTime ? <> · {readingTime} min read</> : null}</p>
            <hr className="my-6" />
        </header>
    )
}