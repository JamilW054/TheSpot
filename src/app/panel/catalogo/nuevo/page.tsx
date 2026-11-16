import { redirect } from "next/navigation";

export default function PanelCatalogoNuevoPage() {
  redirect("/panel/catalogo?create=1");
}
