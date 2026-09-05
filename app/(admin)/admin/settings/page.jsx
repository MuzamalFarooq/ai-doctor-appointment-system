import { getAuditLogs } from '@/actions/admin.actions';
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient';

export const metadata = {
  title: 'Platform Settings',
};

export default async function AdminSettingsPage() {
  const auditLogs = await getAuditLogs(20);
  return <AdminSettingsClient auditLogs={auditLogs} />;
}
