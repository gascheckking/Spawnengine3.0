// ======================================================
// SpawnEngine Wallet Provider (fixed version)
// ======================================================

export async function requestProvider() {
  try {
    // 🧠 check if a provider is already injected (MetaMask, Coinbase, etc.)
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("🦊 Wallet provider detected:", window.ethereum.isMetaMask ? "MetaMask" : "Injected");
      return window.ethereum;
    }

    // 🪄 if no provider, try to dynamically import fallback (e.g. ethers.js)
    const { ethers } = await import("ethers");

    // this fallback ensures we never overwrite read-only ethereum
    const provider = new ethers.BrowserProvider(window.ethereum ?? "any");

    // ✅ never redefine ethereum (caused crash before)
    if (!window.ethereum) {
      Object.defineProperty(window, "ethereum", {
        value: provider,
        writable: false,
        configurable: false,
      });
    }

    return provider;
  } catch (err) {
    console.error("❌ requestProvider error:", err);
    throw err;
  }
}

// Simple connect function
export async function connectWallet() {
  const provider = await requestProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = accounts[0];
  console.log("✅ Connected wallet:", account);
  return account;
}