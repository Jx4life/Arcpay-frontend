import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  Send,
  History,
  ArrowRightLeft,
  Menu,
  Plus,
  CreditCard,
  Settings,
} from "lucide-react";

/**
 * Sidebar component
 *
 * Props:
 * - isOpen: boolean - whether the sidebar is expanded (controls width / labels)
 * - currentView: string - the currently active view (dashboard, payrolls, employees, payments, history)
 * - onViewChange: (view: string) => void - callback when user selects a view
 * - onBridgeClick: () => void - callback to open bridge modal
 *
 * Notes:
 * - The component uses `NavLink` so the URL is kept in sync with react-router.
 * - It also calls `onViewChange` to update any parent-local state the app relies on.
 */
export default function Sidebar({
  isOpen = true,
  currentView = "dashboard",
  onViewChange = () => {},
  onBridgeClick = () => {},
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/app/dashboard", Icon: Home },
    { id: "payrolls", label: "Payrolls", to: "/app/payrolls", Icon: FileText },
    { id: "employees", label: "Employees", to: "/app/employees", Icon: Users },
    { id: "payments", label: "Payments", to: "/app/payments", Icon: Send },
    { id: "history", label: "History", to: "/app/history", Icon: History },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Brand / Logo */}
      <div className="h-20 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center font-bold">
            A
          </div>
          {isOpen && (
            <div>
              <div className="text-sm font-bold text-black">ArcPay</div>
              <div className="text-xs text-gray-500">Payroll on-chain</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(({ id, label, to, Icon }) => (
            <li key={id}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    isActive || currentView === id
                      ? "bg-gray-100 font-semibold text-black"
                      : "text-gray-600"
                  }`
                }
                onClick={() => onViewChange(id)}
              >
                <Icon size={18} />
                {isOpen && <span className="truncate">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            onClick={() => {
              onBridgeClick();
              // keep the URL context but don't navigate away — bridge is a modal
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <ArrowRightLeft size={18} />
            {isOpen && <span className="truncate">Bridge USDC</span>}
          </button>

          <NavLink
            to="/app/payrolls"
            className="mt-3 w-full inline-flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            onClick={() => onViewChange("payrolls")}
          >
            <Plus size={18} />
            {isOpen && <span>Create Payroll</span>}
          </NavLink>
        </div>
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <Menu size={16} />
          </div>
          {isOpen ? (
            <div className="flex-1">
              <div className="text-sm font-medium text-black">Account</div>
              <div className="text-xs text-gray-500">Manage settings</div>
            </div>
          ) : null}
        </div>

        {isOpen && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NavLink
              to="/app/settings"
              className="text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100"
              onClick={() => onViewChange("settings")}
            >
              <Settings size={14} />
              Settings
            </NavLink>

            <NavLink
              to="/app/billing"
              className="text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100"
              onClick={() => onViewChange("billing")}
            >
              <CreditCard size={14} />
              Billing
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
