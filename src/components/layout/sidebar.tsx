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
  Shield,
} from 'lucide-react';

export function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted || !user) {
    return (
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 z-30" />
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
      <div
        className={`border-b border-slate-100 flex items-center justify-between ${
          isCollapsedMode ? 'p-3 justify-center' : 'px-4 py-3.5'
        }`}
      >
        <div className={`flex items-center gap-2.5 ${isCollapsedMode ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-[#173B72] text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 tracking-tight">
            F
          </div>
          {!isCollapsedMode && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-slate-900 leading-none">FACIELIS</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Facility Assurance</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={isCollapsedMode ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsedMode ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Pill */}
      {!isCollapsedMode ? (
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Workspace</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#173B72]/10 text-[#173B72]">
            {role.replace('_', ' ')}
          </span>
        </div>
      ) : (
        <div className="py-2 border-b border-slate-100 flex justify-center">
          <span
            className="w-2 h-2 rounded-full bg-[#173B72]"
            title={`Workspace: ${role.replace('_', ' ')}`}
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2.5 px-2 space-y-0.5">
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
              className={`group flex items-center rounded-lg text-xs transition-all duration-100 ${
                isCollapsedMode ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
              } ${
                isActive
                  ? 'bg-[#173B72]/8 text-[#173B72] font-semibold border-l-2 border-[#173B72]'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border-l-2 border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#173B72]' : 'text-slate-400 group-hover:text-slate-700'
                }`}
              />
              {!isCollapsedMode && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div
        className={`border-t border-slate-100 bg-slate-50/50 flex items-center ${
          isCollapsedMode ? 'p-2.5 flex-col gap-2' : 'p-3 justify-between'
        }`}
      >
        {!isCollapsedMode ? (
          <>
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-7 h-7 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <div
              className="w-7 h-7 rounded-full bg-[#173B72] text-white flex items-center justify-center text-xs font-bold cursor-default"
              title={`${user.name} (${user.email})`}
            >
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#173B72] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            F
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 leading-none">FACIELIS</h1>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Facility Assurance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#173B72]/10 text-[#173B72]">
            {role.replace('_', ' ')}
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex border-r border-slate-200 flex-col h-screen sticky top-0 z-30 transition-all duration-150 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {renderNavContent(collapsed)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative w-4/5 max-w-xs bg-white h-full shadow-xl z-10 flex flex-col border-r border-slate-200">
            {renderNavContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
