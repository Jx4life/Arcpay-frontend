import React, { useState, useEffect } from 'react';
import { Wallet, Users, DollarSign, CheckCircle, AlertCircle, Plus, Send, Building2, ArrowLeft, History, TrendingUp, ArrowRightLeft, Info, Calendar, Clock, Play, Eye, Shield, Zap, Globe, Menu, X, Home, FileText, CreditCard, Settings, UserPlus } from 'lucide-react';
import { CircleSignUpModal } from './CircleSignUp';
import { CircleLoginModal } from './CircleLogin';

// ============= CONSTANTS =============
const CONTRACTS = {
  FACTORY: '0x352B36616Fd3c13f663d372762A4671179703cB4',
  USDC: '0x3600000000000000000000000000000000000000'
};

const CHAIN_CONFIG = {
  ARC_TESTNET: {
    chainId: '0x4CEF52',
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app']
  }
};

const CHAINS = [
  { id: 'Ethereum_Sepolia', name: 'Ethereum Sepolia', chainId: 11155111 },
  { id: 'Base_Sepolia', name: 'Base Sepolia', chainId: 84532 },
  { id: 'Arbitrum_Sepolia', name: 'Arbitrum Sepolia', chainId: 421614 },
  { id: 'Avalanche_Fuji', name: 'Avalanche Fuji', chainId: 43113 },
  { id: 'Polygon_PoS_Amoy', name: 'Polygon Amoy', chainId: 80002 },
  { id: 'OP_Sepolia', name: 'OP Sepolia', chainId: 11155420 }
];

const USDC_ADDRESSES = {
  5042002: '0x3600000000000000000000000000000000000000',
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65',
  80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  11155420: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7'
};

// ABIs (truncated for brevity - include full ABIs from original)
const FACTORY_ABI = [
  { "inputs": [{"internalType": "string", "name": "companyName", "type": "string"}], "name": "createPayroll", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}], "name": "getUserPayrollsInfo", "outputs": [{ "components": [{"internalType": "address", "name": "payrollContract", "type": "address"}, {"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "uint256", "name": "createdAt", "type": "uint256"}, {"internalType": "string", "name": "companyName", "type": "string"}], "internalType": "struct PayrollFactoryV4.PayrollInfo[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }
];

const PAYROLL_ABI = [
  {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "fundContract", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}], "name": "getEmployee", "outputs": [{"internalType": "uint256", "name": "salary", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "role", "type": "string"}, {"internalType": "bool", "name": "isActive", "type": "bool"}, {"internalType": "bool", "name": "hasOptedIn", "type": "bool"}, {"internalType": "uint256", "name": "hireDate", "type": "uint256"}, {"internalType": "uint256", "name": "totalPaid", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "payAllSalaries", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}], "name": "paySalary", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "role", "type": "string"}], "name": "setSalary", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "viewEmployees", "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getContractBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getTotalSalaryExpense", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "startIndex", "type": "uint256"}, {"internalType": "uint256", "name": "count", "type": "uint256"}], "name": "getPaymentHistory", "outputs": [{"components": [{"internalType": "address", "name": "employee", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "note", "type": "string"}, {"internalType": "bool", "name": "isScheduled", "type": "bool"}], "internalType": "struct PayrollV4Enhanced.PaymentRecord[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getTotalPayments", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}], "name": "removeEmployee", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "startDate", "type": "uint256"}, {"internalType": "uint256", "name": "frequency", "type": "uint256"}, {"internalType": "bool", "name": "isRecurring", "type": "bool"}, {"internalType": "uint256", "name": "totalPayments", "type": "uint256"}, {"internalType": "string", "name": "description", "type": "string"}], "name": "createPaymentSchedule", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "processDuePayments", "outputs": [{"internalType": "uint256", "name": "processed", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "getDuePayments", "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}, {"internalType": "uint256", "name": "startIndex", "type": "uint256"}, {"internalType": "uint256", "name": "count", "type": "uint256"}], "name": "getEmployeePaymentHistory", "outputs": [{"components": [{"internalType": "address", "name": "employee", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "note", "type": "string"}, {"internalType": "bool", "name": "isScheduled", "type": "bool"}], "internalType": "struct PayrollV4Enhanced.PaymentRecord[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"}
];

const USDC_ABI = [
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
];

// Utility functions
const formatUnits = (value, decimals) => {
  const str = value.toString().padStart(decimals + 1, '0');
  const intPart = str.slice(0, -decimals) || '0';
  const decPart = str.slice(-decimals);
  return parseFloat(`${intPart}.${decPart}`).toFixed(2);
};

const parseUnits = (value, decimals) => {
  const [intPart, decPart = ''] = value.split('.');
  const paddedDec = decPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(intPart + paddedDec);
};

const getChainName = (chainId) => {
  const names = {
    5042002: 'Arc Testnet',
    11155111: 'Ethereum Sepolia',
    84532: 'Base Sepolia',
    421614: 'Arbitrum Sepolia',
    43113: 'Avalanche Fuji',
    80002: 'Polygon Amoy',
    11155420: 'OP Sepolia'
  };
  return names[Number(chainId)] || 'Unknown Chain';
};

// Components
const MessageAlert = ({ message }) => {
  if (!message.text) return null;
  
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  const Icon = message.type === 'success' ? CheckCircle : message.type === 'info' ? Info : AlertCircle;

  return (
    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${styles[message.type]}`}>
      <Icon size={20} />
      {message.text}
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, currentView, onViewChange, onBridgeClick }) => {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'payrolls', icon: Building2, label: 'Payrolls' },
    { id: 'employees', icon: Users, label: 'Employees' },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onViewChange(null)}
        />
      )}

      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            {isOpen && <span className="text-2xl font-bold text-black">ArcPay</span>}
          </div>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-black text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={22} className={currentView === item.id ? 'text-white' : 'text-gray-600 group-hover:text-black'} />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}

          <button
            onClick={onBridgeClick}
            className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
          >
            <ArrowRightLeft size={22} className="text-gray-600 group-hover:text-black" />
            {isOpen && <span className="font-medium">Bridge USDC</span>}
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group">
            <Settings size={22} className="text-gray-600 group-hover:text-black" />
            {isOpen && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </div>
    </>
  );
};

// Landing Page
const LandingPage = ({ onConnect, onSignUp }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
            <DollarSign className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-6xl font-black text-black mb-4">ArcPay</h1>
        <p className="text-xl text-gray-600 mb-8">
          Cross-chain payroll automation for the modern workforce
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
          <button
            onClick={onConnect}
            className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <Wallet size={24} />
            Connect Wallet
          </button>
          
          <div className="text-gray-400 font-semibold">OR</div>
          
          <button
            onClick={onSignUp}
            className="bg-white text-black border-2 border-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <UserPlus size={24} />
            Sign Up
          </button>
        </div>

        <p className="text-sm text-gray-500">
          New to crypto? <span className="font-semibold text-black">Sign up with just your email</span> - no extensions needed!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<ArrowRightLeft size={28} />} 
          title="Cross-Chain Bridge" 
          description="Bridge USDC from 6+ networks seamlessly"
        />
        <FeatureCard 
          icon={<Calendar size={28} />} 
          title="Automated Payments" 
          description="Schedule recurring payroll with ease"
        />
        <FeatureCard 
          icon={<Shield size={28} />} 
          title="Secure & Trustless" 
          description="Non-custodial smart contracts"
        />
      </div>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-black cursor-pointer group">
    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black transition-colors duration-300">
      <div className="text-black group-hover:text-white transition-colors duration-300">{icon}</div>
    </div>
    <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Main Component
export default function ArcPayPlatform() {
  // State declarations
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('0');
  const [currentChainName, setCurrentChainName] = useState('');
  const [userPayrolls, setUserPayrolls] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [contractBalance, setContractBalance] = useState('0');
  const [totalExpense, setTotalExpense] = useState('0');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [duePayments, setDuePayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLanding, setShowLanding] = useState(true);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCircleUser, setIsCircleUser] = useState(false);
  const [circleUserData, setCircleUserData] = useState(null);
  const [circleProvider, setCircleProvider] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [companyName, setCompanyName] = useState('');
  const [newEmployee, setNewEmployee] = useState({ address: '', salary: '', name: '', role: '' });
  const [fundAmount, setFundAmount] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    employee: '', amount: '', startDate: '', frequency: '2592000',
    isRecurring: true, totalPayments: '12', description: ''
  });

  const [showBridge, setShowBridge] = useState(false);
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [sourceChain, setSourceChain] = useState('Ethereum_Sepolia');
  const [bridgeLoading, setBridgeLoading] = useState(false);
  const [sourceChainBalance, setSourceChainBalance] = useState('0.00');
  

  // Effects
  useEffect(() => {
    if (account && web3) {
      loadUserPayrolls();
      loadCurrentChainBalance();
    }
  }, [account, web3, currentChainName]);

  useEffect(() => {
    if (selectedPayroll && web3) {
      loadPayrollData();
      loadDuePayments();
    }
  }, [selectedPayroll, web3]);

  // Load source chain balance when source chain changes
  useEffect(() => {
    if (account && web3 && showBridge) {
      loadSourceChainBalance();
    }
  }, [sourceChain, account, web3, showBridge]);

  // Helper functions
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 8000);
  };

  const checkNetwork = async () => {
    try {
      const chainId = await web3.eth.getChainId();
      if (chainId !== BigInt(5042002)) {
        showMessage('error', '❌ Wrong network! Switch to Arc Testnet');
        return false;
      }
      return true;
    } catch (error) {
      showMessage('error', '❌ Network error');
      return false;
    }
  };

  const switchToChain = async (chainId, chainName) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      setCurrentChainName(chainName);

      setTimeout(async () => {
        if (web3) {
          const newChainId = await web3.eth.getChainId();
          setCurrentChainName(getChainName(newChainId));
        }
      }, 1000);

      showMessage('success', `✅ Switched to ${chainName}`);
      return true;
    } catch (error) {
      if (error.code === 4902) {
        showMessage('error', `❌ ${chainName} not added to MetaMask.`);
      } else if (error.code === 4001) {
        showMessage('error', '❌ Chain switch cancelled');
      } else {
        showMessage('error', `❌ Failed to switch: ${error.message}`);
      }
      return false;
    }
  };

  const signCircleTransaction = async (txData) => {
  if (!isCircleUser || !circleUserData) {
    throw new Error('Not a Circle user');
  }

  try {
    // This would need to be implemented with Circle's transaction signing
    // For now, show a message that this feature is coming soon
    showMessage('info', '🔄 Circle wallet transactions coming soon! Please use MetaMask for now.');
    throw new Error('Circle wallet transactions not yet implemented');
  } catch (error) {
    console.error('Circle transaction error:', error);
    throw error;
  }
};

  // Wallet functions
  const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      showMessage('error', 'Please install MetaMask');
      return;
    }
    const Web3 = (await import('https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm')).default;
    const web3Instance = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3Instance.eth.getAccounts();
    const chainId = await web3Instance.eth.getChainId();
    
    if (chainId !== BigInt(5042002)) {
      try {
        await window.ethereum.request({ 
          method: 'wallet_switchEthereumChain', 
          params: [{ chainId: CHAIN_CONFIG.ARC_TESTNET.chainId }] 
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({ 
            method: 'wallet_addEthereumChain', 
            params: [CHAIN_CONFIG.ARC_TESTNET] 
          });
        }
      }
    }
    
    setWeb3(web3Instance);
    setAccount(accounts[0]);
    setCurrentChainName(getChainName(chainId));
    setShowLanding(false);
    showMessage('success', '✅ Connected to ArcPay!');
  } catch (error) {
    console.error('Connection error:', error);
    showMessage('error', 'Connection failed: ' + error.message);
  }
};

  const disconnectWallet = () => {
  setWeb3(null);
  setAccount('');
  setAccountBalance('0');
  setUserPayrolls([]);
  setSelectedPayroll(null);
  setEmployees([]);
  setIsCircleUser(false);
  setCircleUserData(null);
  setCircleProvider(null);
  setShowLanding(true);
  showMessage('success', 'Disconnected');
};
  const loadCurrentChainBalance = async () => {
    if (!web3 || !account) return;

    try {
      const currentChainId = await web3.eth.getChainId();
      const usdcAddress = USDC_ADDRESSES[Number(currentChainId)];

      if (!usdcAddress) {
        setAccountBalance('0.00');
        return;
      }

      const usdc = new web3.eth.Contract(USDC_ABI, usdcAddress);
      const balance = await usdc.methods.balanceOf(account).call();
      setAccountBalance(formatUnits(balance.toString(), 6));
    } catch (error) {
      console.error('Balance loading error:', error);
      setAccountBalance('0.00');
    }
  };

  const loadSourceChainBalance = async () => {
    if (!web3 || !account) return;

    try {
      // Get the selected source chain
      const selectedChain = CHAINS.find(c => c.id === sourceChain);
      if (!selectedChain) {
        setSourceChainBalance('0.00');
        return;
      }

      // Get USDC address for the source chain
      const usdcAddress = USDC_ADDRESSES[selectedChain.chainId];
      if (!usdcAddress) {
        setSourceChainBalance('0.00');
        return;
      }

      // Check current connected chain
      const currentChainId = await web3.eth.getChainId();
      
      // If we're already on the source chain, fetch balance directly
      if (Number(currentChainId) === selectedChain.chainId) {
        const usdc = new web3.eth.Contract(USDC_ABI, usdcAddress);
        const balance = await usdc.methods.balanceOf(account).call();
        setSourceChainBalance(formatUnits(balance.toString(), 6));
      } else {
        // We're on a different chain, show 0 or fetch via RPC if needed
        // For now, we'll show a placeholder
        setSourceChainBalance('Switch to view');
      }
    } catch (error) {
      console.error('Source chain balance error:', error);
      setSourceChainBalance('0.00');
    }
  };

  const loadUserPayrolls = async () => {
    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, CONTRACTS.FACTORY);
      const payrollsInfo = await factory.methods.getUserPayrollsInfo(account).call();
      setUserPayrolls(payrollsInfo);
      setLoading(false);
      return payrollsInfo;
    } catch (error) {
      setUserPayrolls([]);
      setLoading(false);
      return [];
    }
  };

  const createNewPayroll = async () => {
    if (!companyName.trim()) {
      showMessage('error', 'Enter company name');
      return;
    }
    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, CONTRACTS.FACTORY);
      await factory.methods.createPayroll(companyName).send({ from: account });
      showMessage('success', '✅ Payroll created!');
      setCompanyName('');
      await loadUserPayrolls();
    } catch (error) {
      showMessage('error', 'Failed to create payroll');
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);

      const [employeeAddresses, balance, expense, totalPayments] = await Promise.all([
        payroll.methods.viewEmployees().call(),
        payroll.methods.getContractBalance().call(),
        payroll.methods.getTotalSalaryExpense().call(),
        payroll.methods.getTotalPayments().call()
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
              totalPaid: formatUnits(empData[6].toString(), 6)
            };
          } catch (err) {
            return null;
          }
        })
      );

      setEmployees(employeeData.filter(e => e !== null));
      setContractBalance(formatUnits(balance.toString(), 6));
      setTotalExpense(formatUnits(expense.toString(), 6));

      const totalPaymentsNum = Number(totalPayments);

      if (totalPaymentsNum > 0 && employeeData.filter(e => e !== null).length > 0) {
        try {
          const allEmployeePayments = [];

          for (const emp of employeeData.filter(e => e !== null)) {
            try {
              const empHistory = await payroll.methods.getEmployeePaymentHistory(
                emp.address, 0, 100
              ).call({ from: account });

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
          console.error('Payment history error:', historyError);
          setPaymentHistory([]);
        }
      } else {
        setPaymentHistory([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Load payroll error:', error);
      showMessage('error', '❌ Failed to load data');
      setLoading(false);
    }
  };

  const loadDuePayments = async () => {
    try {
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const due = await payroll.methods.getDuePayments().call();
      setDuePayments(due);
    } catch (error) {
      setDuePayments([]);
    }
  };

  const fundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      showMessage('error', '❌ Enter valid amount');
      return;
    }

    try {
      setLoading(true);
      const usdc = new web3.eth.Contract(USDC_ABI, CONTRACTS.USDC);
      const userBalance = await usdc.methods.balanceOf(account).call();
      const amountBigInt = parseUnits(fundAmount, 6);

      if (BigInt(userBalance) < amountBigInt) {
        showMessage('error', `❌ Insufficient USDC`);
        setLoading(false);
        return;
      }

      await usdc.methods.approve(selectedPayroll.payrollContract, amountBigInt.toString()).send({ from: account });
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.fundContract(amountBigInt.toString()).send({ from: account });

      showMessage('success', `✅ Funded ${fundAmount} USDC!`);
      setFundAmount('');
      await loadPayrollData();
      await loadCurrentChainBalance();
    } catch (error) {
      showMessage('error', `❌ Funding failed`);
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateEmployee = async () => {
    if (!newEmployee.address || !newEmployee.salary || !newEmployee.name || !newEmployee.role) {
      showMessage('error', '❌ Fill all fields');
      return;
    }

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const salaryInUsdc = parseUnits(newEmployee.salary, 6).toString();

      await payroll.methods.setSalary(
        newEmployee.address,
        salaryInUsdc,
        newEmployee.name,
        newEmployee.role
      ).send({ from: account });

      showMessage('success', '✅ Employee added!');
      setNewEmployee({ address: '', salary: '', name: '', role: '' });
      await loadPayrollData();
    } catch (error) {
      showMessage('error', `❌ Failed to add employee`);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!scheduleForm.employee || !scheduleForm.amount) {
      showMessage('error', '❌ Fill required fields');
      return;
    }

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const startTimestamp = new Date(scheduleForm.startDate).getTime() / 1000;

      await payroll.methods.createPaymentSchedule(
        scheduleForm.employee,
        parseUnits(scheduleForm.amount, 6).toString(),
        startTimestamp,
        parseInt(scheduleForm.frequency),
        scheduleForm.isRecurring,
        parseInt(scheduleForm.totalPayments),
        scheduleForm.description
      ).send({ from: account });

      showMessage('success', '✅ Schedule created!');
      setShowScheduleModal(false);
      setScheduleForm({
        employee: '', amount: '', startDate: '', frequency: '2592000',
        isRecurring: true, totalPayments: '12', description: ''
      });
    } catch (error) {
      showMessage('error', '❌ Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const processDuePayments = async () => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.processDuePayments().send({ from: account });
      showMessage('success', '✅ Due payments processed!');
      await loadPayrollData();
      await loadDuePayments();
    } catch (error) {
      showMessage('error', '❌ No due payments');
    } finally {
      setLoading(false);
    }
  };

  const paySingleEmployee = async (employeeAddress) => {
    if (!await checkNetwork()) return;

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const employee = employees.find(e => e.address === employeeAddress);

      await payroll.methods.paySalary(employeeAddress).send({ from: account });
      showMessage('success', `✅ Paid ${employee.name}!`);
      await loadPayrollData();
      await loadCurrentChainBalance();
    } catch (error) {
      showMessage('error', `❌ Payment failed`);
    } finally {
      setLoading(false);
    }
  };

  const payAllEmployees = async () => {
    if (!await checkNetwork()) return;

    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.payAllSalaries().send({ from: account });
      showMessage('success', '✅ All employees paid!');
      await loadPayrollData();
      await loadCurrentChainBalance();
    } catch (error) {
      showMessage('error', `❌ Bulk payment failed`);
    } finally {
      setLoading(false);
    }
  };

  const executeBridge = async () => {
    if (!bridgeAmount || parseFloat(bridgeAmount) <= 0) {
      showMessage('error', '❌ Enter valid amount');
      return;
    }

    try {
      setBridgeLoading(true);
      showMessage('info', 'Starting bridge to Arc Testnet...');

      const { ArcBridge } = await import('./utils/arcBridge.js');
      const arcBridge = new ArcBridge();
      await arcBridge.initialize(window.ethereum);
      const result = await arcBridge.bridge(sourceChain, bridgeAmount, true);

      if (result.state === 'success') {
        showMessage('success', `✅ Bridge successful! ${bridgeAmount} USDC arrived on Arc Testnet!`);
        setTimeout(() => {
          setShowBridge(false);
          setBridgeAmount('');
          loadCurrentChainBalance();
        }, 3000);
      } else {
        showMessage('error', '❌ Bridge failed. Check console.');
      }
    } catch (error) {
      console.error('Bridge error:', error);
      if (error.message.includes('Insufficient')) {
        showMessage('error', '❌ Insufficient USDC balance');
      } else if (error.message.includes('rejected')) {
        showMessage('error', '❌ Transaction rejected');
      } else {
        showMessage('error', '❌ Bridge failed: ' + error.message);
      }
    } finally {
      setBridgeLoading(false);
    }
  };

  // Render Landing Page
  if (showLanding && !account) {
    return (
      <>
        <LandingPage 
          onConnect={connectWallet}
          onSignUp={() => setShowSignUpModal(true)}
        />
       <CircleSignUpModal
  isOpen={showSignUpModal}
  onClose={() => setShowSignUpModal(false)}
  onSuccess={async (walletData) => {
    console.log('Circle wallet created:', walletData);
    
    try {
      // Store Circle user data
      setCircleUserData(walletData);
      setIsCircleUser(true);
      
      // Set up Web3 for viewing (read-only)
      const Web3 = (await import('https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm')).default;
      const web3Instance = new Web3('https://sepolia.arbitrum.io/rpc');
      
      setWeb3(web3Instance);
      setAccount(walletData.walletAddress);
      setCurrentChainName('Arbitrum Sepolia');
      
      setShowSignUpModal(false);
      setShowLanding(false);
      
      showMessage('success', `✅ Wallet created! Address: ${walletData.walletAddress.slice(0, 6)}...${walletData.walletAddress.slice(-4)}`);
      
      // Load balance after a short delay
      setTimeout(async () => {
        await loadCurrentChainBalance();
      }, 1500);
      
    } catch (error) {
      console.error('Error setting up Circle user:', error);
      showMessage('error', '❌ Failed to set up wallet view. Please try again.');
    }
  }}
/>
</>
 );
  }

  // Render Main App
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

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-20'}`}>
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
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'payrolls' && 'Payrolls'}
                {currentView === 'employees' && 'Employees'}
                {currentView === 'payments' && 'Payments'}
                {currentView === 'history' && 'History'}
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
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-black">{currentChainName}</span>
      </div>
    </div>

    <button
      onClick={disconnectWallet}
      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
    >
      {isCircleUser && circleUserData?.email ? (
        circleUserData.email.split('@')[0]
      ) : (
        `${account.slice(0, 6)}...${account.slice(-4)}`
      )}
    </button>
  </div>
)}
        </div>

        <div className="p-6">
          <MessageAlert message={message} />

          {/* Bridge Modal */}
          {showBridge && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-black">Bridge USDC</h2>
                  <button
                    onClick={() => {
                      setShowBridge(false);
                      setBridgeLoading(false);
                    }}
                    className="text-gray-400 hover:text-black text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Chain</label>
                    <select
                      value={sourceChain}
                      onChange={(e) => setSourceChain(e.target.value)}
                      disabled={bridgeLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    >
                      {CHAINS.map(chain => (
                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                      ))}
                    </select>
                    
                    {/* Source Chain Balance */}
                    {sourceChainBalance && sourceChainBalance !== '0.00' && (
                      <div className="mt-2 text-xs text-gray-600">
                        Balance: <span className="font-semibold text-black">{sourceChainBalance} USDC</span>
                      </div>
                    )}
                    
                    {/* Current Network Warning */}
                    {currentChainName && !currentChainName.toLowerCase().includes(sourceChain.toLowerCase().replace('_', ' ').split(' ')[0]) && !bridgeLoading && (
                      <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="text-yellow-600 flex-shrink-0" size={16} />
                            <div className="text-xs text-yellow-700">
                              Connected to <strong>{currentChainName}</strong>. Switch to continue.
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              const selectedChain = CHAINS.find(c => c.id === sourceChain);
                              if (selectedChain) {
                                await switchToChain(selectedChain.chainId, selectedChain.name);
                                // Reload balance after switching
                                setTimeout(() => loadSourceChainBalance(), 1000);
                              }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition"
                          >
                            Switch Network
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <ArrowRightLeft size={20} className="text-gray-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Chain</label>
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-black">Arc Testnet</span>
                        {accountBalance !== '0' && accountBalance !== '0.00' && (
                          <span className="text-xs text-gray-600">Balance: {accountBalance} USDC</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      disabled={bridgeLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    />
                    <div className="text-xs text-gray-500 mt-1">Enter the amount to bridge to Arc Testnet</div>
                  </div>

                  {bridgeLoading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div className="font-semibold text-blue-900">Bridge in Progress...</div>
                      </div>
                      <div className="text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Estimated time: 10-30 minutes</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={executeBridge}
                    disabled={bridgeLoading || !bridgeAmount}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold"
                  >
                    {bridgeLoading ? '⏳ Bridging...' : 'Bridge USDC'}
                  </button>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <Info size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-600">
                        Bridge USDC from multiple chains to Arc Testnet. Get testnet USDC from <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-black hover:text-gray-700">Circle Faucet</a>
                      </div>
                    </div>
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee</label>
                    <select
                      value={scheduleForm.employee}
                      onChange={(e) => setScheduleForm({...scheduleForm, employee: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">Select employee</option>
                      {employees.filter(e => e.isActive).map(emp => (
                        <option key={emp.address} value={emp.address}>
                          {emp.name} ({emp.address.slice(0,6)}...{emp.address.slice(-4)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (USDC)</label>
                      <input
                        type="number"
                        placeholder="1000.00"
                        value={scheduleForm.amount}
                        onChange={(e) => setScheduleForm({...scheduleForm, amount: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={scheduleForm.startDate}
                        onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                      <select
                        value={scheduleForm.frequency}
                        onChange={(e) => setScheduleForm({...scheduleForm, frequency: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="86400">Daily</option>
                        <option value="604800">Weekly</option>
                        <option value="1209600">Bi-weekly</option>
                        <option value="2592000">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Payments</label>
                      <input
                        type="number"
                        placeholder="12"
                        value={scheduleForm.totalPayments}
                        onChange={(e) => setScheduleForm({...scheduleForm, totalPayments: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      placeholder="Monthly salary payment"
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={scheduleForm.isRecurring}
                      onChange={(e) => setScheduleForm({...scheduleForm, isRecurring: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-700">Recurring payment</label>
                  </div>

                  <button
                    onClick={createSchedule}
                    disabled={loading}
                    className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold"
                  >
                    {loading ? '⏳ Creating...' : 'Create Schedule'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && selectedPayroll && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Contract Balance</div>
                  <div className="text-3xl font-bold text-black">{contractBalance} USDC</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Monthly Expense</div>
                  <div className="text-3xl font-bold text-black">{totalExpense} USDC</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Total Payments</div>
                  <div className="text-3xl font-bold text-black">{paymentHistory.length}</div>
                </div>
              </div>

              {duePayments.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-yellow-600" size={24} />
                    <div>
                      <div className="font-semibold text-yellow-900">{duePayments.length} Payment(s) Due</div>
                      <div className="text-sm text-yellow-700">Process scheduled payments now</div>
                    </div>
                  </div>
                  <button
                    onClick={processDuePayments}
                    disabled={loading}
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
                    onClick={() => setCurrentView('employees')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Users size={20} />
                    <span className="font-medium">Add Employee</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('payments')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Send size={20} />
                    <span className="font-medium">Make Payment</span>
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Calendar size={20} />
                    <span className="font-medium">Schedule Payment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payrolls View */}
          {currentView === 'payrolls' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Create New Payroll</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e)=>setCompanyName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={createNewPayroll}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
                  >
                    {loading?'Creating...':'Create'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Your Payrolls ({userPayrolls.length})</h3>
                {loading && userPayrolls.length===0 ? (
                  <div className="text-center py-8 text-gray-600">Loading...</div>
                ) : userPayrolls.length===0 ? (
                  <div className="text-center py-8 text-gray-600">No payrolls yet. Create one to get started!</div>
                ) : (
                  <div className="space-y-3">
                    {userPayrolls.map((p,i)=>(
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        onClick={()=>{
                          setSelectedPayroll(p);
                          setCurrentView('dashboard');
                        }}
                      >
                        <div>
                          <div className="font-semibold text-black">{p.companyName}</div>
                          <div className="font-mono text-sm text-gray-600">{p.payrollContract.slice(0,10)}...{p.payrollContract.slice(-8)}</div>
                          <div className="text-xs text-gray-500">Created: {new Date(Number(p.createdAt)*1000).toLocaleDateString()}</div>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employees View */}
          {currentView === 'employees' && selectedPayroll && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Add New Employee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newEmployee.name}
                    onChange={(e)=>setNewEmployee({...newEmployee,name:e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={newEmployee.role}
                    onChange={(e)=>setNewEmployee({...newEmployee,role:e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={newEmployee.address}
                    onChange={(e)=>setNewEmployee({...newEmployee,address:e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Salary (USDC)"
                    value={newEmployee.salary}
                    onChange={(e)=>setNewEmployee({...newEmployee,salary:e.target.value})}
                    className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={addOrUpdateEmployee}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {loading?'Adding...':'Add Employee'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Active Employees ({employees.filter(e => e.isActive).length})</h3>
                {employees.filter(e => e.isActive).length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No active employees yet</div>
                ) : (
                  <div className="space-y-3">
                    {employees.filter(e => e.isActive).map((e,i)=>(
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-semibold text-black">{e.name||'Unknown'}</div>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-medium">{e.role||'No role'}</span>
                          </div>
                          <div className="font-mono text-sm text-gray-600">{e.address}</div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-lg font-semibold text-black">{e.salary} USDC/month</div>
                            <div className="text-xs text-gray-500">Total Paid: {e.totalPaid} USDC</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payments View */}
          {currentView === 'payments' && selectedPayroll && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4">Fund Contract</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Amount (USDC)"
                    value={fundAmount}
                    onChange={(e)=>setFundAmount(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={fundContract}
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  >
                    {loading?'Processing...':'Fund Contract'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black">Pay Employees</h3>
                  {employees.filter(e => e.isActive).length > 0 && (
                    <button
                      onClick={payAllEmployees}
                      disabled={loading}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      Pay All Employees
                    </button>
                  )}
                </div>
                {employees.filter(e => e.isActive).length === 0 ? (
                  <div className="text-center py-8 text-gray-600">No active employees</div>
                ) : (
                  <div className="space-y-3">
                    {employees.filter(e => e.isActive).map((e,i)=>(
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-semibold text-black">{e.name}</div>
                          <div className="text-sm text-gray-600">{e.salary} USDC</div>
                        </div>
                        <button
                          onClick={()=>paySingleEmployee(e.address)}
                          disabled={loading}
                          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                        >
                          Pay Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History View */}
          {currentView === 'history' && selectedPayroll && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-black mb-4">Payment History</h3>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No payment history yet</div>
              ) : (
                <div className="space-y-2">
                  {paymentHistory.map((p,i)=>(
                    <div key={i} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-mono text-sm text-gray-800">{p.employee}</div>
                          <div className="text-xs text-gray-600">{p.note}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-black">{formatUnits(p.amount.toString(),6)} USDC</div>
                          <div className="text-xs text-gray-500">{new Date(Number(p.timestamp)*1000).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedPayroll && currentView !== 'payrolls' && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
              <Building2 size={64} className="mx-auto text-gray-400 mb-4"/>
              <h3 className="text-xl font-semibold text-black mb-2">No Payroll Selected</h3>
              <p className="text-gray-600 mb-6">Select or create a payroll to get started</p>
              <button
                onClick={() => setCurrentView('payrolls')}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Go to Payrolls
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
