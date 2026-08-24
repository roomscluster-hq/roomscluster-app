"use client";

interface SubdomainErrorPageProps {
  variant: "not-found" | "access-denied";
  isAuthenticated: boolean;
}

export function SubdomainErrorPage({ variant, isAuthenticated }: SubdomainErrorPageProps) {
  const title =
    variant === "not-found"
      ? "This organization doesn't exist"
      : "You don't have access to this organization";

  const description =
    variant === "not-found"
      ? "This address isn't set up for any organization on RoomsCluster."
      : "Your account doesn't have access to this organization.";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-0">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        <p className="text-ink-700/60 text-sm mt-2">{description}</p>
        
          <a href={isAuthenticated ? "https://roomscluster.com/dashboard" : "https://roomscluster.com/login"}
          className="inline-block mt-6 text-sm font-medium text-primary-600 hover:underline"
        >
          {isAuthenticated ? "Go to your organization" : "Go to login"}
        </a>
      </div>
    </div>
  );
}