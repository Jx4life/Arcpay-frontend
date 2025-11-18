export const formatUnits = (value, decimals) => {
  const str = value.toString().padStart(decimals + 1, "0");
  const intPart = str.slice(0, -decimals) || "0";
  const decPart = str.slice(-decimals);
  return parseFloat(`${intPart}.${decPart}`).toFixed(2);
};

export const parseUnits = (value, decimals) => {
  const [intPart, decPart = ""] = value.split(".");
  const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(intPart + paddedDec);
};

export const getChainName = (chainId) => {
  const names = {
    5042002: "Arc Testnet",
    11155111: "Ethereum Sepolia",
    84532: "Base Sepolia",
    421614: "Arbitrum Sepolia",
    43113: "Avalanche Fuji",
    80002: "Polygon Amoy",
    11155420: "OP Sepolia",
  };
  return names[Number(chainId)] || "Unknown Chain";
};
