"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const title = String(formData.get("title") ?? "").trim();
  const value = Number(formData.get("value") ?? 0);
  const contact_name = String(formData.get("contact_name") ?? "").trim();
  const stage_id = String(formData.get("stage_id") ?? "");
  if (!title || !stage_id) throw new Error("Campos obrigatórios faltando");

  await supabase.from("deals").insert({
    title,
    value: isFinite(value) ? value : 0,
    contact_name: contact_name || null,
    stage_id,
    user_id: user.id,
  });
  revalidatePath("/dashboard");
}

export async function moveDeal(dealId: string, stageId: string) {
  const supabase = await createClient();
  await supabase.from("deals").update({ stage_id: stageId }).eq("id", dealId);
  revalidatePath("/dashboard");
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();
  await supabase.from("deals").delete().eq("id", dealId);
  revalidatePath("/dashboard");
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  if (!name) throw new Error("Nome obrigatório");

  await supabase.from("contacts").insert({
    name,
    email: email || null,
    phone: phone || null,
    company: company || null,
    user_id: user.id,
  });
  revalidatePath("/dashboard/contacts");
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", id);
  revalidatePath("/dashboard/contacts");
}
