import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import useWeb3Login from "../hooks/useWeb3Login";
import { formatUnits } from "../utils";
import { USDC_ADDRESSES, USDC_ABI, CHAIN_CONFIG } from "../utils/constants";

/**
 * OnboardingContext
 *
 * This context centralizes the onboarding / landing responsibilities:
 *  - Showing / hiding the landing view and signup/login modals
 *  - Handling Circle sign-up / login results (initializing a read-only web3 for Circle users)
 *  - Connecting / disconnecting MetaMask (delegated to `useWeb3Login`)
 *  - Providing small helper state like account, web3 instance and chain name
 *
 * The intent is to keep onboarding-related UI and logic together and make it available
 * via context so route components (including the Landing page) can be simple consumers.
 */

const OnboardingContext = createContext(null);

/**
 * Provider component
 */
export function OnboardingProvider({ children }) {
  // UI state for landing and modals
  const [showLanding, setShowLanding] = useState(true);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Circle (custodial) user state
  const [isCircleUser, setIsCircleUser] = useState(false);
  const [circleUserData, setCircleUserData] = useState(null);

  // Web3 related state (kept lightweight here)
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [currentChainName, setCurrentChainName] = useState("");
  const [accountBalance, setAccountBalance] = useState("0.00");

  // Generic message used for onboarding feedback
  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage({ type: "", text: "" }), 8000);
  }, []);

  // Load current chain USDC balance (for read-only Circle users or connected wallets)
  const loadCurrentChainBalance = useCallback(async () => {
    try {
      if (!web3 || !account) {
        setAccountBalance("0.00");
        return;
      }

      // Try to get chain id from web3
      const currentChainIdRaw = await web3.eth.getChainId();
      const chainIdNum =
        typeof currentChainIdRaw === "bigint"
          ? Number(currentChainIdRaw)
          : Number(currentChainIdRaw);

      const usdcAddress = USDC_ADDRESSES[Number(chainIdNum)];
      if (!usdcAddress) {
        setAccountBalance("0.00");
        return;
      }

      const usdc = new web3.eth.Contract(USDC_ABI, usdcAddress);
      const bal = await usdc.methods.balanceOf(account).call();
      setAccountBalance(formatUnits(bal.toString(), 6));
    } catch (e) {
      console.error("Onboarding: loadCurrentChainBalance error", e);
      setAccountBalance("0.00");
    }
  }, [web3, account]);

  // Keep balance up to date when account or web3 change
  useEffect(() => {
    if (account && web3) {
      loadCurrentChainBalance();
    }
  }, [account, web3, loadCurrentChainBalance]);

  // Initialize the web3 login hook and wire connect/disconnect
  const { connectWallet: hookConnectWallet, disconnectWallet: hookDisconnectWallet } =
    useWeb3Login({
      setWeb3,
      setAccount,
      setCurrentChainName,
      setShowLanding,
      showMessage,
      // try to switch to Arc Testnet by default for the dashboard flows
      getChainName: null,
      desiredChainIdHex: CHAIN_CONFIG?.ARC_TESTNET?.chainId,
      chainConfigToAdd: CHAIN_CONFIG?.ARC_TESTNET,
    });

  // Exposed connect / disconnect wrappers (keeps naming consistent)
  const connectWallet = useCallback(async () => {
    try {
      await hookConnectWallet();
    } catch (e) {
      console.error("Onboarding: connectWallet error", e);
    }
  }, [hookConnectWallet]);

  const disconnectWallet = useCallback(() => {
    try {
      hookDisconnectWallet();
    } catch (e) {
      console.error("Onboarding: disconnectWallet error", e);
    }

    // Clear onboarding/local UI state (keep global app logic to consumers if needed)
    setAccountBalance("0.00");
    setShowLanding(true);
    setIsCircleUser(false);
    setCircleUserData(null);
  }, [hookDisconnectWallet]);

  // Handle results from Circle signup/login modals.
  // We create a read-only web3 instance to allow the app to show balances and limited view.
  const handleCircleSuccess = useCallback(
    async (walletData) => {
      try {
        if (!walletData) return;

        // store Circle user data and mark user as Circle user
        setCircleUserData(walletData);
        setIsCircleUser(true);

        // create a read-only Web3 instance (previous behaviour used Sepolia/Arbitrum endpoints)
        try {
          const Web3 = (await import("https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm")).default;
          const web3Instance = new Web3("https://sepolia.arbitrum.io/rpc");
          setWeb3(web3Instance);
        } catch (err) {
          console.error("Onboarding: failed to initialize read-only web3 for Circle user", err);
        }

        // set account and chain context
        setAccount(walletData.walletAddress);
        setCurrentChainName("Arbitrum Sepolia");

        // close onboarding UI and show main app
        setShowSignUpModal(false);
        setShowLanding(false);

        showMessage(
          "success",
          `✅ Wallet created! Address: ${walletData.walletAddress.slice(0, 6)}...${walletData.walletAddress.slice(
            -4,
          )}`,
        );

        // fetch balance after a short delay (best-effort)
        setTimeout(async () => {
          try {
            await loadCurrentChainBalance();
          } catch (e) {
            /* ignore */
          }
        }, 1500);
      } catch (error) {
        console.error("Onboarding: handleCircleSuccess error:", error);
        showMessage("error", "❌ Failed to set up wallet view. Please try again.");
      }
    },
    [loadCurrentChainBalance, showMessage],
  );

  const handleCircleLoginSuccess = useCallback(
    async (walletData) => {
      // login flow mirrors signup behavior for view-only Circle wallets
      try {
        if (!walletData) return;
        setCircleUserData(walletData);
        setIsCircleUser(true);

        try {
          const Web3 = (await import("https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm")).default;
          const web3Instance = new Web3("https://sepolia.arbitrum.io/rpc");
          setWeb3(web3Instance);
        } catch (err) {
          console.error("Onboarding: failed to initialize read-only web3 for Circle login", err);
        }

        setAccount(walletData.walletAddress);
        setCurrentChainName("Arbitrum Sepolia");

        setShowLoginModal(false);
        setShowLanding(false);

        showMessage(
          "success",
          `✅ Logged in! Address: ${walletData.walletAddress.slice(0, 6)}...${walletData.walletAddress.slice(-4)}`,
        );

        setTimeout(async () => {
          try {
            await loadCurrentChainBalance();
          } catch (e) {}
        }, 1500);
      } catch (error) {
        console.error("Onboarding: handleCircleLoginSuccess error:", error);
        showMessage("error", "❌ Failed to set up wallet view. Please try again.");
      }
    },
    [loadCurrentChainBalance, showMessage],
  );

  const value = {
    // UI state
    showLanding,
    setShowLanding,
    showSignUpModal,
    setShowSignUpModal,
    showLoginModal,
    setShowLoginModal,

    // Circle-specific state
    isCircleUser,
    circleUserData,
    setCircleUserData,

    // web3/account state
    web3,
    account,
    currentChainName,
    accountBalance,

    // actions
    connectWallet,
    disconnectWallet,
    handleCircleSuccess,
    handleCircleLoginSuccess,
    loadCurrentChainBalance,

    // message helper
    message,
    showMessage,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

/**
 * Hook to consume onboarding context
 */
export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}
