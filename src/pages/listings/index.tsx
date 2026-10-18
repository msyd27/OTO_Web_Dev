import ListingsTable from "@/components/ListingsTable";

export default function ListingsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-[var(--brand)] mb-4">All Listings</h1>
      <ListingsTable />
    </section>
  );
}
