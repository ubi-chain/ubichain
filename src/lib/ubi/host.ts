import { OZ_ORIGIN as PAID_OZ } from "./dns";

export const OZ_SUB = "oz";
export const OZ_ORIGIN = PAID_OZ;
export const OZ_PATH = "/oz";

export function readHostname() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

export function isOzHost(hostname = readHostname()) {
  if (!hostname) return false;
  if (hostname === OZ_ORIGIN) return true;
  return hostname === "oz" || hostname.startsWith("oz.");
}

export function isOzSurface(pathname: string, hostname = readHostname()) {
  return isOzHost(hostname) || pathname === OZ_PATH || pathname.startsWith(`${OZ_PATH}/`);
}

export function ozHomePath(hostname = readHostname()) {
  return isOzHost(hostname) ? "/" : OZ_PATH;
}
