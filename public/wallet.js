// public/wallet.js
(function initSharedWalletHelpers() {
  "use strict";

  const sdk = window.PeraWalletConnect && window.PeraWalletConnect.PeraWalletConnect;
  const peraWallet = sdk ? new sdk({ shouldShowSignTxnToast: true }) : null;
  const walletBtn = document.getElementById("wallet-btn") || document.getElementById("connect-wallet-btn");
  let connectedAccount = localStorage.getItem("walletAddress") || null;

  function shortAddress(address) {
    if (!address || address.length < 12) {
      return address || "";
    }
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  function updateWalletButton(address) {
    if (!walletBtn) {
      return;
    }
    if (address) {
      walletBtn.textContent = shortAddress(address);
      walletBtn.setAttribute("aria-label", "Disconnect Wallet");
    } else {
      walletBtn.textContent = "Connect Wallet";
      walletBtn.setAttribute("aria-label", "Connect Wallet");
    }
  }

  async function sharedConnectWallet() {
    if (!peraWallet) {
      return null;
    }
    try {
      const accounts = await peraWallet.connect();
      const account = Array.isArray(accounts) ? accounts[0] : null;
      if (account) {
        connectedAccount = account;
        localStorage.setItem("walletAddress", account);
        updateWalletButton(account);
      }
      return account;
    } catch (error) {
      const message = String((error && error.message) || "");
      if (!message.includes("CONNECT_MODAL_CLOSED")) {
        console.error("Connection failed:", error);
      }
      return null;
    }
  }

  async function sharedDisconnectWallet() {
    if (peraWallet && peraWallet.disconnect) {
      try {
        await peraWallet.disconnect();
      } catch (error) {
        console.log("Wallet disconnect note:", error);
      }
    }
    connectedAccount = null;
    localStorage.removeItem("walletAddress");
    updateWalletButton(null);
    return null;
  }

  async function reconnectWallet() {
    const cached = localStorage.getItem("walletAddress");
    if (cached) {
      updateWalletButton(cached);
    }

    if (!peraWallet || !peraWallet.reconnectSession) {
      return null;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Wallet reconnect timeout")), 3000);
      });
      const accounts = await Promise.race([peraWallet.reconnectSession(), timeoutPromise]);
      const account = Array.isArray(accounts) ? accounts[0] : null;
      if (account) {
        connectedAccount = account;
        localStorage.setItem("walletAddress", account);
        updateWalletButton(account);
      } else {
        connectedAccount = null;
        localStorage.removeItem("walletAddress");
        updateWalletButton(null);
      }
      return account;
    } catch (_error) {
      connectedAccount = null;
      localStorage.removeItem("walletAddress");
      updateWalletButton(null);
      return null;
    }
  }

  async function sendPayment(receiverAddress, amountInAlgo) {
    try {
      const algosdk = window.algosdk;
      if (!algosdk) {
        throw new Error("algosdk not loaded");
      }

      if (!peraWallet) {
        throw new Error("Pera Wallet SDK is unavailable");
      }

      if (!connectedAccount) {
        connectedAccount = await sharedConnectWallet();
      }

      if (!connectedAccount) {
        throw new Error("Wallet is not connected");
      }

      if (!receiverAddress || Number(amountInAlgo) <= 0) {
        throw new Error("Invalid receiver address or amount");
      }

      const algodClient = new algosdk.Algodv2(
        "",
        "https://testnet-api.algonode.cloud",
        443
      );

      const suggestedParams = await algodClient.getTransactionParams().do();

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: connectedAccount,
        receiver: receiverAddress,
        amount: algosdk.algosToMicroalgos(Number(amountInAlgo)),
        suggestedParams
      });

      const signedTxnResult = await peraWallet.signTransaction([[{ txn }]]);
      const signedTxn = Array.isArray(signedTxnResult)
        ? (Array.isArray(signedTxnResult[0]) ? signedTxnResult[0][0] : signedTxnResult[0])
        : signedTxnResult;

      const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
      console.log("Transaction sent! TxID:", txid);

      await algosdk.waitForConfirmation(algodClient, txid, 4);
      console.log("Confirmed!");

      return txid;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  if (typeof window.connectWallet !== "function") {
    window.connectWallet = sharedConnectWallet;
  }
  if (typeof window.disconnectWallet !== "function") {
    window.disconnectWallet = sharedDisconnectWallet;
  }
  if (typeof window.reconnectWallet !== "function") {
    window.reconnectWallet = reconnectWallet;
  }
  if (typeof window.sendPayment !== "function") {
    window.sendPayment = sendPayment;
  }

  void reconnectWallet();
})();