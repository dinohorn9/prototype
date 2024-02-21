"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { unique } from "../lib/utils";

const PropertyForm: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const [properties, setProperties] = useState<Document[]>([]); // Update the type of properties state
  // Get unique types and cities
  const types = unique(properties.map((property) => property.type));
  const cities = unique(properties.map((property) => property.city));
  // Filter properties based on selected type and city
  const filteredProperties = properties.filter((property: Document & { city: string, type: string }) => {
    return (
      (filterType ? property.type === filterType : true) &&
      (filterCity ? property.city === filterCity : true)
    );
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setProperties(data as Document[]); // Update the type of properties state
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
      // Fetch the latest documents from the 'properties' collection
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const data = querySnapshot.docs.map((doc) => doc.data()) as Document[];
      setProperties(data);
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
      <div className="flex space-x-4 mb-4 mt-10">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="form-select block w-full mt-1 text-black"
        >
          <option value="">Filter by type</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="form-select block w-full mt-1 text-black"
        >
          <option value="">Filter by city</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((property: any) => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.city}</div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PropertyForm;
