import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * PayrollsPage
 *
 * Props:
 * - userPayrolls: array - list of payrolls for the connected user
 * - loading: boolean - whether payrolls are being loaded
 * - companyName: string - controlled value for the create payroll input
 * - setCompanyName: (name: string) => void - setter for companyName
 * - createNewPayroll: () => Promise<void> - handler to create a payroll
 * - onSelectPayroll: (payroll: object) => void - handler when a payroll is selected
 *
 * Notes:
 * This component keeps UI responsibilities only. When a payroll is selected it
 * calls `onSelectPayroll` and navigates to `/dashboard`.
 */
export default function PayrollsPage({
  userPayrolls = [],
  loading = false,
  companyName = "",
  setCompanyName = () => {},
  createNewPayroll = async () => {},
  onSelectPayroll = () => {},
}) {
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    await createNewPayroll();
  };

  const handleSelect = (p) => {
    if (onSelectPayroll) {
      onSelectPayroll(p);
    }
    // Navigate to dashboard after selecting payroll
    try {
      navigate("/dashboard");
    } catch (err) {
      // Fallback: modify history if useNavigate not available
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/dashboard");
        // trigger popstate listeners if any
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">Create New Payroll</h3>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-black mb-4">
          Your Payrolls ({userPayrolls ? userPayrolls.length : 0})
        </h3>

        {loading && (!userPayrolls || userPayrolls.length === 0) ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : !userPayrolls || userPayrolls.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No payrolls yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {userPayrolls.map((p, i) => (
              <div
                key={p?.payrollContract || i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-black">
                    {p.companyName || "Untitled Company"}
                  </div>
                  <div className="font-mono text-sm text-gray-600">
                    {p.payrollContract
                      ? `${String(p.payrollContract).slice(0, 10)}...${String(
                          p.payrollContract,
                        ).slice(-8)}`
                      : "—"}
                  </div>
                  {p.createdAt && (
                    <div className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(Number(p.createdAt) * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelect(p)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    Manage
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
