"use client"

import React, { useState, useEffect } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Script from 'next/script';

const PropertyFinder: React.FC = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [address, setAddress] = useState('');

  useEffect(() => {
    const getGeolocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          (error) => {
            setError('Failed to get geolocation. Please enter zipcode or city and state.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported. Please enter zipcode or city and state.');
        setLoading(false);
      }
    };

    getGeolocation();
  }, []);

  const handleSelect = async (selectedAddress: string) => {
    setLoading(true);
    try {
      const results = await geocodeByAddress(selectedAddress);
      const { lat, lng } = await getLatLng(results[0]);
      setLocation({ latitude: lat, longitude: lng });
      setAddress(selectedAddress);
      setLoading(false);
    } catch (error) {
      setError('Failed to get geolocation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBorgmGs2Y1nBB6fmw0GvliCx6NgbZv32I&libraries=places`}
        strategy="beforeInteractive"
      />
      {loading ? (
        <p>Loading...</p>
      ) : location ? (
        <div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      ) : (
        <div>
          {error && <p>{error}</p>}
          <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelect}>
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <input {...getInputProps({ placeholder: 'Enter zipcode, city, or state' })} />
                <div>
                  {loading && <div>Loading...</div>}
                  {suggestions.map((suggestion) => (
                    <div {...getSuggestionItemProps(suggestion)} key={suggestion.placeId}>
                      {suggestion.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
        </div>
      )}
    </div>
  );
};

export default PropertyFinder;