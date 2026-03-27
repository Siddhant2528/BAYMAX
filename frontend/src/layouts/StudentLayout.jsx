import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { LayoutDashboard } from 'lucide-react';

const studentNav = [
  { nameKey: 'nav_dashboard', href: '/student/dashboard', icon: LayoutDashboard },
];

export default function StudentLayout() {
  return (
    <DashboardLayout navigationItems={studentNav} role="STUDENT">
      <Outlet />
    </DashboardLayout>
  );
}
