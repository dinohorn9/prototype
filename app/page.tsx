
import LocationFinder from "../components/LocationFinder";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>App</h1>
      <h2>Add and List/Filter Properties for Sale</h2>

      <LocationFinder />

    </div >
  )
}