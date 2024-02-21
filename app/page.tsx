import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Prototype</h1>
      <h2>Add and List/Filter Properties for Sale</h2>
      <PropertyForm />
    </div>
  )
}
