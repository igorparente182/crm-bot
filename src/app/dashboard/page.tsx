import { createClient } from "@/lib/supabase/server";
import { Board } from "./board";

export type Stage = {
  id: string;
  name: string;
  color: string;
  position: number;
};
export type Deal = {
  id: string;
  title: string;
  value: number;
  contact_name: string | null;
  stage_id: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: stagesData } = await supabase
    .from("stages")
    .select("*")
    .order("position", { ascending: true });
  const { data: dealsData } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  const stages = (stagesData ?? []) as Stage[];
  const deals = (dealsData ?? []) as Deal[];

  return <Board stages={stages} deals={deals} />;
}
