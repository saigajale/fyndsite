export type LocationSource = "search" | "map_pin" | "current_location";

export type SiteLocation = {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
  confirmed: boolean;
  providerPlaceId?: string;
};

export type GeocodeResult = {
  providerPlaceId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};
