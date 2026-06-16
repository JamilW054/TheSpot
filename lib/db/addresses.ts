import { createClient } from "@/lib/supabase/server";

export interface Address {
  id: string;
  label?: string | null;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  countryCode: string;
  phone?: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  label?: string | null;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  countryCode?: string;
  phone?: string | null;
  isDefault?: boolean;
}

function mapRow(row: Record<string, unknown>): Address {
  return {
    id: row.id as string,
    label: (row.label as string | null) ?? null,
    fullName: row.full_name as string,
    addressLine1: row.address_line1 as string,
    addressLine2: (row.address_line2 as string | null) ?? null,
    city: row.city as string,
    postalCode: row.postal_code as string,
    countryCode: row.country_code as string,
    phone: (row.phone as string | null) ?? null,
    isDefault: row.is_default as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map(mapRow);
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: input.label ?? null,
      full_name: input.fullName,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2 ?? null,
      city: input.city,
      postal_code: input.postalCode,
      country_code: input.countryCode ?? "DO",
      phone: input.phone ?? null,
      is_default: input.isDefault ?? false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateAddress(
  id: string,
  input: Partial<AddressInput>,
): Promise<Address> {
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.label !== undefined) patch.label = input.label;
  if (input.fullName !== undefined) patch.full_name = input.fullName;
  if (input.addressLine1 !== undefined) patch.address_line1 = input.addressLine1;
  if (input.addressLine2 !== undefined) patch.address_line2 = input.addressLine2;
  if (input.city !== undefined) patch.city = input.city;
  if (input.postalCode !== undefined) patch.postal_code = input.postalCode;
  if (input.countryCode !== undefined) patch.country_code = input.countryCode;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.isDefault !== undefined) patch.is_default = input.isDefault;

  const { data, error } = await supabase
    .from("addresses")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteAddress(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setDefaultAddress(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
