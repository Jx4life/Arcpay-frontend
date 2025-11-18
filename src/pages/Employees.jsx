import React from "react";
import { Users, UserPlus, CreditCard } from "lucide-react";

/**
 * EmployeesPage
 *
 * Props:
 * - employees: Array of employee objects (address, name, role, salary, isActive, totalPaid, hasOptedIn, hireDate)
 * - newEmployee: { address, salary, name, role } - controlled form state for adding an employee
 * - setNewEmployee: function to update newEmployee
 * - addOrUpdateEmployee: async function to call when creating/updating an employee
 *
 * This component is UI-only and delegates actions back to its parent via props.
 */
export default function EmployeesPage({
  employees = [],
  newEmployee = { address: "", salary: "", name: "", role: "" },
  setNewEmployee = () => {},
  addOrUpdateEmployee = async () => {},
  loading = false,
}) {
  const activeEmployees = employees.filter((e) => e?.isActive);
  const inactiveEmployees = employees.filter((e) => !e?.isActive);

  const handleChange = (field) => (e) =>
    setNewEmployee({ ...newEmployee, [field]: e.target.value });

  const canSubmit =
    newEmployee &&
    newEmployee.address &&
    newEmployee.salary &&
    newEmployee.name &&
    newEmployee.role &&
    !loading;

  return (
    <div className="space-y-6">
      {/* Add / Update Employee */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Add New Employee</h3>
          <div className="text-sm text-gray-500">
            Active employees:{" "}
            <span className="font-semibold text-black">
              {activeEmployees.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newEmployee.name}
            onChange={handleChange("name")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="text"
            placeholder="Role"
            value={newEmployee.role}
            onChange={handleChange("role")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Wallet Address (0x...)"
            value={newEmployee.address}
            onChange={handleChange("address")}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="number"
            placeholder="Salary (USDC)"
            value={newEmployee.salary}
            onChange={handleChange("salary")}
            className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={addOrUpdateEmployee}
            disabled={!canSubmit}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Add Employee"}
          </button>
        </div>
      </div>

      {/* Active Employees */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">
            Active Employees ({activeEmployees.length})
          </h3>
        </div>

        {activeEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No active employees</div>
        ) : (
          <div className="space-y-3">
            {activeEmployees.map((e, i) => (
              <div
                key={e.address || i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-semibold text-black truncate">
                      {e.name || "Unknown"}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">
                      {e.role || "No role"}
                    </span>
                  </div>

                  <div className="font-mono text-sm text-gray-600 truncate">
                    {e.address}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="text-lg font-semibold text-black">
                      {e.salary} USDC/month
                    </div>
                    <div className="text-xs text-gray-500">
                      Total Paid: {e.totalPaid ?? "0.00"} USDC
                    </div>
                    {e.hireDate && (
                      <div className="text-xs text-gray-500">
                        Hired: {new Date(Number(e.hireDate) * 1000).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  {/* Placeholder actions - parent should provide actual behavior */}
                  <button
                    onClick={() => {
                      // allow copying address
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(e.address || "");
                      }
                    }}
                    title="Copy address"
                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive / Other Employees */}
      {inactiveEmployees.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-black mb-4">
            Inactive Employees ({inactiveEmployees.length})
          </h3>

          <div className="space-y-2">
            {inactiveEmployees.map((e, i) => (
              <div
                key={e.address || i}
                className="p-3 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-black">{e.name || "Unknown"}</div>
                  <div className="font-mono text-sm text-gray-600">{e.address}</div>
                </div>

                <div className="text-sm text-gray-500">
                  <div>Salary: {e.salary ?? "—"} USDC</div>
                  <div>Total Paid: {e.totalPaid ?? "0.00"} USDC</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
