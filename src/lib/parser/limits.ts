// lib/limits.ts — upload caps shared by the API route and the /parser UI.
// Vercel serverless request bodies are 4.5 MB; a higher app-level cap (25 MB)
// lets users pick a file that then 413s as plaintext FUNCTION_PAYLOAD_TOO_LARGE.

export const MAX_UPLOAD_BYTES = Math.floor(4.5 * 1024 * 1024);
export const MAX_UPLOAD_LABEL = "4,5 MB";
