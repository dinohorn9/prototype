"use client";

import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const ZipCodeFinder = () => {
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState(null);

  const fetchZipCode = async (lat, lng) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    console.log(apiKey);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=postal_code`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const postalCode = data.results[0]?.address_components.find((component) =>
        component.types.includes("postal_code")
      )?.long_name;
      if (postalCode) {
        setZipCode(postalCode);
      } else {
        setError("Zip code not found.");
      }
    } catch (err) {
      setError("Failed to fetch zip code.");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchZipCode(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError("Permission denied or unavailable location.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  const [properties, setProperties] = useState([]);

  const fetchProperties = async () => {
    // Connect to Firebase and query the "properties" collection
    const querySnapshot = await getDocs(collection(db, "properties"));

    // Get the current user's zip code
    const currentUserZipCode = zipCode;

    // Sort the properties by closest to the current user's zip code
    const sortedProperties = querySnapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => {
        const distanceA = Math.abs(a.zipCode - currentUserZipCode);
        const distanceB = Math.abs(b.zipCode - currentUserZipCode);
        return distanceA - distanceB;
      });

    // Update the properties state with the sorted properties
    setProperties(sortedProperties);
  };

  useEffect(() => {
    // Fetch the properties when the component mounts
    fetchProperties();
  }, []);

  return (
    <div>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          <li>my zip: {zipCode}</li>
          {properties.map((property) => (
            <li key={property.id}>
              {property.name} - {property.zip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ZipCodeFinder;
