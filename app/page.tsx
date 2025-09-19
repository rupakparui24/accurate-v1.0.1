import { Dashboard } from "@/components/Dashboard";
import { getDashboardSnapshot } from "@/lib/mockDb";

export default async function HomePage() {
  const data = await getDashboardSnapshot();
  return <Dashboard initialData={data} />;
}
