"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { unique } from "../lib/utils";

/**
 * Represents a document with various properties.
 */
interface Document {
  id: string;
  name: string;
  type: string;
  city: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  url: string;
  address: string;
  address2: string;
  state: string;
  zip: string;
  country: string;
  // add other fields as necessary
}

/**
 * Represents a form component for managing properties.
 * @component
 */

const PropertyForm: React.FC = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [url, setUrl] = useState('');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [properties, setProperties] = useState<Document[]>([]);
  // Get unique types and cities
  const types = unique(properties.map((property) => property.type));
  const cities = unique(properties.map((property) => property.city));
  // Filter properties based on selected type and city
  const filteredProperties = properties.filter((property: Document) => {
    return (
      (filterType ? property.type === filterType : true) &&
      (filterCity ? property.city === filterCity : true)
    );
  });

  useEffect(() => {
    const fetchProperties = async () => {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProperties(data as Document[]);
    };

    fetchProperties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "type":
        setType(value);
        break;
      case "city":
        setCity(value);
        break;
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "url":
        setUrl(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "address2":
        setAddress2(value);
        break;
      case "state":
        setState(value);
        break;
      case "zip":
        setZip(value);
        break;
      case "country":
        setCountry(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address || !city || !state || !zip) {
      setErrorMessage('name, address, city, state, zip are required.');
      return;
    }

    setIsLoading(true);

    try {
      await addDoc(collection(db, "properties"), {
        name,
        type,
        city,
        firstName,
        lastName,
        email,
        phone,
        url,
        address,
        address2,
        state,
        zip,
        country,
      });

      setName("");
      setType("");
      setCity("");
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setUrl('');
      setAddress('');
      setAddress2('');
      setState('');
      setZip('');
      setCountry('');
      setErrorMessage('');
      // Fetch the latest documents from the 'properties' collection
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Document[];
      setProperties(data);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    setIsLoading(false);
  };

  return (
    <>
      <div>
        <h2>Property Manager</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={phone}
            onChange={handleChange}
            required
            pattern="\d{10}"
          />
          <input
            type="text"
            name="type"
            placeholder="Business Type"
            value={type}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <h3>Properties</h3>
        <ul>
          {properties.map((property, index) => (
            <li key={property.id}>
              {property.firstName} {property.lastName} - {property.name}
            </li>
          ))}
        </ul>
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
      <div className="mt-8 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>

              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>URL</th>
              <th>Address</th>
              <th>Address 2</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th>State</th>
              <th>Zip</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProperties
              .sort((a: Document, b: Document) => a.name.localeCompare(b.name))
              .map((property: Document) => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.type}</div>
                  </td>

                  <td className="text-sm text-gray-900">{property.firstName}</td>
                  <td className="text-sm text-gray-900">{property.lastName}</td>
                  <td className="text-sm text-gray-900">{property.email}</td>
                  <td className="text-sm text-gray-900">{property.phone}</td>
                  <td className="text-sm text-gray-900">{property.url}</td>
                  <td className="text-sm text-gray-900">{property.address}</td>
                  <td className="text-sm text-gray-900">{property.address2}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.city}</div>
                  </td>
                  <td className="text-sm text-gray-900">{property.state}</td>
                  <td className="text-sm text-gray-900">{property.zip}</td>
                  <td className="text-sm text-gray-900">{property.country}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PropertyForm;