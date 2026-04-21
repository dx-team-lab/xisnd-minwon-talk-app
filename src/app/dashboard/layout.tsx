'use client';

import ApprovalGuard from '@/components/common/ApprovalGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ApprovalGuard>{children}</ApprovalGuard>;
}
