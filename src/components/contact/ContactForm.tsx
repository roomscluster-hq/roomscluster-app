"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    value: "general",
    label: "General question",
    email: "support@roomscluster.com",
  },
  {
    value: "sales",
    label: "Sales & Enterprise",
    email: "admin@roomscluster.com",
  },
  {
    value: "billing",
    label: "Billing",
    email: "support@roomscluster.com",
  },
  {
    value: "technical",
    label: "Technical support",
    email: "support@roomscluster.com",
  },
  {
    value: "privacy",
    label: "Privacy & data request",
    email: "support@roomscluster.com",
  },
] as const;

export function ContactForm() {
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]["value"]>("general");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value;

    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value;

    const organization = (
      form.elements.namedItem("organization") as HTMLInputElement
    ).value;

    const message = (
      form.elements.namedItem("message") as HTMLTextAreaElement
    ).value;

    const selected = CATEGORIES.find((c) => c.value === category)!;

    const subject = `[${selected.label}] Message from ${name}`;

    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      organization && `Organization: ${organization}`,
      "",
      message,
    ].filter(Boolean);

    window.location.href =
      `mailto:${selected.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Input
          name="name"
          label="Name"
          placeholder="Your name"
          required
        />

        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
        />
      </div>

      <Input
        name="organization"
        label="Organization"
        placeholder="Your academy or organization"
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="category"
          className="text-sm font-medium text-ink-700"
        >
          What can we help with?
        </label>

        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as typeof category)
          }
          className="w-full h-10 border border-surface-200 bg-surface-0 rounded-lg px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
        >
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="text-sm font-medium text-ink-700"
        >
          Message
        </label>

        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Tell us how we can help..."
          className="w-full border border-surface-200 bg-surface-0 rounded-lg px-3 py-3 text-sm text-ink-900 placeholder:text-ink-700/30 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 resize-none"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto px-6"
      >
        Send message
        <Send data-icon="inline-end" size={15} />
      </Button>

      <p className="text-xs text-ink-700/45 leading-relaxed">
        This opens your email app with your message pre-filled. Your
        message is not sent until you confirm it in your email app.
      </p>
    </form>
  );
}