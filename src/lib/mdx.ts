import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeKatex from "rehype-katex";
import { transformerNotationDiff } from "@shikijs/transformers";

type MdxOptions = NonNullable<MDXRemoteProps["options"]>["mdxOptions"];

export const mdxOptions: MdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: { className: ["anchor"], ariaLabel: "Link to section" },
      },
    ],
    [
      rehypePrettyCode,
      {
        theme: {
          dark: "one-dark-pro",
          light: "one-light",
        },
        defaultLang: "plaintext",
        keepBackground: true,
        transformers: [transformerNotationDiff()],
      },
    ],
    rehypeKatex,
  ],
};
