"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function userOrThrow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

// OPPORTUNITIES
export async function createOpportunity(formData: FormData) {
  const { supabase, user } = await userOrThrow();
  const title = String(formData.get("title") ?? "").trim();
  const value = Number(formData.get("value") ?? 0);
  const stage_id = String(formData.get("stage_id") ?? "");
  const person_id = (formData.get("person_id") as string) || null;
  const company_id = (formData.get("company_id") as string) || null;
  if (!title || !stage_id) throw new Error("Campos obrigatórios faltando");

  await supabase.from("opportunities").insert({
    title,
    value: isFinite(value) ? value : 0,
    stage_id,
    person_id,
    company_id,
    user_id: user.id,
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/opportunities");
}

export async function moveOpportunity(id: string, stageId: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("opportunities").update({ stage_id: stageId }).eq("id", id);
  revalidatePath("/dashboard");
}

export async function deleteOpportunity(id: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("opportunities").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/opportunities");
}

// PEOPLE
export async function createPerson(formData: FormData) {
  const { supabase, user } = await userOrThrow();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const job_title = String(formData.get("job_title") ?? "").trim();
  const company_id = (formData.get("company_id") as string) || null;
  if (!name) throw new Error("Nome obrigatório");
  await supabase.from("people").insert({
    name,
    email: email || null,
    phone: phone || null,
    job_title: job_title || null,
    company_id,
    user_id: user.id,
  });
  revalidatePath("/dashboard/people");
}

export async function deletePerson(id: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("people").delete().eq("id", id);
  revalidatePath("/dashboard/people");
}

// COMPANIES
export async function createCompany(formData: FormData) {
  const { supabase, user } = await userOrThrow();
  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const employees = Number(formData.get("employees") ?? 0);
  if (!name) throw new Error("Nome obrigatório");
  await supabase.from("companies").insert({
    name,
    domain: domain || null,
    industry: industry || null,
    city: city || null,
    employees: employees > 0 ? employees : null,
    user_id: user.id,
  });
  revalidatePath("/dashboard/companies");
}

export async function deleteCompany(id: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("companies").delete().eq("id", id);
  revalidatePath("/dashboard/companies");
}

// NOTES
type NoteTarget = { opportunity_id?: string; person_id?: string; company_id?: string };

export async function createNote(body: string, target: NoteTarget) {
  const { supabase, user } = await userOrThrow();
  const text = body.trim();
  if (!text) return;
  await supabase.from("notes").insert({
    body: text,
    opportunity_id: target.opportunity_id ?? null,
    person_id: target.person_id ?? null,
    company_id: target.company_id ?? null,
    user_id: user.id,
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/opportunities");
  revalidatePath("/dashboard/people");
  revalidatePath("/dashboard/companies");
}

export async function deleteNote(id: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("notes").delete().eq("id", id);
  revalidatePath("/dashboard");
}

// TASKS
export async function createTask(formData: FormData) {
  const { supabase, user } = await userOrThrow();
  const title = String(formData.get("title") ?? "").trim();
  const due_date = String(formData.get("due_date") ?? "").trim() || null;
  if (!title) throw new Error("Título obrigatório");
  await supabase.from("tasks").insert({
    title,
    due_date,
    user_id: user.id,
  });
  revalidatePath("/dashboard/tasks");
}

export async function toggleTask(id: string, done: boolean) {
  const { supabase } = await userOrThrow();
  await supabase.from("tasks").update({ done }).eq("id", id);
  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(id: string) {
  const { supabase } = await userOrThrow();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/dashboard/tasks");
}
