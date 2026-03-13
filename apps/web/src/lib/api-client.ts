const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function authedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: isFormData
      ? options.headers
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
  });
}
