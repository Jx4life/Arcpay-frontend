import React from "react";
import { Send, DollarSign } from "lucide-react";

/**
 * PaymentsPage
 *
 * Props:
 * - fundAmount: string - controlled value for the fund amount input
 * - setFundAmount: (val: string) => void - setter for the fundAmount
 * - fundContract: () => Promise<void> - handler to fund the selected payroll contract
 * - employees: Array - list of employees (expected fields: address, name, salary, isActive, totalPaid)
 * - payAllEmployees: () => Promise<void> - handler to pay all employees
 * - paySingleEmployee: (address: string) => Promise<void> - handler to pay a single employee
 * - loading: boolean - whether an action is in progress
 *
 * This component is UI-only and delegates the business logic back to the parent
 * via the supplied handlers. It mirrors the Payments view previously embedded
 * in the main app but is split out as a dedicated page to be used with react-router.
 */
export default function PaymentsPage({
  fundAmount = "",
  setFundAmount = () => {},
  fundContract = async () => {},
  employees = [],
  payAllEmployees = async () => {},
  paySingleEmployee = async () => {},
  loading = false,
}) {
  const activeEmployees = Array.isArray(employees)
    ? employees.filter((e) => e && e.isActive)
    : [];

  return (
    <div className="space-y-6">
      {/* Fund Contract */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Fund Contract</h3>
          <div className="text-sm text-gray-500">
            Use USDC to top up the payroll contract
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-2">
              Approves USDC and deposits to the selected payroll contract.
            </div>
          </div>

          <div className="w-40 flex-shrink-0">
            <button
              onClick={fundContract}
              disabled={loading || !fundAmount || Number(fundAmount) <= 0}
              className="w-full bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              <DollarSign size={16} />
              {loading ? "Processing..." : "Fund"}
            </button>
          </div>
        </div>
      </div>

      {/* Pay Employees */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Pay Employees</h3>

          {activeEmployees.length > 0 ? (
            <button
              onClick={payAllEmployees}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              Pay All
            </button>
          ) : null}
        </div>

        {activeEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No active employees</div>
        ) : (
          <div className="space-y-3">
            {activeEmployees.map((e, i) => (
              <div
                key={e?.address || i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-black">{e?.name || "Unknown"}</div>
                  <div className="text-sm text-gray-600">{e?.salary} USDC</div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">{e?.address}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 text-right mr-2">
                    <div className="font-semibold text-black">
                      {e?.totalPaid ?? "0.00"} USDC
                    </div>
                    <div className="text-xs">Total Paid</div>
                  </div>

                  <button
                    onClick={() => paySingleEmployee(e.address)}
                    disabled={loading}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send size={14} />
                    Pay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
