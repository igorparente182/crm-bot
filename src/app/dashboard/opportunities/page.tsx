import { createClient } from "@/lib/supabase/server";
import { OpportunitiesTable } from "./opportunities-table";

export type Opportunity = {
  id: string;
  title: string;
  value: number;
  stage_id: string;
  person_id: string | null;
  company_id: string | null;
  contact_name: string | null;
  created_at: string;
};

export type Stage = { id: string; name: string; color: string };
export type Lookup = { id: string; name: string };

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const [{ data: opps }, { data: stages }, { data: people }, { data: companies }] =
    await Promise.all([
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("stages").select("id,name,color").order("position"),
      supabase.from("people").select("id,name").order("name"),
      supabase.from("companies").select("id,name").order("name"),
    ]);
  return (
    <OpportunitiesTable
      rows={(opps ?? []) as Opportunity[]}
      stages={(stages ?? []) as Stage[]}
      people={(people ?? []) as Lookup[]}
      companies={(companies ?? []) as Lookup[]}
    />
  );
}
