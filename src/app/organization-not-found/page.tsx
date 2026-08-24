export default function OrganizationNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-0">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-ink-900">
          This organization doesn't exist
        </h1>
        <p className="text-ink-700/60 text-sm mt-2">
          This address isn't set up for any organization on RoomsCluster.
        </p>
        
          <a href="https://roomscluster.com/login"
          className="inline-block mt-6 text-sm font-medium text-primary-600 hover:underline"
        >
          Go to login
        </a>
      </div>
    </div>
  );
}