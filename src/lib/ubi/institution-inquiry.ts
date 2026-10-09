import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { demoInquiry } from "@/lib/ubi/institution-catalog";

export type InstitutionDesk = {
  mode: "demo";
  bank: "未接続";
  securities: "未接続";
  session: "ログイン済み";
  sentToAi: false;
  mufgSlot: boolean;
  kabuSlot: boolean;
  note: string;
  bankRows: { label: string; value: string; hint: string }[];
  securitiesRows: { label: string; value: string; hint: string }[];
  audit: { action: string; at: string }[];
};

function slot(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

async function writeAudit(userId: string, action: "status" | "demo_inquiry") {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql.query(
    "INSERT INTO institution_reads (id, user_id, action) VALUES ($1, $2, $3)",
    [id, userId, action],
  );
  const rows = await sql.query<{ action: string; created_at: string | Date }>(
    "SELECT action, created_at FROM institution_reads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 8",
    [userId],
  );
  return rows.map((row) => ({
    action: row.action,
    at: new Date(row.created_at).toISOString(),
  }));
}

export const readInstitutionDesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { consent?: unknown }) => ({
    consent: input?.consent === true,
  }))
  .handler(async ({ data, context }): Promise<InstitutionDesk> => {
    const action = data.consent ? "demo_inquiry" : "status";
    const audit = await writeAudit(context.userId, action);
    const demo = data.consent ? demoInquiry() : { bank: [], securities: [] };
    return {
      mode: "demo",
      bank: "未接続",
      securities: "未接続",
      session: "ログイン済み",
      sentToAi: false,
      mufgSlot: slot("MUFG_CLIENT_ID") && slot("MUFG_CLIENT_SECRET"),
      kabuSlot: slot("KABU_CLIENT_ID") && slot("KABU_CLIENT_SECRET"),
      note: "公開仕様にトークンURLが無いため、資格情報の器があってもAPIは呼ばない。値は返さない。",
      bankRows: demo.bank,
      securitiesRows: demo.securities,
      audit,
    };
  });
