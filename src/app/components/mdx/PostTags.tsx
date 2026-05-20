import { Tag } from "lucide-react";

interface IPostTagsProps {
    tags?: string[];
}

export default function PostTags({ tags }: IPostTagsProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="mt-10 mb-6 flex flex-wrap items-center gap-2">
            <span className="font-bold text-base mr-1">Tags:</span>
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="group inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white border border-zinc-700 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500 hover:bg-violet-600 hover:shadow-md hover:shadow-violet-500/30"
                >
                    <Tag className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-12" />
                    {tag}
                </span>
            ))}
        </div>
    );
}
