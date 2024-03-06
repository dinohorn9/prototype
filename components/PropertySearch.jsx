"use client";

import React, { useState, useEffect } from "react";

function NearbyRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const apiRef = "/api/searchNearbyRestaurants";
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      const response = await fetch(apiRef, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.results || []);
      }
    });
  }, []);

  return (
    <div>
      <h2>Nearby Restaurants</h2>
      <ul>
        {restaurants.map((restaurant, index) => (
          <li key={index}>{restaurant.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default NearbyRestaurants;
