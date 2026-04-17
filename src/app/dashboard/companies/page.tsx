import { createClient } from "@/lib/supabase/server";
import { CompaniesTable } from "./companies-table";

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  city: string | null;
  employees: number | null;
};

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });
  return <CompaniesTable rows={(data ?? []) as Company[]} />;
}
