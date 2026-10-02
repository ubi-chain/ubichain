export type RemittanceInsight = {
  corridor: string;
  medianFeeRate: number;
  medianDeliveryMinutes: number;
  failureRate: number;
  fxSpreadRate: number;
  sampleSize: number;
  periodStart: string;
  periodEnd: string;
  source: string;
};

/**
 * This application intentionally ships without remittance observations.
 * A future server-side ingestion job may supply only k-anonymous, aggregated
 * corridor metrics through this boundary. Never pass account, device, identity,
 * raw transaction, or recipient information into this module.
 */
export const remittanceInsights: readonly RemittanceInsight[] = [];

export function isPublishableRemittanceInsight(row: RemittanceInsight) {
  return (
    row.sampleSize >= 100 &&
    row.medianFeeRate >= 0 &&
    row.medianDeliveryMinutes >= 0 &&
    row.failureRate >= 0 &&
    row.fxSpreadRate >= 0 &&
    Boolean(row.corridor && row.periodStart && row.periodEnd && row.source)
  );
}
