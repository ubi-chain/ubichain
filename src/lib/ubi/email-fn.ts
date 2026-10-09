import { createServerFn } from "@tanstack/react-start";

export const ADMIN_EMAIL = "haruki.2000495@gmail.com";
const WINDOW_MS = 10 * 60 * 1000;

function env(key: string) {
  return process.env[key]?.trim() || undefined;
}

function windowIndex(at = Date.now()) {
  return Math.floor(at / WINDOW_MS);
}

async function codeFor(window: number) {
  const secret = env("RESEND_API_KEY");
  if (!secret) return null;
  const { createHmac } = await import("node:crypto");
  const digest = createHmac("sha256", secret).update(`${ADMIN_EMAIL}:${window}`).digest();
  return String(digest.readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

export const sendAdminEmailOtp = createServerFn({ method: "POST" }).handler(async () => {
  const apiKey = env("RESEND_API_KEY");
  const from = env("RESEND_FROM") || "UBICHAIN <onboarding@resend.dev>";
  if (!apiKey) return { ok: false as const, error: "管理者メール認証は現在設定されていません" };
  const code = await codeFor(windowIndex());
  if (!code) return { ok: false as const, error: "管理者メール認証は現在設定されていません" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [ADMIN_EMAIL], subject: "UBICHAIN 管理者認証コード", text: `認証コード: ${code}\n有効期限: 10分\nこのコードを共有しないでください。` }),
  });
  if (!response.ok) return { ok: false as const, error: "管理者メールを送信できませんでした" };
  return { ok: true as const };
});

export const verifyAdminEmailOtp = createServerFn({ method: "POST" })
  .validator((input: { code: string }) => ({ code: String(input.code ?? "").replace(/\D/g, "").slice(0, 6) }))
  .handler(async ({ data }) => {
    const current = await codeFor(windowIndex());
    const previous = await codeFor(windowIndex(Date.now() - WINDOW_MS));
    if (!current || (data.code !== current && data.code !== previous)) return { ok: false as const, error: "認証コードが一致しないか、有効期限が切れています" };
    return { ok: true as const, email: ADMIN_EMAIL };
  });
