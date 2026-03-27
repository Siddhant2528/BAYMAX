import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Youtube, Users, ShieldCheck, PieChart } from 'lucide-react';

const adminNav = [
  { name: 'Manage Content', href: '/admin/dashboard', icon: Youtube },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Counselor Management', href: '/admin/counselors', icon: ShieldCheck },
  { name: 'Overall Analytics', href: '/admin/analytics', icon: PieChart },
];

export default function AdminLayout() {
  return (
    <DashboardLayout navigationItems={adminNav} role="ADMIN">
      <Outlet />
    </DashboardLayout>
  );
}
