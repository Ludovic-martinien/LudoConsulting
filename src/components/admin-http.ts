/** Fetch authentifié pour l'administration : redirection vers le login si la session a expiré. */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, { credentials: "same-origin", ...init });
  if (response.status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/login")) {
    window.location.href = "/admin/login";
  }
  return response;
}
