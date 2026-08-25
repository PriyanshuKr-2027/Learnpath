import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    url.includes("deblsqilknaxulxqbmmm") ||
    url.includes("your-project-id") ||
    key.includes("your-anon-public-key")
  ) {
    return null;
  }

  try {
    return createBrowserClient(url, key);
  } catch {
    return null;
  }
}
