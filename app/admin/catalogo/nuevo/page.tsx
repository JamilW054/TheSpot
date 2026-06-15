import { redirect } from "next/navigation";

export default function AdminCatalogoNuevoPage() {
  redirect("/admin/catalogo?create=1");
}
