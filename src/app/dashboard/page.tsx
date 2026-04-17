import { createClient } from "@/lib/supabase/server";
import { Board } from "./board";

export type Stage = {
  id: string;
  name: string;
  color: string;
  position: number;
};
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
export type Person = { id: string; name: string };
export type Company = { id: string; name: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: stagesData }, { data: oppData }, { data: peopleData }, { data: companiesData }] =
    await Promise.all([
      supabase.from("stages").select("*").order("position"),
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("people").select("id,name").order("name"),
      supabase.from("companies").select("id,name").order("name"),
    ]);

  return (
    <Board
      stages={(stagesData ?? []) as Stage[]}
      opportunities={(oppData ?? []) as Opportunity[]}
      people={(peopleData ?? []) as Person[]}
      companies={(companiesData ?? []) as Company[]}
    />
  );
}
