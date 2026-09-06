import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { NavBar } from "@/components/landing-page/NavBar";
import { Footer } from "@/components/landing-page/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  return {
    title: `${post.meta.title} — RoomsCluster`,
    description: post.meta.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="bg-surface-0">
      <NavBar />

      <article className="max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 leading-tight">
          {post.meta.title}
        </h1>
        <p className="text-sm text-ink-700/40 mt-4">
          {new Date(post.meta.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose-brand prose mt-10 max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </article>

      <Footer />
    </div>
  );
}
