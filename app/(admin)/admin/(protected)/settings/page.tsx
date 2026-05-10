import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, siteTitle: "Urdu Courses" },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Global Settings</h1>
      <SettingsForm initial={settings as any} />
    </div>
  );
}
