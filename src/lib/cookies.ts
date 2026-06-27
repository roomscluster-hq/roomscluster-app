export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

export function clearGuestCookies() {
  const cookies = [
    "guest_token",
    "guest_name", 
    "guest_email",
    "guest_identity",
    "livekit_server_url",
  ];
  cookies.forEach((name) => {
    document.cookie = `${name}=; path=/; max-age=0`;
  });
}