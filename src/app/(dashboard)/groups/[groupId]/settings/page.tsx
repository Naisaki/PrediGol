// app/(dashboard)/groups/[groupId]/settings/page.tsx
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function SettingsRootPage({ params }: PageProps) {
  const { groupId } = await params;
  redirect(`/groups/${groupId}/settings/general`);
}
