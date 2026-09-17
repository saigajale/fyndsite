export type ProviderErrorKind = "timeout" | "upstream" | "unconfigured" | "not_implemented";

// Shared, infrastructure-level error for any external intelligence
// provider (Overpass today; future accessibility/places/demographics
// providers later). Category modules (e.g. healthcare) map `kind` to their
// own safe HTTP status without ever forwarding the raw upstream error, or
// any secret, to the client.
export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;

  constructor(kind: ProviderErrorKind, message: string) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
  }
}
