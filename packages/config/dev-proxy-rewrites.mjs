/**
 * Dev-only Next.js rewrites — proxy backend routes through the Next dev server.
 * Used when NEXT_PUBLIC_API_BASE_URL is empty (see src/app.ts).
 */
export function createDevProxyRewrites(
  apiProxyUrl = process.env.API_PROXY_URL ?? "http://127.0.0.1:8888",
) {
  const base = apiProxyUrl.replace(/\/$/, "");

  return [
    { source: "/api/:path*", destination: `${base}/api/:path*` },
    { source: "/health", destination: `${base}/health` },
    { source: "/avatars/:path*", destination: `${base}/avatars/:path*` },
    {
      source: "/voice-clone-avatars/:path*",
      destination: `${base}/voice-clone-avatars/:path*`,
    },
    // Match /tasks/{id}/{file...} but NOT /tasks/{id} alone, so the
    // web-user /tasks/[id] Next.js page route is not intercepted.
    { source: "/tasks/:taskId/:rest*", destination: `${base}/tasks/:taskId/:rest*` },
  ];
}
