import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cinematic Data Lab",
  description: "Advanced ML and Data Analytics Sandbox",
};

export default async function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/lab");
  }

  return <>{children}</>;
}
