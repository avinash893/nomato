import express, { Request, Response } from "express";

const router = express.Router();

/**
 * Remove Hindi/Devanagari script and extraneous symbols
 */
function sanitizeToEnglish(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u0900-\u097F]/gu, "") // Strip Devanagari characters
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/^\s*,\s*/, "")
    .replace(/\s*,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Clean and combine address parts into a coherent English address
 */
function buildEnglishAddress(parts: (string | undefined | null)[]): string {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const part of parts) {
    if (!part) continue;
    const sanitized = sanitizeToEnglish(part);
    if (!sanitized) continue;
    const lower = sanitized.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      cleaned.push(sanitized);
    }
  }

  return cleaned.join(", ");
}

router.get("/reverse", async (req: Request, res: Response) => {
  const lat = req.query.lat || req.query.latitude;
  const lon = req.query.lon || req.query.longitude;

  if (!lat || !lon) {
    res.status(400).json({ error: "Missing latitude or longitude parameters" });
    return;
  }

  const latitude = parseFloat(lat.toString());
  const longitude = parseFloat(lon.toString());

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({ error: "Invalid latitude or longitude" });
    return;
  }

  try {
    // 1. Proximity POI / Campus / Landmark Detection via Photon API
    let poiProps: any = {};
    let poiLat: number | null = null;
    let poiLon: number | null = null;

    try {
      const photonUrl = `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`;
      const photonRes = await fetch(photonUrl);
      if (photonRes.ok) {
        const photonData = (await photonRes.json()) as any;
        const poi = photonData.features?.[0];
        if (poi) {
          poiProps = poi.properties || {};
          if (poi.geometry?.coordinates) {
            [poiLon, poiLat] = poi.geometry.coordinates;
          }
        }
      }
    } catch (photonErr) {
      console.warn("Photon proximity lookup error:", photonErr);
    }

    // 2. OpenStreetMap Detailed Address Resolution
    let osmData: any = {};
    try {
      // Query target coordinates or snap to nearby campus/landmark node if found
      const queryLat = poiLat && Math.abs(poiLat - latitude) < 0.01 ? poiLat : latitude;
      const queryLon = poiLon && Math.abs(poiLon - longitude) < 0.01 ? poiLon : longitude;

      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${queryLat}&lon=${queryLon}&addressdetails=1&zoom=18&accept-language=en`;
      const osmRes = await fetch(osmUrl, {
        headers: {
          "User-Agent": "NomatoFoodDelivery/1.0 (contact@nomato.com)",
          "Accept-Language": "en",
        },
      });

      if (osmRes.ok) {
        osmData = (await osmRes.json()) as any;
      }
    } catch (osmErr) {
      console.warn("OSM Nominatim lookup error:", osmErr);
    }

    const addr = osmData.address || {};

    // Extract landmark (e.g. Indian Institute of Information Technology, Una)
    const landmark =
      osmData.name ||
      addr.amenity ||
      addr.university ||
      addr.college ||
      addr.school ||
      addr.building ||
      addr.shop ||
      addr.hospital ||
      poiProps.name ||
      "";

    // Extract road / highway (e.g. NH503A, MDR130)
    const road = addr.road || poiProps.street || "";

    // Extract village / sublocality / hamlet (e.g. Saloh, Panoh, Uchri)
    const village =
      addr.village ||
      addr.hamlet ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      "";

    // Extract town / city (e.g. Una, Garhwa)
    const town = addr.town || addr.city || poiProps.city || "";

    // Extract county / district
    const county = addr.county || addr.state_district || poiProps.county || "";

    // Extract state & country
    const state = addr.state || poiProps.state || "";
    const country = addr.country || poiProps.country || "India";

    // Extract PIN code (postal code)
    let pincode = addr.postcode || poiProps.postcode || "";

    // Fallback lookup at zoom 14 for missing postal code
    if (!pincode) {
      try {
        const osmUrl14 = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=14&accept-language=en`;
        const osmRes14 = await fetch(osmUrl14, {
          headers: {
            "User-Agent": "NomatoFoodDelivery/1.0 (contact@nomato.com)",
            "Accept-Language": "en",
          },
        });
        if (osmRes14.ok) {
          const osmData14 = (await osmRes14.json()) as any;
          if (osmData14.address?.postcode) {
            pincode = osmData14.address.postcode;
          }
        }
      } catch {}
    }

    // Assemble address parts in clear geographical hierarchy
    const parts = [
      landmark,
      road,
      village,
      town,
      county && county !== town ? county : "",
      state,
      pincode,
      country,
    ];

    let formattedAddress = buildEnglishAddress(parts);

    // Fallback if parts were sparse
    if (!formattedAddress && osmData.display_name) {
      formattedAddress = sanitizeToEnglish(osmData.display_name);
    }

    if (pincode && !formattedAddress.includes(pincode)) {
      if (formattedAddress.toLowerCase().endsWith(country.toLowerCase())) {
        formattedAddress = formattedAddress.replace(
          new RegExp(`,?\\s*${country}$`, "i"),
          `, ${pincode}, ${country}`
        );
      } else {
        formattedAddress = `${formattedAddress}, ${pincode}`;
      }
    }

    const cleanCity =
      sanitizeToEnglish(landmark || town || county) || "Detected Location";

    res.json({
      success: true,
      latitude,
      longitude,
      formattedAddress:
        formattedAddress ||
        `Location at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      pincode: pincode || "",
      city: cleanCity,
      landmark: sanitizeToEnglish(landmark),
      road: sanitizeToEnglish(road),
      state: sanitizeToEnglish(state),
      country: sanitizeToEnglish(country),
    });
  } catch (error: any) {
    console.error("Reverse geocoding error:", error);
    res.status(500).json({ error: "Failed to reverse geocode location" });
  }
});

export default router;
