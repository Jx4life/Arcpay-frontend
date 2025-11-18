import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { X, Menu } from "lucide-react";

import Sidebar from "./Sidebar";
import MessageAlert from "./MessageAlert";

import DashboardPage from "../pages/Dashboard";
import PayrollsPage from "../pages/Payrolls";
import EmployeesPage from "../pages/Employees";
import PaymentsPage from "../pages/Payments";
import HistoryPage from "../pages/History";

import { useOnboarding } from "../context/OnboardingContext";
import { formatUnits, parseUnits, getChainName } from "../utils";
import {
  USDC_ADDRESSES,
  USDC_ABI,
  CONTRACTS,
  FACTORY_ABI,
  PAYROLL_ABI,
  CHAINS,
} from "../utils/constants";

/**
 * MainApp
 *
 * This component contains the main authenticated application UI:
 * - Sidebar and top bar with account info
 * - Routes for dashboard / payrolls / employees / payments / history
 * - Modals for Bridge / Schedule (placeholder UI)
 *
 * It consumes web3 / account / onboarding helpers from `useOnboarding`
 * and keeps payroll-related state (selected payroll, employees, payroll operations)
 * locally.
 */
export default function MainApp() {
  // Onboarding / web3 state & helpers come from context
  const {
    web3,
    account,
    accountBalance,
    currentChainName,
    isCircleUser,
    circleUserData,
    disconnectWallet,
    showMessage,
    loadCurrentChainBalance,
  } = useOnboarding();

  // Local state for payrolls / UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

  const [userPayrolls, setUserPayrolls] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [contractBalance, setContractBalance] = useState("0");
  const [totalExpense, setTotalExpense] = useState("0");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [duePayments, setDuePayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [companyName, setCompanyName] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    address: "",
    salary: "",
    name: "",
    role: "",
  });
  const [fundAmount, setFundAmount] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    employee: "",
    amount: "",
    startDate: "",
    frequency: "2592000",
    isRecurring: true,
    totalPayments: "12",
    description: "",
  });

  const [showBridge, setShowBridge] = useState(false);
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [sourceChain, setSourceChain] = useState("Ethereum_Sepolia");
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [sourceChainBalance, setSourceChainBalance] = useState("0.00");

  // Local helper to mirror onboarding showMessage pattern
  const localShowMessage = (type, text) => {
    setMessage({ type, text });
    if (showMessage) {
      try {
        showMessage(type, text);
      } catch (e) {
        // ignore if onboarding showMessage isn't available
      }
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 8000);
  };

  // Effects: load payrolls + chain balances when web3/account change
  useEffect(() => {
    if (account && web3) {
      loadUserPayrolls();
      if (loadCurrentChainBalance) {
        // load from onboarding context if provided
        loadCurrentChainBalance().catch(() => {});
      } else {
        // fallback to local loader
        loadCurrentChainBalanceLocal().catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, web3, currentChainName]);

  useEffect(() => {
    if (selectedPayroll && web3) {
      loadPayrollData();
      loadDuePayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPayroll, web3]);

  useEffect(() => {
    if (account && web3 && showBridge) {
      loadSourceChainBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, account, web3, showBridge]);

  // Network check
  const checkNetwork = async () => {
    try {
      if (!web3) return false;
      const chainId = await web3.eth.getChainId();
      // 5042002 expected Arc Testnet in original code
      if (chainId !== BigInt(5042002)) {
        localShowMessage("error", "❌ Wrong network! Switch to Arc Testnet");
        return false;
      }
      return true;
    } catch (error) {
      localShowMessage("error", "❌ Network error");
      return false;
    }
  };

  // Local balance loader (if onboarding doesn't provide one)
  const loadCurrentChainBalanceLocal = async () => {
    if (!web3 || !account) return;
    try {
      const currentChainId = await web3.eth.getChainId();
      const usdcAddress = USDC_ADDRESSES[Number(currentChainId)];
      if (!usdcAddress) {
        return setSourceChainBalance("0.00");
      }
      const usdc = new web3.eth.Contract(USDC_ABI, usdcAddress);
      const balance = await usdc.methods.balanceOf(account).call();
      // set to accountBalance derived in onboarding if available; otherwise local state
      // prefer onboarding's accountBalance, so we won't overwrite it here
      return formatUnits(balance.toString(), 6);
    } catch (err) {
      console.error("Balance error:", err);
      return "0.00";
    }
  };

  const loadSourceChainBalance = async () => {
    if (!web3 || !account) return;
    try {
      const selectedChain = CHAINS.find((c) => c.id === sourceChain);
      if (!selectedChain) {
        setSourceChainBalance("0.00");
        return;
      }

      const usdcAddress = USDC_ADDRESSES[selectedChain.chainId];
      if (!usdcAddress) {
        setSourceChainBalance("0.00");
        return;
      }

      const currentChainId = await web3.eth.getChainId();

      if (Number(currentChainId) === selectedChain.chainId) {
        const usdc = new web3.eth.Contract(USDC_ABI, usdcAddress);
        const balance = await usdc.methods.balanceOf(account).call();
        setSourceChainBalance(formatUnits(balance.toString(), 6));
      } else {
        setSourceChainBalance("Switch to view");
      }
    } catch (error) {
      console.error("Source chain balance error:", error);
      setSourceChainBalance("0.00");
    }
  };

  // Payrolls & contract interactions
  const loadUserPayrolls = async () => {
    if (!web3 || !account) {
      setUserPayrolls([]);
      return [];
    }

    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, CONTRACTS.FACTORY);
      const payrollsInfo = await factory.methods.getUserPayrollsInfo(account).call();
      setUserPayrolls(payrollsInfo);
      setLoading(false);
      return payrollsInfo;
    } catch (error) {
      console.error("loadUserPayrolls error:", error);
      setUserPayrolls([]);
      setLoading(false);
      return [];
    }
  };

  const createNewPayroll = async () => {
    if (!companyName.trim()) {
      localShowMessage("error", "Enter company name");
      return;
    }
    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, CONTRACTS.FACTORY);
      await factory.methods.createPayroll(companyName).send({ from: account });
      localShowMessage("success", "✅ Payroll created!");
      setCompanyName("");
      await loadUserPayrolls();
    } catch (error) {
      console.error("createNewPayroll error:", error);
      localShowMessage("error", "Failed to create payroll");
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollData = async () => {
    if (!web3 || !selectedPayroll) return;
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);

      const [employeeAddresses, balance, expense, totalPayments] = await Promise.all([
        payroll.methods.viewEmployees().call(),
        payroll.methods.getContractBalance().call(),
        payroll.methods.getTotalSalaryExpense().call(),
        payroll.methods.getTotalPayments().call(),
      ]);

      const employeeData = await Promise.all(
        employeeAddresses.map(async (addr) => {
          try {
            const empData = await payroll.methods.getEmployee(addr).call();
            return {
              address: addr,
              salary: formatUnits(empData[0].toString(), 6),
              name: empData[1],
              role: empData[2],
              isActive: empData[3],
              hasOptedIn: empData[4],
              hireDate: empData[5],
              totalPaid: formatUnits(empData[6].toString(), 6),
            };
          } catch (err) {
            return null;
          }
        })
      );

      setEmployees(employeeData.filter((e) => e !== null));
      setContractBalance(formatUnits(balance.toString(), 6));
      setTotalExpense(formatUnits(expense.toString(), 6));

      const totalPaymentsNum = Number(totalPayments);

      if (totalPaymentsNum > 0 && employeeData.filter((e) => e !== null).length > 0) {
        try {
          const allEmployeePayments = [];

          for (const emp of employeeData.filter((e) => e !== null)) {
            try {
              const empHistory = await payroll.methods
                .getEmployeePaymentHistory(emp.address, 0, 100)
                .call({ from: account });

              if (empHistory.length > 0) {
                allEmployeePayments.push(...empHistory);
              }
            } catch (empError) {
              console.error(`Could not get history for ${emp.name}:`, empError);
            }
          }

          if (allEmployeePayments.length > 0) {
            allEmployeePayments.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
          }

          setPaymentHistory(allEmployeePayments);
        } catch (historyError) {
          console.error("Payment history error:", historyError);
          setPaymentHistory([]);
        }
      } else {
        setPaymentHistory([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Load payroll error:", error);
      localShowMessage("error", "❌ Failed to load data");
      setLoading(false);
    }
  };

  const loadDuePayments = async () => {
    if (!web3 || !selectedPayroll) {
      setDuePayments([]);
      return;
    }
    try {
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const due = await payroll.methods.getDuePayments().call();
      setDuePayments(due);
    } catch (error) {
      console.error("loadDuePayments error:", error);
      setDuePayments([]);
    }
  };

  const fundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      localShowMessage("error", "❌ Enter valid amount");
      return;
    }

    try {
      setLoading(true);
      const usdc = new web3.eth.Contract(USDC_ABI, CONTRACTS.USDC);
      const userBalance = await usdc.methods.balanceOf(account).call();
      const amountBigInt = parseUnits(fundAmount, 6);

      if (BigInt(userBalance) < amountBigInt) {
        localShowMessage("error", `❌ Insufficient USDC`);
        setLoading(false);
        return;
      }

      await usdc.methods
        .approve(selectedPayroll.payrollContract, amountBigInt.toString())
        .send({ from: account });

      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.fundContract(amountBigInt.toString()).send({ from: account });

      localShowMessage("success", `✅ Funded ${fundAmount} USDC!`);
      setFundAmount("");
      await loadPayrollData();
      if (loadCurrentChainBalance) await loadCurrentChainBalance();
    } catch (error) {
      console.error("fundContract error:", error);
      localShowMessage("error", `❌ Funding failed`);
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateEmployee = async () => {
    if (!newEmployee.address || !newEmployee.salary || !newEmployee.name || !newEmployee.role) {
      localShowMessage("error", "❌ Fill all fields");
      return;
    }

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const salaryInUsdc = parseUnits(newEmployee.salary, 6).toString();

      await payroll.methods
        .setSalary(newEmployee.address, salaryInUsdc, newEmployee.name, newEmployee.role)
        .send({ from: account });

      localShowMessage("success", "✅ Employee added!");
      setNewEmployee({ address: "", salary: "", name: "", role: "" });
      await loadPayrollData();
    } catch (error) {
      console.error("addOrUpdateEmployee error:", error);
      localShowMessage("error", `❌ Failed to add employee`);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!scheduleForm.employee || !scheduleForm.amount) {
      localShowMessage("error", "❌ Fill required fields");
      return;
    }

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const startTimestamp = new Date(scheduleForm.startDate).getTime() / 1000;

      await payroll.methods
        .createPaymentSchedule(
          scheduleForm.employee,
          parseUnits(scheduleForm.amount, 6).toString(),
          startTimestamp,
          parseInt(scheduleForm.frequency),
          scheduleForm.isRecurring,
          parseInt(scheduleForm.totalPayments),
          scheduleForm.description
        )
        .send({ from: account });

      localShowMessage("success", "✅ Schedule created!");
      setShowScheduleModal(false);
      setScheduleForm({
        employee: "",
        amount: "",
        startDate: "",
        frequency: "2592000",
        isRecurring: true,
        totalPayments: "12",
        description: "",
      });
    } catch (error) {
      console.error("createSchedule error:", error);
      localShowMessage("error", "❌ Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  const processDuePayments = async () => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.processDuePayments().send({ from: account });
      localShowMessage("success", "✅ Due payments processed!");
      await loadPayrollData();
      await loadDuePayments();
    } catch (error) {
      console.error("processDuePayments error:", error);
      localShowMessage("error", "❌ No due payments");
    } finally {
      setLoading(false);
    }
  };

  const paySingleEmployee = async (employeeAddress) => {
    if (!(await checkNetwork())) return;

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const employee = employees.find((e) => e.address === employeeAddress);

      await payroll.methods.paySalary(employeeAddress).send({ from: account });
      localShowMessage("success", `✅ Paid ${employee?.name || employeeAddress}!`);
      await loadPayrollData();
      if (loadCurrentChainBalance) await loadCurrentChainBalance();
    } catch (error) {
      console.error("paySingleEmployee error:", error);
      localShowMessage("error", `❌ Payment failed`);
    } finally {
      setLoading(false);
    }
  };

  const payAllEmployees = async () => {
    if (!(await checkNetwork())) return;

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.payAllSalaries().send({ from: account });
      localShowMessage("success", "✅ All employees paid!");
      await loadPayrollData();
      if (loadCurrentChainBalance) await loadCurrentChainBalance();
    } catch (error) {
      console.error("payAllEmployees error:", error);
      localShowMessage("error", `❌ Bulk payment failed`);
    } finally {
      setLoading(false);
    }
  };

  const executeBridge = async () => {
    if (!bridgeAmount || parseFloat(bridgeAmount) <= 0) {
      localShowMessage("error", "❌ Enter valid amount");
      return;
    }

    try {
      setBridgeLoading(true);
      localShowMessage("info", "Starting bridge to Arc Testnet...");

      const { ArcBridge } = await import("../utils/arcBridge.js");
      const arcBridge = new ArcBridge();
      await arcBridge.initialize(window.ethereum);
      const result = await arcBridge.bridge(sourceChain, bridgeAmount, true);

      if (result.state === "success") {
        localShowMessage("success", `✅ Bridge successful! ${bridgeAmount} USDC arrived on Arc Testnet!`);
        setTimeout(() => {
          setShowBridge(false);
          setBridgeAmount("");
          if (loadCurrentChainBalance) loadCurrentChainBalance();
        }, 3000);
      } else {
        localShowMessage("error", "❌ Bridge failed. Check console.");
      }
    } catch (error) {
      console.error("Bridge error:", error);
      if (error?.message?.includes("Insufficient")) {
        localShowMessage("error", "❌ Insufficient USDC balance");
      } else if (error?.message?.includes("rejected")) {
        localShowMessage("error", "❌ Transaction rejected");
      } else {
        localShowMessage("error", "❌ Bridge failed: " + (error?.message || "unknown"));
      }
    } finally {
      setBridgeLoading(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        currentView={currentView}
        onViewChange={(view) => {
          if (view) setCurrentView(view);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onBridgeClick={() => setShowBridge(true)}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-20"}`}>
        <div className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h2 className="text-xl font-bold text-black">
                {currentView === "dashboard" && "Dashboard"}
                {currentView === "payrolls" && "Payrolls"}
                {currentView === "employees" && "Employees"}
                {currentView === "payments" && "Payments"}
                {currentView === "history" && "History"}
              </h2>
            </div>
          </div>

          {account && (
            <div className="flex items-center gap-4">
              {isCircleUser && (
                <div className="bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                  <div className="text-xs font-semibold text-purple-700">Circle Wallet</div>
                </div>
              )}

              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500">Balance</div>
                <div className="font-bold text-black">{accountBalance} USDC</div>
              </div>

              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-black">{currentChainName}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (disconnectWallet) disconnectWallet();
                }}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                {isCircleUser && circleUserData?.email
                  ? circleUserData.email.split("@")[0]
                  : `${account.slice(0, 6)}...${account.slice(-4)}`}
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <MessageAlert message={message} />

          <Routes>
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                selectedPayroll ? (
                  <DashboardPage
                    contractBalance={contractBalance}
                    totalExpense={totalExpense}
                    paymentHistory={paymentHistory}
                    duePayments={duePayments}
                    onProcessDue={processDuePayments}
                    onOpenSchedule={() => setShowScheduleModal(true)}
                    onNavigate={(view) => setCurrentView(view)}
                  />
                ) : (
                  <Navigate to="/app/payrolls" replace />
                )
              }
            />

            <Route
              path="/payrolls"
              element={
                <PayrollsPage
                  userPayrolls={userPayrolls}
                  loading={loading}
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  createNewPayroll={createNewPayroll}
                  onSelectPayroll={(p) => {
                    setSelectedPayroll(p);
                  }}
                />
              }
            />

            <Route
              path="/employees"
              element={
                selectedPayroll ? (
                  <EmployeesPage
                    employees={employees}
                    newEmployee={newEmployee}
                    setNewEmployee={setNewEmployee}
                    addOrUpdateEmployee={addOrUpdateEmployee}
                  />
                ) : (
                  <Navigate to="/app/payrolls" replace />
                )
              }
            />

            <Route
              path="/payments"
              element={
                selectedPayroll ? (
                  <PaymentsPage
                    fundAmount={fundAmount}
                    setFundAmount={setFundAmount}
                    fundContract={fundContract}
                    employees={employees}
                    payAllEmployees={payAllEmployees}
                    paySingleEmployee={paySingleEmployee}
                    loading={loading}
                  />
                ) : (
                  <Navigate to="/app/payrolls" replace />
                )
              }
            />

            <Route
              path="/history"
              element={selectedPayroll ? <HistoryPage paymentHistory={paymentHistory} /> : <Navigate to="/app/payrolls" replace />}
            />
          </Routes>

          {/* Bridge Modal */}
          {showBridge && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
                <div className="text-black font-semibold">Bridge modal</div>
                {/* Simple form */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">Source chain</label>
                    <select value={sourceChain} onChange={(e) => setSourceChain(e.target.value)} className="mt-1 border rounded px-3 py-2 w-full">
                      {CHAINS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600">Amount (USDC)</label>
                    <input value={bridgeAmount} onChange={(e) => setBridgeAmount(e.target.value)} className="mt-1 border rounded px-3 py-2 w-full" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowBridge(false)} className="px-4 py-2 rounded border">Cancel</button>
                    <button onClick={executeBridge} className="px-4 py-2 rounded bg-black text-white">{bridgeLoading ? "Working..." : "Bridge"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-black">Create Payment Schedule</h2>
                  <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-black text-2xl">✕</button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="text-gray-700">Schedule modal (simplified)</div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 rounded border">Close</button>
                    <button onClick={createSchedule} className="px-4 py-2 rounded bg-black text-white">Create</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
