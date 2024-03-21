"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Loader } from "@googlemaps/js-api-loader";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome CSS
import InputMask from "react-input-mask";

const PropertyManager: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
    desiredSellingPrice: "",
    priceMonthlyRentIncCAM: "",
    sqFt: "",
    areaLocatedIn: "",
    leaseTerms: "",
    includedInSale: "",
    aboutBusiness: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [phoneUnmasked, setPhoneUnmasked] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const apiKey: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  console.log(apiKey);

  useEffect(() => {
    // Basic validation: check if required fields are not empty and meet certain criteria
    const isValid =
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      phoneUnmasked &&
      /^\d{10}$/.test(phoneUnmasked) &&
      formData.businessName &&
      formData.address &&
      formData.city &&
      formData.state;
    setIsFormValid(!!isValid);
  }, [formData, phoneUnmasked]); // Update validation state every time formData changes

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      const loader = new Loader({
        apiKey: apiKey ?? "",
        version: "weekly",
        libraries: ["places"],
      });

      try {
        await loader.load();
        console.log("Google Maps JavaScript API loaded");
      } catch (error) {
        console.error("Error loading Google Maps JavaScript API:", error);
      }
    };

    fetchProperties();
    initializeGoogleMaps();
  }, [apiKey]);

  const fetchProperties = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "properties"));
      const data = querySnapshot.docs.map((doc) => doc.data());
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "phone") {
      // Update the unmasked phone number state
      setPhoneUnmasked(value.replace(/\D/g, ""));
    }
    if (name === "email") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setIsValidEmail(isValidEmail); // Update the form validation state
    }
  };
  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(`/api/place-details?place_id=${placeId}`);

      if (!response.ok) {
        // Handle HTTP errors
        throw new Error(
          `Failed to fetch place details: ${response.statusText}`
        );
      }
      const addressComponents = await response.json(); // Assuming this contains address_components directly
      console.log("API response data:", JSON.stringify(addressComponents)); // This will help you understand the structure of the response
      // Process and update form data with address components
      let streetNumber = "";
      let route = "";
      let address2 = "";
      let city = "";
      let state = "";
      let zipCode = "";

      const allAddressComponents = addressComponents.address_components;

      if (allAddressComponents && Array.isArray(allAddressComponents)) {
        allAddressComponents.forEach((component: any) => {
          const types = component.types;
          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          } else if (types.includes("route")) {
            route = component.long_name;
          } else if (types.includes("subpremise")) {
            address2 = component.long_name;
          } else if (types.includes("locality")) {
            city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          } else if (types.includes("postal_code")) {
            zipCode = component.long_name;
          }
        });
      } else {
        console.error("address_components is undefined or not an array");
      }

      const addressLine1 = `${streetNumber} ${route}`.trim();

      // Update the form state with the fetched address components
      setFormData((prevFormData) => ({
        ...prevFormData,
        address: addressLine1,
        address2,
        city,
        state,
        zipCode,
      }));
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleAddressSelect = (address: any) => {
    console.log(address); // Debugging
    setSelectedAddress(address);
    setFormData((prevFormData) => ({
      ...prevFormData,
      search: address.label, // Assuming 'label' is the correct property
    }));

    // Call fetchPlaceDetails to asynchronously update form state with address components
    const placeId = address.value.place_id;
    fetchPlaceDetails(placeId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check form validation state
    console.log(isFormValid); // Debugging
    if (!isFormValid) return;
    setIsFormValid(true);

    // Perform form validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !phoneUnmasked ||
      !formData.businessName ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phoneUnmasked)) {
      // Validate unmasked phone number value
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      await addDoc(collection(db, "properties"), formData);
      fetchProperties();

      // Reset the form fields after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        businessName: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zipCode: "",
        website: "",
        desiredSellingPrice: "",
        priceMonthlyRentIncCAM: "",
        sqFt: "",
        areaLocatedIn: "",
        leaseTerms: "",
        includedInSale: "",
        aboutBusiness: "",
      });

      // Reset the selected address
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error submitting property:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-2/5 px-2">

          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto p-4 shadow-lg rounded-lg"
          >
            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-base font-semibold text-gray-900">Notifications</label>
                <p className="text-sm text-gray-500">How do you prefer to receive notifications?</p>
                <fieldset className="mt-4">
                  <legend className="sr-only">Notification method</legend>
                  <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">

                    <div className="flex items-center">
                      <input

                        name="notification-method"
                        type="radio"
                        defaultChecked={false}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                        Active
                      </label>

                    </div>
                    <div className="flex items-center">
                      <input

                        name="notification-method"
                        type="radio"
                        defaultChecked={true}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                        Sold
                      </label>

                    </div>

                  </div>
                </fieldset>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="input pr-8" // Add some padding to the right to make space for the icon
                />
                {formData.businessName && (
                  <i className="fas fa-check text-green-500 absolute right-2 top-1/2 transform -translate-y-1/2"></i> // Adjust
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="input pr-8" // Add some padding to the right to make space for the icon
                />
                {formData.firstName && (
                  <i className="fas fa-check text-green-500 absolute right-2 top-1/2 transform -translate-y-1/2"></i> // Adjust
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="input pr-8" // Add some padding to the right to make space for the icon
                />
                {formData.lastName && (
                  <i className="fas fa-check text-green-500 absolute right-2 top-1/2 transform -translate-y-1/2"></i> // Adjust
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input pr-8" // Add some padding to the right to make space for the icon
                />
                {formData.email && isValidEmail && (
                  <i className="fas fa-check text-green-500 absolute right-2 top-1/2 transform -translate-y-1/2"></i> // Adjust
                )}
              </div>

              <InputMask
                mask="(999) 999-9999"
                maskChar=" "
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input"
              />


              {/* For GooglePlacesAutocomplete, ensure you apply styling via selectProps or a wrapper as needed */}
              <div className="input">
                <GooglePlacesAutocomplete
                  apiKey={apiKey}
                  selectProps={{
                    value: selectedAddress,
                    onChange: handleAddressSelect,
                    placeholder: "Enter address",
                    className: "w-full",
                  }}
                  autocompletionRequest={{
                    componentRestrictions: { country: ["us"] },
                  }}
                  onLoadFailed={(error) =>
                    console.error("Failed to load Google Places API", error)
                  }
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="address2"
                  placeholder="Address 2"
                  value={formData.address2}
                  onChange={handleChange}
                  className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                {formData.address2 && (
                  <i className="fas fa-check text-green-500 absolute right-2 top-1/2 transform -translate-y-1/2"></i> // Adjust
                )}
              </div>

              <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4 md:mb-0">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled
                    className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="w-full md:w-1/4 lg:w-1/3 px-2 mb-4 md:mb-0">
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled
                    className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="w-full md:w-1/4 lg:w-1/3 px-2 mb-4 md:mb-0">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>

              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="website"
                  placeholder="Website"
                  value={formData.website}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="desiredSellingPrice"
                  placeholder="Desired Selling Price"
                  value={formData.desiredSellingPrice}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="priceMonthlyRentIncCAM"
                  placeholder="Price Monthly Rent Including CAM"
                  value={formData.priceMonthlyRentIncCAM}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="sqFt"
                  placeholder="Square Feet"
                  value={formData.sqFt}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <input
                  type="text"
                  name="areaLocatedIn"
                  placeholder="Area Located In"
                  value={formData.areaLocatedIn}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <textarea
                  name="leaseTerms"
                  placeholder="Lease Terms"
                  value={formData.leaseTerms}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <textarea
                  name="includedInSale"
                  placeholder="Included In Sale"
                  value={formData.includedInSale}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex flex-col space-y-4">
                <label htmlFor="comment" className="block text-sm font-medium leading-6 text-gray-900">
                  Tell us about your property
                </label>
                <div className="mt-2">
                  <textarea
                    rows={4}
                    name="aboutBusiness"
                    value={formData.aboutBusiness}
                    onChange={handleChange}

                    className="input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"

                  />
                </div>
                <textarea
                  name="aboutBusiness"
                  placeholder="About Business"
                  value={formData.aboutBusiness}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <button
                type="submit"
                className={`btn ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={!isFormValid}
              >
                Submit
              </button>
            </div>
          </form>

        </div>
        <div className="w-full md:w-3/5 px-2 flex items-start justify-end relative">
          <div className="bg-green-800 text-white text-sm font-semibold p-2 rounded pr-3 pl-3 absolute top-0 right-0 px-2">
            LOCATION: {formData.city || "City"}, {formData.state || "State"}, {formData.zipCode || "Zip Code"}
          </div>
          <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:max-w-none">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Trusted by creators worldwide
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-gray-600">
                    Lorem ipsum dolor sit amet consect adipisicing possimus.
                  </p>
                </div>
                <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-2">

                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">{formData.sqFt || "N/A"}</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Square Footage</dd>
                  </div>
                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">$1,200</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Rent Price</dd>
                  </div>
                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">{formData.city || "City"}, {formData.state || "State"}</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Area</dd>
                  </div>
                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">{formData.leaseTerms || "12 Months"}</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Lease Terms</dd>
                  </div>
                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">{formData.city}, {formData.state}</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Equipment Asking Price</dd>
                  </div>
                  <div className="flex flex-col bg-gray-400/5 p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">12,999</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-gray-900">Equipment Asking Price</dd>
                  </div>

                </dl>
              </div>
            </div>
          </div>
        </div>

      </div>

      <h3>Properties</h3>
      <ul>
        {properties.map((property, index) => (
          <li key={index}>
            {property.firstName} {property.lastName} - {property.businessName} -{" "}
            {property.email} - {property.phone} - {property.address} -{" "}
            {property.address2} - {property.city}, {property.state}{" "}
            {property.zipCode}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyManager;
