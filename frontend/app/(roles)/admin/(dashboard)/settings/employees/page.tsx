import { redirect } from "next/navigation";

export default function SettingsEmployeesRedirectPage() {
  redirect("/admin/employees");
}
