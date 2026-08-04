'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Users,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  Wrench,
  Award,
  HelpCircle,
  BarChart3,
  Sliders,
  LogOut,
  Layers,
  History,
  CheckSquare,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/facilities', label: 'Facility Hierarchy', icon: Building2 },
    { href: '/admin/assets', label: 'Assets & Components', icon: Boxes },
    { href: '/admin/users', label: 'Users & Roles', icon: Users },
    { href: '/admin/departments', label: 'Departments', icon: Layers },
    { href: '/admin/rules', label: 'Rule Engine', icon: Sliders },
    { href: '/admin/audit-templates', label: 'Audit Templates', icon: ClipboardList },
    { href: '/admin/cross-audit-questions', label: 'Cross-Audit Questions', icon: HelpCircle },
    { href: '/admin/certificates', label: 'Facility Certificates', icon: Award },
  ];

  const managerLinks = [
    { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/manager/audit-schedule', label: 'Audit Schedules', icon: ClipboardList },
    { href: '/manager/defects', label: 'Open Defects', icon: AlertTriangle },
    { href: '/manager/assignments', label: 'Technician Assignments', icon: Wrench },
    { href: '/manager/repair-approvals', label: 'Technician Repair Approvals', icon: CheckSquare },
    { href: '/manager/sla', label: 'SLA Monitor', icon: ShieldCheck },
    { href: '/manager/reports', label: 'Facility Analytics', icon: BarChart3 },
    { href: '/manager/certificates', label: 'Certificate Approvals', icon: Award },
  ];

  const auditorLinks = [
    { href: '/auditor', label: 'Auditor Dashboard & Venues', icon: LayoutDashboard },
    { href: '/auditor/history', label: 'Audit History & Logs', icon: History },
  ];

  const technicianLinks = [
    { href: '/technician', label: 'Assigned Repair Jobs', icon: Wrench },
    { href: '/technician/history', label: 'Repair History & Logs', icon: History },
  ];

  let navLinks = adminLinks;
  if (role === 'MANAGER') navLinks = managerLinks;
  if (role === 'AUDITOR') navLinks = auditorLinks;
  if (role === 'TECHNICIAN') navLinks = technicianLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#173B72] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-[#173B72]">FACIELIS</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Facility Assurance</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic font-serif">"Where Facilities Earn Trust"</p>
      </div>

      {/* Role Badge */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Current Role:</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#173B72]/10 text-[#173B72]">
          {role.replace('_', ' ')}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/auditor' && link.href !== '/technician' && link.href !== '/manager' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#173B72] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="truncate pr-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
