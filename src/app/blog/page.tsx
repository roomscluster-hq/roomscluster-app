import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/landing-page/NavBar";
import { Footer } from "@/components/landing-page/Footer";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — RoomsCluster",
  description: "Notes on running training academies and live online classes.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-surface-0">
      <NavBar />

      <header className="relative bg-surface-0 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(224,231,255,0.9), transparent 55%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-16 md:pt-40 md:pb-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-600">
            Blog
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-ink-900">
            From the RoomsCluster blog
          </h1>
          <p className="mt-5 text-lg text-ink-700/70 leading-relaxed max-w-xl mx-auto">
            Notes on running training academies, live classes, and enrollment
            — for organizations doing this for real.
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-ink-700/50">
            No posts yet — check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group border border-surface-200 rounded-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised"
              >
                <h2 className="text-lg font-semibold text-ink-900 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-ink-700/60 mt-1.5 leading-relaxed">
                  {post.excerpt}
                </p>
                <p className="text-xs text-ink-700/40 mt-3">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
