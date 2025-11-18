import React from "react";
import { Users, Send, Calendar, Clock } from "lucide-react";

/**
 * DashboardPage
 *
 * Props:
 * - contractBalance: string | number - current contract USDC balance
 * - totalExpense: string | number - monthly expense
 * - paymentHistory: Array - list of past payments
 * - duePayments: Array - list of due payments
 * - onProcessDue: () => void - handler to process due payments
 * - onOpenSchedule: () => void - handler to open schedule modal
 * - onNavigate: (view: string) => void - navigate helper (keeps parent state in sync)
 */
export default function DashboardPage({
  contractBalance = "0.00",
  totalExpense = "0.00",
  paymentHistory = [],
  duePayments = [],
  onProcessDue = () => {},
  onOpenSchedule = () => {},
  onNavigate = () => {},
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Contract Balance</div>
          <div className="text-3xl font-bold text-black">
            {contractBalance} USDC
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Monthly Expense</div>
          <div className="text-3xl font-bold text-black">
            {totalExpense} USDC
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Payments</div>
          <div className="text-3xl font-bold text-black">
            {paymentHistory ? paymentHistory.length : 0}
          </div>
        </div>
      </div>

      {duePayments && duePayments.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={24} />
            <div>
              <div className="font-semibold text-yellow-900">
                {duePayments.length} Payment(s) Due
              </div>
              <div className="text-sm text-yellow-700">
                Process scheduled payments now
              </div>
            </div>
          </div>
          <button
            onClick={onProcessDue}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
          >
            Process Now
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate("employees")}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Users size={20} />
            <span className="font-medium">Add Employee</span>
          </button>

          <button
            onClick={() => onNavigate("payments")}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Send size={20} />
            <span className="font-medium">Make Payment</span>
          </button>

          <button
            onClick={onOpenSchedule}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <Calendar size={20} />
            <span className="font-medium">Schedule Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
