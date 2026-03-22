import crypto from "crypto";

export function generateUid(): string {
  // Generates 7 alphanumeric chars
  return Math.random().toString(36).substring(2, 9);
}

export function generateTenantId(subdomain: string): string {
  const uid = generateUid();
  return `${subdomain}-${uid}`;
}

export function generateImageName(tenantId: string): string {
  const registryHost = process.env.REGISTRY_HOST || "192.168.0.121:32000";
  return `${registryHost}/${tenantId}:latest`;
}
