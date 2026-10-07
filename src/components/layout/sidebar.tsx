'use client';

import { useState, useEffect } from 'react';
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Optional: read collapse preference from localStorage
    try {
      const saved = localStorage.getItem('facielis_sidebar_collapsed');
      if (saved !== null) setCollapsed(saved === 'true');
    } catch {}
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('facielis_sidebar_collapsed', String(next));
    } catch {}
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted || !user) {
    return (
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-screen sticky top-0 z-30" />
    );
  }

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
    { href: '/manager/owner-questions', label: 'Owner Questionnaires', icon: HelpCircle },
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

  const ownerLinks = [
    { href: '/owner', label: 'Owner Command Center', icon: LayoutDashboard },
    { href: '/owner/questionnaire', label: '15-Day Questionnaire', icon: CheckSquare },
    { href: '/owner/defects', label: 'Report Venue Defect', icon: AlertTriangle },
    { href: '/owner/audit-reports', label: 'Auditor Reports', icon: ClipboardList },
    { href: '/owner/repairs', label: 'Technician Repair Logs', icon: Wrench },
  ];

  let navLinks = adminLinks;
  if (role === 'MANAGER') navLinks = managerLinks;
  if (role === 'AUDITOR') navLinks = auditorLinks;
  if (role === 'TECHNICIAN') navLinks = technicianLinks;
  if (role === 'OWNER') navLinks = ownerLinks;

  const renderNavContent = (isCollapsedMode = false) => (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className={`border-b border-gray-100 flex items-center justify-between ${isCollapsedMode ? 'p-4 justify-center' : 'p-5'}`}>
        <div className={`flex items-center gap-2.5 ${isCollapsedMode ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-[#173B72] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
            F
          </div>
          {!isCollapsedMode && (
            <div className="overflow-hidden transition-all duration-200">
              <h1 className="font-black text-xl tracking-tight text-[#173B72] leading-none">FACIELIS</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Facility Assurance</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle (only in desktop sidebar) */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title={isCollapsedMode ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsedMode ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge */}
      {!isCollapsedMode ? (
        <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Role:</span>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#173B72]/10 text-[#173B72]">
            {role.replace('_', ' ')}
          </span>
        </div>
      ) : (
        <div className="py-2 border-b border-gray-100 flex justify-center">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#173B72]"
            title={`Role: ${role.replace('_', ' ')}`}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const rootPaths = ['/admin', '/manager', '/auditor', '/technician', '/owner'];
          const isRootPath = rootPaths.includes(link.href);
          const isActive = isRootPath
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link
              key={link.href + link.label}
              href={link.href}
              prefetch={true}
              onClick={() => setMobileOpen(false)}
              title={isCollapsedMode ? link.label : undefined}
              className={`group flex items-center rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isCollapsedMode ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'border-l-4 border-l-[#173B72] bg-[#173B72]/10 text-[#173B72] font-bold shadow-2xs'
                  : 'border-l-4 border-l-transparent text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#173B72]' : 'text-gray-500 group-hover:text-gray-900'
                }`}
              />
              {!isCollapsedMode && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className={`border-t border-gray-100 bg-gray-50/60 flex items-center ${isCollapsedMode ? 'p-3 flex-col gap-2' : 'p-4 justify-between'}`}>
        {!isCollapsedMode ? (
          <>
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div
              className="w-8 h-8 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-default"
              title={`${user.name} (${user.email})`}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar (visible on < lg screens) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#173B72] text-white flex items-center justify-center font-black text-base shadow-sm">
            F
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-[#173B72]">FACIELIS</h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Facility Assurance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#173B72]/10 text-[#173B72]">
            {role.replace('_', ' ')}
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sticky Sidebar (visible on >= lg screens, collapsible w-20 / w-64) */}
      <aside
        className={`hidden lg:flex border-r border-gray-200 flex-col h-screen sticky top-0 z-30 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Drawer (visible on < lg screens when mobileOpen === true) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sidebar Content */}
          <aside className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col">
            {renderNavContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
