// ═══ MOCK MPAC / MUNICIPAL DATA (Ontario demo addresses) ═══

export interface PropertyData {
  yearBuilt: number;
  sqft: number;
  constructionType: string;
  units: number;
  storeys: number;
  heating: string;
  roof: string;
  basement: string;
  propertyType: string;
  estimatedValue: number;
  replacementCost: number;
}

export const MOCK_PROPERTY_DATA: Record<string, PropertyData> = {
  "123 Queen St W, Toronto, ON": {
    yearBuilt: 1987, sqft: 1450, constructionType: "Brick Veneer",
    units: 2, storeys: 2, heating: "Forced Air Gas", roof: "Asphalt Shingle",
    basement: "Full, Finished", propertyType: "Semi-Detached",
    estimatedValue: 825000, replacementCost: 425000,
  },
  "456 Dundas St E, Toronto, ON": {
    yearBuilt: 2005, sqft: 2100, constructionType: "Brick",
    units: 4, storeys: 3, heating: "Forced Air Gas", roof: "Flat (Modified Bitumen)",
    basement: "Full, Unfinished", propertyType: "Multi-Unit Residential",
    estimatedValue: 1350000, replacementCost: 680000,
  },
  "789 King St, Hamilton, ON": {
    yearBuilt: 1955, sqft: 1100, constructionType: "Frame with Aluminum Siding",
    units: 1, storeys: 1.5, heating: "Baseboard Electric", roof: "Asphalt Shingle",
    basement: "Partial, Unfinished", propertyType: "Detached",
    estimatedValue: 520000, replacementCost: 290000,
  },
};

export const SAMPLE_ADDRESSES = Object.keys(MOCK_PROPERTY_DATA);

export const DEFAULT_PROPERTY: PropertyData = {
  yearBuilt: 1995, sqft: 1200, constructionType: "Brick Veneer", units: 1, storeys: 2,
  heating: "Forced Air Gas", roof: "Asphalt Shingle", basement: "Full, Finished",
  propertyType: "Semi-Detached", estimatedValue: 650000, replacementCost: 350000,
};

/**
 * Simulates an MPAC / municipal lookup for a given address.
 * Returns matching mock data or sensible defaults.
 */
export function lookupProperty(address: string): PropertyData {
  // Try exact match first
  if (MOCK_PROPERTY_DATA[address]) return { ...MOCK_PROPERTY_DATA[address] };

  // Try partial match
  const normalised = address.toLowerCase();
  for (const [key, data] of Object.entries(MOCK_PROPERTY_DATA)) {
    if (normalised.includes(key.toLowerCase().split(",")[0])) {
      return { ...data };
    }
  }

  return { ...DEFAULT_PROPERTY };
}
