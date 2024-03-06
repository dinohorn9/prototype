import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const placeId = req.query.place_id;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY; // Make sure this is correct and safe
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.result) {
      res.status(200).json(data.result);
    } else {
      res.status(404).json({ message: "Details not found" });
    }
  } catch (error) {
    console.error("Failed to fetch place details", error);
    res.status(500).send("Server error");
  }
}
