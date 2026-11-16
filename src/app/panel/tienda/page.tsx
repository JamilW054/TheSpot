import { AdminPageHeader } from "@/components/admin/ui";
import { getStoreById } from "@/database/repositories/stores";
import { requirePanelStore } from "@/lib/auth/store-actor";
import { StoreProfileClient } from "./StoreProfileClient";

export const dynamic = "force-dynamic";

export default async function PanelTiendaPage() {
  const actor = await requirePanelStore();
  const store = await getStoreById(actor.store.id);
  if (!store) return null;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Mi tienda"
        description="Logo, portada, descripción y datos de contacto que verán tus clientes."
        breadcrumbs={[
          { label: "Panel", href: "/panel" },
          { label: "Mi tienda" },
        ]}
      />
      <StoreProfileClient
        initial={{
          name: store.name,
          tagline: store.tagline,
          description: store.description,
          businessType: store.businessType,
          legalName: store.legalName,
          taxId: store.taxId,
          contactName: store.contactName ?? "",
          phone: store.phone ?? "",
          whatsapp: store.whatsapp,
          email: store.email ?? "",
          notificationEmail: store.notificationEmail,
          province: store.province ?? "",
          city: store.city,
          address: store.address,
          instagram: store.instagram,
          facebook: store.facebook,
          website: store.website,
          sellsCategories: store.sellsCategories,
          logoUrl: store.logoUrl,
          bannerUrl: store.bannerUrl,
          freeShippingMinCents: store.freeShippingMinCents,
        }}
      />
    </div>
  );
}
