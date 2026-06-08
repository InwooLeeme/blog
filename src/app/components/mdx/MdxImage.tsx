import Image, { type ImageProps } from "next/image"


type MdxImageProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
    src: string
    alt?: string
    width?: number | string
    height?: number | string
}

export default function MdxImage({
    src,
    alt = "",
    width,
    height,
    className,
    ...rest
}: MdxImageProps) {
    const w = width ? Number(width) : 1200
    const h = height ? Number(height) : 675
    return (
        <span className="block my-8">
            <Image
                src={src}
                alt={alt}
                width={w}
                height={h}
                sizes="(min-width:1024px) 768px, 100vw"
                className={`rounded-xl border ${className ?? ""}`}
                {...rest}
            />
        </span>
    )
}