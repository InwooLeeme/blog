import Link from "next/link";
import Tr from "../Tr";

interface IPostTagsProps {
    tags?: string[];
}

export default function PostTags({ tags }: IPostTagsProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base mr-1"><Tr id="blog.tags" /></span>
            {tags.map((tag, index) => (
                <Link
                    key={index}
                    href={`/blog/tags/${encodeURIComponent(tag)}`}
                    className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                    {tag}
                </Link>
            ))}
        </div>
    );
}
