import { createClient } from "@/lib/supabase/server";
import { PeopleTable } from "./people-table";

export type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
};
export type CompanyOpt = { id: string; name: string };

export default async function PeoplePage() {
  const supabase = await createClient();
  const [{ data: peopleData }, { data: companiesData }] = await Promise.all([
    supabase.from("people").select("*").order("created_at", { ascending: false }),
    supabase.from("companies").select("id,name").order("name"),
  ]);
  return (
    <PeopleTable
      rows={(peopleData ?? []) as Person[]}
      companies={(companiesData ?? []) as CompanyOpt[]}
    />
  );
}
