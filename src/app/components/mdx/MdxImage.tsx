"use client"

import Image, { type ImageProps } from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"


type MdxImageProps = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
    src: string
    alt?: string
    width?: number | string
    height?: number | string
}

const fade =
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none"

export default function MdxImage({
    src,
    alt = "",
    width,
    height,
    className,
    ...rest
}: MdxImageProps) {
    const base = {
        src,
        width: width ? Number(width) : 1200,
        height: height ? Number(height) : 675,
    }
    return (
        <span className="block my-8">
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <button
                        type="button"
                        aria-label={alt ? `${alt} 확대 보기` : "이미지 확대 보기"}
                        className="block w-full cursor-zoom-in"
                    >
                        <Image
                            {...base}
                            alt={alt}
                            sizes="(min-width:1024px) 768px, 100vw"
                            className={`rounded-xl border ${className ?? ""}`}
                            {...rest}
                        />
                    </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${fade}`}
                    />
                    <Dialog.Content
                        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 focus:outline-none data-[state=open]:zoom-in-95 ${fade}`}
                    >
                        <Dialog.Title className="sr-only">{alt || "이미지"}</Dialog.Title>
                        <Image
                            {...base}
                            alt={alt}
                            sizes="95vw"
                            className="h-auto w-auto max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
                        />
                        <Dialog.Close
                            aria-label="닫기"
                            className="fixed right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <XIcon className="h-5 w-5" />
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </span>
    )
}
