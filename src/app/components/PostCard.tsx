import Link from "next/link";
import { PostMeta } from "@/lib/posts";

export default function PostCard({ slug, meta }: { slug: string, meta: PostMeta }) {
    return (
        <Link href={`/blog/${slug}`} className="block">
            <h2 className="text-lg font-semibold group-hover:underline">{meta.title}</h2>
            <p className="text-sm text-muted-foreground">{new Date(meta.date).toLocaleDateString()}</p>
            {meta.summary && <p className="mt-1 text-sm">{meta.summary}</p>}
        </Link>
    )
}