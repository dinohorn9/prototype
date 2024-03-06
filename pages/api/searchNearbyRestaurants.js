export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { latitude, longitude } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Use environment variable
    const radius = 5000; // Search within 5km radius
    const type = 'restaurant';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching Google Places API:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
