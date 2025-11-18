/**
 * Arcpay-frontend/src/hooks/useWeb3Login.js
 *
 * Hook to encapsulate wallet (MetaMask) connection logic.
 *
 * Usage:
 *   const { connectWallet, disconnectWallet, web3Ref } = useWeb3Login({
 *     setWeb3,
 *     setAccount,
 *     setCurrentChainName,
 *     setShowLanding,
 *     showMessage,
 *     getChainName,          // optional helper to humanize chain names
 *     desiredChainIdHex,     // optional: desired chainId in hex (e.g. CHAIN_CONFIG.ARC_TESTNET.chainId)
 *     chainConfigToAdd,      // optional: chain config object to add if missing
 *   });
 *
 * Notes:
 * - This hook does not keep internal React state (it uses callbacks passed from the parent).
 * - It returns `web3Ref` (a mutable ref) so the parent can read the created web3 instance if needed.
 */

import { useRef, useCallback, useEffect } from "react";

export default function useWeb3Login({
  // required setters / callbacks from the parent (App)
  setWeb3 = () => {},
  setAccount = () => {},
  setCurrentChainName = () => {},
  setShowLanding = () => {},
  showMessage = () => {},

  // optional helpers
  getChainName = null,
  // optionally accept a desired chain id in hex string format, e.g. '0x4' or '0x4a'
  desiredChainIdHex = null,
  // optionally accept a chain config (object) to add (wallet_addEthereumChain) if the chain is not present
  chainConfigToAdd = null,
} = {}) {
  const web3Ref = useRef(null);

  // Helper: attempt to switch the wallet chain
  const trySwitchToDesiredChain = useCallback(async () => {
    if (!desiredChainIdHex || !window.ethereum) return { ok: true };
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: desiredChainIdHex }],
      });
      return { ok: true };
    } catch (switchError) {
      // 4902 => chain not added to the wallet
      if (switchError && switchError.code === 4902 && chainConfigToAdd) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainConfigToAdd],
          });
          return { ok: true };
        } catch (addErr) {
          return { ok: false, error: addErr };
        }
      }
      return { ok: false, error: switchError };
    }
  }, [desiredChainIdHex, chainConfigToAdd]);

  // Connect wallet (MetaMask)
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        showMessage("error", "Please install MetaMask");
        return;
      }

      // Load Web3 dynamically (same version used elsewhere in the project)
      const web3Module = await import(
        "https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm"
      );
      const Web3 = web3Module?.default || web3Module;
      const web3Instance = new Web3(window.ethereum);

      // Request accounts access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Optionally try to switch to a desired chain before reading chainId
      if (desiredChainIdHex) {
        await trySwitchToDesiredChain();
      }

      const accounts = await web3Instance.eth.getAccounts();
      const chainIdRaw = await web3Instance.eth.getChainId();

      // normalize chainId to a number (web3 v4 may return BigInt)
      let chainIdNum;
      try {
        chainIdNum =
          typeof chainIdRaw === "bigint"
            ? Number(chainIdRaw)
            : Number(chainIdRaw);
      } catch (e) {
        chainIdNum = Number(chainIdRaw);
      }

      // set refs / parent state
      web3Ref.current = web3Instance;
      setWeb3(web3Instance);
      setAccount(accounts && accounts[0] ? accounts[0] : "");
      // use provided getChainName helper if available
      if (typeof getChainName === "function") {
        try {
          setCurrentChainName(getChainName(chainIdNum));
        } catch (e) {
          setCurrentChainName(String(chainIdNum));
        }
      } else {
        setCurrentChainName(String(chainIdNum));
      }

      setShowLanding(false);
      showMessage("success", "✅ Connected to ArcPay!");
    } catch (error) {
      console.error("Connection error:", error);
      showMessage(
        "error",
        "Connection failed: " +
          (error && error.message ? error.message : String(error)),
      );
    }
  }, [
    desiredChainIdHex,
    trySwitchToDesiredChain,
    setWeb3,
    setAccount,
    setCurrentChainName,
    setShowLanding,
    showMessage,
    getChainName,
  ]);

  const disconnectWallet = useCallback(() => {
    web3Ref.current = null;
    setWeb3(null);
    setAccount("");
    setShowLanding(true);
    showMessage("success", "Disconnected");
  }, [setWeb3, setAccount, setShowLanding, showMessage]);

  return { connectWallet, disconnectWallet, web3Ref };
}
