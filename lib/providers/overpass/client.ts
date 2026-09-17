import { ProviderError } from "../types";

// Ordered list of Overpass endpoints to try. The public overpass-api.de
// instance is known to intermittently reject requests from some networks
// (406) or rate-limit (429); mirrors give any Overpass-backed collector a
// real chance of succeeding without the caller ever seeing the failure.
// Configurable via OVERPASS_ENDPOINTS (comma-separated) for deployments
// that need a private mirror, but no environment variable is required for
// local development.
const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function resolveEndpoints(): string[] {
  const fromEnv = process.env.OVERPASS_ENDPOINTS;
  if (!fromEnv) return DEFAULT_OVERPASS_ENDPOINTS;

  const parsed = fromEnv
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  return parsed.length > 0 ? parsed : DEFAULT_OVERPASS_ENDPOINTS;
}

const REQUEST_TIMEOUT_MS = 15000;

type EndpointFailureReason = number | "timeout" | "network_error";

class OverpassEndpointError extends Error {
  readonly endpoint: string;
  readonly reason: EndpointFailureReason;

  constructor(endpoint: string, reason: EndpointFailureReason) {
    super(`Overpass endpoint failed: ${endpoint} (${reason})`);
    this.name = "OverpassEndpointError";
    this.endpoint = endpoint;
    this.reason = reason;
  }
}

// Only these failures are worth trying the next mirror for. Any other
// non-OK status (e.g. 400 from a malformed query) would fail identically on
// every endpoint, so we stop immediately instead of retrying pointlessly.
function isRetryableFailure(reason: EndpointFailureReason): boolean {
  if (reason === "timeout" || reason === "network_error") return true;
  if (reason === 406 || reason === 429) return true;
  return typeof reason === "number" && reason >= 500;
}

function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).host;
  } catch {
    return "unknown-endpoint";
  }
}

// Generic Overpass API response shape — the same `elements` array format
// is returned regardless of which tags a caller queried for, so this is
// shared across every category (healthcare, accessibility, places, ...).
export type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type OverpassResponse = { elements: OverpassElement[] };

async function fetchFromEndpoint(
  endpoint: string,
  overpassQuery: string,
): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: overpassQuery,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OverpassEndpointError(endpoint, response.status);
    }

    return (await response.json()) as OverpassResponse;
  } catch (error) {
    if (error instanceof OverpassEndpointError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new OverpassEndpointError(endpoint, "timeout");
    }
    throw new OverpassEndpointError(endpoint, "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

export type OverpassQueryResult = {
  data: OverpassResponse;
  providerEndpoint: "primary" | "fallback";
};

// Category-agnostic: runs the given Overpass QL query string across the
// configured endpoint list with fallback, timeout/abort handling, and safe
// (hostname + status only) logging. Callers own query construction and
// response normalization — this module knows nothing about categories
// (healthcare, accessibility, places, ...). `loggerPrefix` lets each caller
// keep its own log namespace (e.g. "healthcare/overpass").
export async function runOverpassQuery(
  overpassQuery: string,
  loggerPrefix: string,
): Promise<OverpassQueryResult> {
  const endpoints = resolveEndpoints();
  const failures: { endpoint: string; reason: EndpointFailureReason }[] = [];

  for (let index = 0; index < endpoints.length; index += 1) {
    const endpoint = endpoints[index];

    try {
      const data = await fetchFromEndpoint(endpoint, overpassQuery);
      return {
        data,
        providerEndpoint: index === 0 ? "primary" : "fallback",
      };
    } catch (error) {
      if (!(error instanceof OverpassEndpointError)) throw error;

      failures.push({ endpoint: error.endpoint, reason: error.reason });
      // Safe logging: endpoint host + failure reason only, no query
      // coordinates or other request data.
      console.warn(
        `[${loggerPrefix}] endpoint failed: ${endpointHost(error.endpoint)} reason=${error.reason}`,
      );

      if (!isRetryableFailure(error.reason)) {
        throw new ProviderError(
          "upstream",
          `Overpass rejected the query at ${endpointHost(error.endpoint)} (${error.reason})`,
        );
      }
      // Otherwise fall through and try the next endpoint.
    }
  }

  const allTimedOut = failures.every((failure) => failure.reason === "timeout");
  console.error(
    `[${loggerPrefix}] all endpoints failed: ${failures
      .map((failure) => `${endpointHost(failure.endpoint)}=${failure.reason}`)
      .join(", ")}`,
  );

  throw new ProviderError(
    allTimedOut ? "timeout" : "upstream",
    "All Overpass endpoints failed",
  );
}
