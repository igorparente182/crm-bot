import { createClient } from "@/lib/supabase/server";
import { TasksList } from "./tasks-list";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
};

export default async function TasksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });
  return <TasksList rows={(data ?? []) as Task[]} />;
}
