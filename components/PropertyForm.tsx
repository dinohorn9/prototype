"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const PropertyForm: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const [properties, setProperties] = useState<DocumentData[]>([]); // Update the type of properties state

  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setProperties(data);
    };

    fetchProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true); // Set isLoading to true

    try {
      await addDoc(collection(db, "properties"), {
        name,
        type,
        city,
      });

      setName("");
      setType("");
      setCity("");
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    setIsLoading(false); // Set isLoading back to false after form submission
  };

  const handleCancel = () => {
    setName("");
    setType("");
    setCity("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 p-2 border border-gray-300 text-black"
        />
        <input
          type="text"
          placeholder="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mb-4 p-2 border border-gray-300 text-black"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mb-4 p-2 border border-gray-300 text-black"
        />
        <div className="flex justify-between">
          <button type="submit" className="p-2 bg-blue-500 text-white">
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Submit"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 bg-red-500 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
      <div>
        {properties.map((property: any) => (
          <div key={property.id}>
            <h3>{property.name}</h3>
            <p>Type: {property.type}</p>
            <p>City: {property.city}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default PropertyForm;
