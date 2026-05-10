export async function safeAction<T>(
  fn: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    const msg = (e as Error).message ?? "Action failed"
    if (msg.includes("NEXT_REDIRECT")) throw e
    return { ok: false, error: msg }
  }
}
