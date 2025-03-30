"use server";

export async function getFireData(): Promise<string> {
  const API_KEY = process.env.NASA_FIRMS_API_KEY as string;
  const SOURCE = "MODIS_NRT";
  const COUNTRY = "USA";
  const DAYS = 2;
  const response = await fetch(
    `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${API_KEY}/${SOURCE}/${COUNTRY}/${DAYS}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch wildfire data");
  }
  const csvData = await response.text();
  return csvData;
}
