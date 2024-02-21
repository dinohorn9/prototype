import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Prototype</h1>
      <PropertyForm />
    </div>
  );
}
