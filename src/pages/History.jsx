import React from "react";
import { History as HistoryIcon } from "lucide-react";

/**
 * HistoryPage
 *
 * Props:
 * - paymentHistory: Array of payment records. Each record is expected to have:
 *   - employee: string (address)
 *   - amount: string | number | bigint (amount in smallest unit e.g. USDC with 6 decimals, or already human-readable)
 *   - timestamp: string | number (seconds since epoch)
 *   - note: string (optional)
 *
 * The component will try to format common on-chain shapes (e.g. integer amounts in 6-decimal USDC)
 * and gracefully fallback if data is already human-readable.
 */
export default function HistoryPage({ paymentHistory = [] }) {
  const formatAmount = (amt) => {
    if (amt == null) return "0.00 USDC";

    // If amount looks like a plain number string or number, try to format as micro-units (6 decimals)
    try {
      // First try BigInt conversion (handles large integer-like strings)
      const maybeBigInt = (() => {
        // If it's already a bigint, use it
        if (typeof amt === "bigint") return amt;
        // If it's a number but not integer, use number path
        if (typeof amt === "number" && !Number.isInteger(amt)) {
          return null;
        }
        // If it's a string containing only digits, treat as integer (smallest unit)
        if (typeof amt === "string" && /^\d+$/.test(amt)) {
          return BigInt(amt);
        }
        // If it's a number integer
        if (typeof amt === "number" && Number.isInteger(amt)) {
          return BigInt(amt);
        }
        return null;
      })();

      if (maybeBigInt !== null) {
        const asNumber = Number(maybeBigInt) / 1e6; // assume 6 decimals (USDC)
        return `${asNumber.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })} USDC`;
      }

      // Fallback: try parsing as a float (maybe already human readable)
      const floatVal = parseFloat(String(amt));
      if (!isNaN(floatVal)) {
        // If value is clearly very large, it's probably in smallest units -> divide
        if (Math.abs(floatVal) > 1e6) {
          const asNumber = floatVal / 1e6;
          return `${asNumber.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })} USDC`;
        }
        return `${floatVal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })} USDC`;
      }

      // Final fallback: return raw value
      return String(amt);
    } catch (e) {
      // If BigInt conversion fails or environment doesn't support it, attempt numeric parse fallback
      const n = Number(amt);
      if (!isNaN(n)) {
        if (Math.abs(n) > 1e6) {
          return `${(n / 1e6).toFixed(2)} USDC`;
        }
        return `${n.toFixed(2)} USDC`;
      }
      return String(amt);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts && ts !== 0) return "—";
    try {
      // Some records store timestamp in seconds, some in milliseconds.
      const asNum = Number(ts);
      if (isNaN(asNum)) return String(ts);
      const maybeMs = asNum > 1e12 ? asNum : asNum * 1000;
      return new Date(maybeMs).toLocaleString();
    } catch (e) {
      return String(ts);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <HistoryIcon size={20} />
        <h3 className="text-lg font-bold text-black">Payment History</h3>
      </div>

      {(!paymentHistory || paymentHistory.length === 0) && (
        <div className="text-center py-8 text-gray-600">No payment history yet</div>
      )}

      {paymentHistory && paymentHistory.length > 0 && (
        <div className="space-y-3">
          {paymentHistory.map((p, i) => {
            const employee = p?.employee ?? p?.receiver ?? p?.to ?? "Unknown";
            const note = p?.note ?? p?.memo ?? "";
            const amount = formatAmount(p?.amount ?? p?.value ?? p?.amountRaw);
            const time = formatTimestamp(p?.timestamp ?? p?.time);
            return (
              <div key={p?.id ?? `${employee}-${i}`} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-gray-800 truncate">{employee}</div>
                    {note && <div className="text-xs text-gray-600 mt-1">{note}</div>}
                  </div>

                  <div className="text-right ml-4">
                    <div className="font-semibold text-black">{amount}</div>
                    <div className="text-xs text-gray-500 mt-1">{time}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
