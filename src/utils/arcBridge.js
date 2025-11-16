import { ethers } from 'ethers';

// Arc Testnet CCTP Configuration
const ARC_TESTNET = {
  domain: 26,
  name: "Arc Testnet",
  chainId: 5042002,
  RPC: "https://rpc.testnet.arc.network",
  TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
  MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  TokenMinter: "0xb43db544E2c27092c107639Ad201b3dEfABcF192",
  USDCAddress: "0x3600000000000000000000000000000000000000"
};

// Source Chain Configurations
const SOURCE_CHAINS = {
  'Ethereum_Sepolia': {
    domain: 0,
    name: "Ethereum Sepolia",
    chainId: 11155111,
    RPC: "https://ethereum-sepolia-rpc.publicnode.com",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  },
  'Avalanche_Fuji': {
    domain: 1,
    name: "Avalanche Fuji",
    chainId: 43113,
    RPC: "https://avalanche-fuji-c-chain-rpc.publicnode.com",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x5425890298aed601595a70AB815c96711a31Bc65"
  },
  'OP_Sepolia': {
    domain: 2,
    name: "Optimism Sepolia",
    chainId: 11155420,
    RPC: "https://optimism-sepolia-rpc.publicnode.com",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"
  },
  'Arbitrum_Sepolia': {
    domain: 3,
    name: "Arbitrum Sepolia",
    chainId: 421614,
    RPC: "https://arbitrum-sepolia-rpc.publicnode.com",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
  },
  'Base_Sepolia': {
    domain: 6,
    name: "Base Sepolia",
    chainId: 84532,
    RPC: "https://base-sepolia-rpc.publicnode.com",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  },
  'Polygon_Amoy': {
    domain: 7,
    name: "Polygon Amoy",
    chainId: 80002,
    RPC: "https://rpc-amoy.polygon.technology",
    TokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    MessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    USDCAddress: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
  }
};

// Contract ABIs
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const TOKEN_MESSENGER_ABI = [
  "function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold) returns (uint64)"
];

const MESSAGE_TRANSMITTER_ABI = [
  "function receiveMessage(bytes message, bytes attestation) returns (bool success)"
];

// IRIS API for attestations
const IRIS_API_URL = "https://iris-api-sandbox.circle.com/v2";

// Finality thresholds
const FINALITY = {
  FAST: 1000,
  STANDARD: 2000
};

/**
 * Main bridge class for Arc Testnet
 */
export class ArcBridge {
  constructor() {
    this.provider = null;
    this.signer = null;
  }

  /**
   * Initialize with MetaMask provider
   */
  async initialize(ethereumProvider) {
    if (!ethereumProvider) {
      throw new Error('MetaMask not found');
    }
    
    const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
    this.signer = await ethersProvider.getSigner();
    console.log('✅ Arc Bridge initialized with signer:', await this.signer.getAddress());
  }

  /**
   * Get cost estimate for bridging to Arc
   */
  async estimateBridge(sourceChainId, amount) {
    const sourceChain = SOURCE_CHAINS[sourceChainId];
    if (!sourceChain) {
      throw new Error(`Unsupported source chain: ${sourceChainId}`);
    }

    // CCTP typically charges 0.1% fee
    const bridgeFee = parseFloat(amount) * 0.001;
    const gasFee = 0.0005; // Estimated gas in ETH/native token
    
    return {
      fees: {
        bridge: bridgeFee.toFixed(6),
        gas: gasFee.toFixed(6),
        total: (parseFloat(amount) + bridgeFee).toFixed(6)
      },
      estimatedTime: '10-20 minutes'
    };
  }

  /**
   * Execute bridge from source chain to Arc Testnet
   */
  async bridge(sourceChainId, amount, useFastTransfer = true) {
    console.log(`🌉 Starting bridge: ${amount} USDC from ${sourceChainId} to Arc Testnet`);
    
    const sourceChain = SOURCE_CHAINS[sourceChainId];
    if (!sourceChain) {
      throw new Error(`Unsupported source chain: ${sourceChainId}`);
    }

    if (!this.signer) {
      throw new Error('Bridge not initialized. Call initialize() first.');
    }

    const userAddress = await this.signer.getAddress();
    console.log('User address:', userAddress);

    // Step 1: Check USDC balance
    const usdcContract = new ethers.Contract(
      sourceChain.USDCAddress,
      ERC20_ABI,
      this.signer
    );

    const balance = await usdcContract.balanceOf(userAddress);
    const decimals = await usdcContract.decimals();
    const amountInBaseUnits = ethers.parseUnits(amount, decimals);

    console.log(`Balance: ${ethers.formatUnits(balance, decimals)} USDC`);
    console.log(`Amount to bridge: ${amount} USDC`);

    if (balance < amountInBaseUnits) {
      throw new Error(`Insufficient USDC balance. Have: ${ethers.formatUnits(balance, decimals)}, Need: ${amount}`);
    }

    // Step 2: Approve TokenMessenger
    console.log('📝 Step 1/3: Approving USDC...');
    const allowance = await usdcContract.allowance(userAddress, sourceChain.TokenMessenger);
    
    if (allowance < amountInBaseUnits) {
      const approveTx = await usdcContract.approve(sourceChain.TokenMessenger, amountInBaseUnits);
      console.log('Approval tx:', approveTx.hash);
      await approveTx.wait();
      console.log('✅ USDC approved');
    } else {
      console.log('✅ USDC already approved');
    }

    // Step 3: Burn USDC on source chain
    console.log('🔥 Step 2/3: Burning USDC on source chain...');
    
    const tokenMessenger = new ethers.Contract(
      sourceChain.TokenMessenger,
      TOKEN_MESSENGER_ABI,
      this.signer
    );

    const destinationAddressBytes32 = ethers.zeroPadValue(userAddress, 32);
    const destinationCallerBytes32 = ethers.ZeroHash; // Allow any caller
    const minFinalityThreshold = useFastTransfer ? FINALITY.FAST : FINALITY.STANDARD;
    const maxFee = useFastTransfer ? (amountInBaseUnits * BigInt(15)) / BigInt(10000) : BigInt(0);

    console.log('Burn parameters:', {
      amount: amount,
      destinationDomain: ARC_TESTNET.domain,
      mintRecipient: userAddress,
      minFinalityThreshold,
      maxFee: ethers.formatUnits(maxFee, decimals)
    });

    const burnTx = await tokenMessenger.depositForBurn(
      amountInBaseUnits,
      ARC_TESTNET.domain,
      destinationAddressBytes32,
      sourceChain.USDCAddress,
      destinationCallerBytes32,
      maxFee,
      minFinalityThreshold
    );

    console.log('Burn tx hash:', burnTx.hash);
    const burnReceipt = await burnTx.wait();
    console.log('✅ USDC burned on source chain');

    // Step 4: Wait for attestation
    console.log('⏳ Step 3/3: Waiting for attestation...');
    const attestationData = await this.waitForAttestation(burnTx.hash, sourceChain.domain);
    
    if (!attestationData) {
      throw new Error('Failed to get attestation');
    }

    console.log('✅ Attestation received');

    // Step 5: Receive message on Arc Testnet
    console.log('📨 Receiving USDC on Arc Testnet...');
    
    // Switch to Arc Testnet
    await this.switchToArcTestnet();
    
    const arcProvider = new ethers.BrowserProvider(window.ethereum);
    const arcSigner = await arcProvider.getSigner();
    
    const messageTransmitter = new ethers.Contract(
      ARC_TESTNET.MessageTransmitter,
      MESSAGE_TRANSMITTER_ABI,
      arcSigner
    );

    const receiveTx = await messageTransmitter.receiveMessage(
      attestationData.message,
      attestationData.attestation
    );

    console.log('Receive tx hash:', receiveTx.hash);
    await receiveTx.wait();
    console.log('✅ USDC received on Arc Testnet!');

    return {
      state: 'success',
      burnTxHash: burnTx.hash,
      receiveTxHash: receiveTx.hash,
      amount: amount,
      sourceChain: sourceChain.name,
      destinationChain: ARC_TESTNET.name
    };
  }

  /**
   * Wait for attestation from Circle's IRIS API
   */
  async waitForAttestation(txHash, sourceDomain, maxAttempts = 60) {
    console.log('Fetching attestation from IRIS API...');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(
          `${IRIS_API_URL}/messages/${sourceDomain}?transactionHash=${txHash}`
        );
        
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
          const message = data.messages[0];
          
          if (message.attestation && message.attestation !== 'PENDING') {
            return message;
          }
        }
        
        console.log(`Attestation pending... (attempt ${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
      } catch (error) {
        console.error('Error fetching attestation:', error);
      }
    }
    
    throw new Error('Attestation timeout');
  }

  /**
   * Switch MetaMask to Arc Testnet
   */
  async switchToArcTestnet() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ARC_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${ARC_TESTNET.chainId.toString(16)}`,
            chainName: 'Arc Testnet',
            nativeCurrency: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 18
            },
            rpcUrls: [ARC_TESTNET.RPC],
            blockExplorerUrls: ['https://testnet.arcscan.app']
          }],
        });
      } else {
        throw switchError;
      }
    }
  }
}

export { SOURCE_CHAINS, ARC_TESTNET };
