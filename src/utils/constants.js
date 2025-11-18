// ============= CONSTANTS =============
export const CONTRACTS = {
  FACTORY: "0x352B36616Fd3c13f663d372762A4671179703cB4",
  USDC: "0x3600000000000000000000000000000000000000",
};

export const CHAIN_CONFIG = {
  ARC_TESTNET: {
    chainId: "0x4CEF52",
    chainName: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: ["https://rpc.testnet.arc.network"],
    blockExplorerUrls: ["https://testnet.arcscan.app"],
  },
};

export const CHAINS = [
  { id: "Ethereum_Sepolia", name: "Ethereum Sepolia", chainId: 11155111 },
  { id: "Base_Sepolia", name: "Base Sepolia", chainId: 84532 },
  { id: "Arbitrum_Sepolia", name: "Arbitrum Sepolia", chainId: 421614 },
  { id: "Avalanche_Fuji", name: "Avalanche Fuji", chainId: 43113 },
  { id: "Polygon_PoS_Amoy", name: "Polygon Amoy", chainId: 80002 },
  { id: "OP_Sepolia", name: "OP Sepolia", chainId: 11155420 },
];

export const USDC_ADDRESSES = {
  5042002: "0x3600000000000000000000000000000000000000",
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  43113: "0x5425890298aed601595a70AB815c96711a31Bc65",
  80002: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
  11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
};

// ABIs (truncated for brevity - include full ABIs from original)
export const FACTORY_ABI = [
  {
    inputs: [{ internalType: "string", name: "companyName", type: "string" }],
    name: "createPayroll",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserPayrollsInfo",
    outputs: [
      {
        components: [
          { internalType: "address", name: "payrollContract", type: "address" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "string", name: "companyName", type: "string" },
        ],
        internalType: "struct PayrollFactoryV4.PayrollInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const PAYROLL_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "fundContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "emp", type: "address" }],
    name: "getEmployee",
    outputs: [
      { internalType: "uint256", name: "salary", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "role", type: "string" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "bool", name: "hasOptedIn", type: "bool" },
      { internalType: "uint256", name: "hireDate", type: "uint256" },
      { internalType: "uint256", name: "totalPaid", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "payAllSalaries",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "emp", type: "address" }],
    name: "paySalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "emp", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "role", type: "string" },
    ],
    name: "setSalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "viewEmployees",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalSalaryExpense",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "startIndex", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "getPaymentHistory",
    outputs: [
      {
        components: [
          { internalType: "address", name: "employee", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "note", type: "string" },
          { internalType: "bool", name: "isScheduled", type: "bool" },
        ],
        internalType: "struct PayrollV4Enhanced.PaymentRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPayments",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "emp", type: "address" }],
    name: "removeEmployee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "emp", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "startDate", type: "uint256" },
      { internalType: "uint256", name: "frequency", type: "uint256" },
      { internalType: "bool", name: "isRecurring", type: "bool" },
      { internalType: "uint256", name: "totalPayments", type: "uint256" },
      { internalType: "string", name: "description", type: "string" },
    ],
    name: "createPaymentSchedule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "processDuePayments",
    outputs: [{ internalType: "uint256", name: "processed", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDuePayments",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "emp", type: "address" },
      { internalType: "uint256", name: "startIndex", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "getEmployeePaymentHistory",
    outputs: [
      {
        components: [
          { internalType: "address", name: "employee", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "note", type: "string" },
          { internalType: "bool", name: "isScheduled", type: "bool" },
        ],
        internalType: "struct PayrollV4Enhanced.PaymentRecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const USDC_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
