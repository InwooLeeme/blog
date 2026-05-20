import { Calendar } from "lucide-react";

interface IHeaderProps {
    title: string;
    date: string;
    readingTime?: number;
}
export default function PostHeader({title, date, readingTime}: IHeaderProps){
    return (
        <header className="mt-14 text-left">
            <h1 className="mb-2 text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
            <p className="mt-0 mb-8 text-sm text-white flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(date).toLocaleDateString()}{readingTime ? <> · {readingTime} min read</> : null}</p>
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
        </header>
    )
}