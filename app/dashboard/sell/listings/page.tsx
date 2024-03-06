
import PropertyListingsManager from '@/components/PropertyListingsManager';

export default function ManageListing() {
  return (
    <div className="flex flex-col items-center justify-center  p-4">
      <h1 className="text-2xl md:text-4xl lg:text-5xl mb-8">Manage Listings for Sale</h1>
      <PropertyListingsManager />
    </div>
  )
}