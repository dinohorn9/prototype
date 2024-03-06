
import PropertyManager from "@/components/PropertyManager";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl md:text-4xl lg:text-5xl mb-8">Manage Properties for Sale</h1>
      <PropertyManager />
    </div>


  )
}


