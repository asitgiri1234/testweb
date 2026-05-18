/** Shared address for both residences */
export const PROPERTY_ADDRESS =
  "Rohini Sector 15 F Block 19/53, Rohini Pocket 19 House Number 53, Vaishno Dairy, Delhi, India";

export const PROPERTY_AREA_LABEL = "Rohini, Delhi";

export function getGoogleMapsUrl(
  address = PROPERTY_ADDRESS,
) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
