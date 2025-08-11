import Image from "next/image"

export default function MdxImage(props: any) {
    const { src, alt = "", width, height, className, ...rest } = props
    const w = width ? Number(width) : 1200
    const h = height ? Number(height) : 675
    return (
        <span className="block my-8">
            <Image
                src={src}
                alt={alt}
                sizes="(min-width:1024px) 768px, 100vw"
                className={`rounded-xl border ${className ?? ""}`}
                {...rest}
            />
        </span>
    )
}