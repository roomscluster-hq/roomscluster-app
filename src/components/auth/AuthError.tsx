"use client";

interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  return (
    <div className="bg-danger-50 text-danger-600 text-sm rounded-lg px-4 py-2.5 mb-4">
      {message}
    </div>
  );
}
