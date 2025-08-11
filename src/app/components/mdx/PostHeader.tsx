import { Badge } from "@/components/ui/badge";

interface IHeaderProps {
    title: string;
    date: string;
    tags?: string[];
    readingTime?: number;
}
export default function PostHeader({title, date, tags, readingTime}: IHeaderProps){
    return (
        <header className="mt-14 text-center">
            <h1 className="mb-2 text-center">{title}</h1>
            <p className="mt-0 mb-8 text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}{readingTime ? <> · {readingTime} min read</> : null}</p>
            <div className="mb-3 text-base">
                {tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-pink-600 font-semibold">{tag}</Badge>
                ))}
            </div>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
        </header>
    )
}