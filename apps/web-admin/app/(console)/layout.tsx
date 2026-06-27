import { AdminConsoleLayoutClient } from "@/components/layout";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminConsoleLayoutClient>{children}</AdminConsoleLayoutClient>;
}
