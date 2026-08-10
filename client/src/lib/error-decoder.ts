/**
 * Decentralized Error Decoder for Stellar & Soroban applications.
 * Translates raw ledger exceptions, contract revert codes, wallet rejections,
 * and HTTP gateway statuses into human-readable details.
 */

export interface DecodedError {
  code: string;
  title: string;
  description: string;
  remedy: string;
  severity: "low" | "medium" | "high" | "critical";
}

export function decodeError(error: unknown): DecodedError {
  if (!error) {
    return {
      code: "UNKNOWN",
      title: "Unexpected Error Occurred",
      description: "An undefined error occurred in the application execution pipeline.",
      remedy: "Please reload the page or contact support if the issue persists.",
      severity: "low",
    };
  }

  const message = typeof error === "string" 
    ? error 
    : (error as Error).message || JSON.stringify(error);

  // 1. Wallet & User Connection Errors
  if (
    message.includes("closed") || 
    message.includes("user closed") || 
    message.includes("cancelled") ||
    message.includes("cancel")
  ) {
    return {
      code: "WALLET_CLOSED",
      title: "Signature Request Cancelled",
      description: "The authentication or signing session was closed by the user before approval.",
      remedy: "Re-initiate the action and authorize the transaction inside your wallet browser extension popup.",
      severity: "low",
    };
  }

  if (
    message.includes("rejected") || 
    message.includes("User rejected") || 
    message.includes("declined")
  ) {
    return {
      code: "WALLET_REJECTED",
      title: "Transaction Signature Rejected",
      description: "You explicitly declined to sign the transaction payload in your Stellar wallet extension.",
      remedy: "If this was an accident, click the button again and select 'Approve' or 'Sign' in your wallet modal.",
      severity: "low",
    };
  }

  if (
    message.includes("not installed") || 
    message.includes("not found") || 
    message.includes("install") ||
    message.includes("no provider")
  ) {
    return {
      code: "WALLET_NOT_INSTALLED",
      title: "Stellar Wallet Extension Missing",
      description: "No supported Stellar Web3 wallet (such as Freighter, xBull, or Albedo) was detected in your browser window context.",
      remedy: "Download and install the Freighter Wallet extension or Albedo browser helper to interact with CredChain.",
      severity: "medium",
    };
  }

  if (message.includes("Wallet not connected") || message.includes("connect wallet")) {
    return {
      code: "WALLET_NOT_CONNECTED",
      title: "Wallet Not Linked",
      description: "This operation requires an active Web3 wallet keypair connection to authenticate.",
      remedy: "Click the 'Connect Wallet' button in the navigation bar, authenticate your public key, and retry.",
      severity: "low",
    };
  }

  // 2. Stellar/Soroban Protocol Fees & Balances
  if (
    message.includes("op_underfunded") || 
    message.includes("underfunded") || 
    message.includes("insufficient_balance") ||
    message.includes("insufficient balance")
  ) {
    return {
      code: "TX_UNDERFUNDED",
      title: "Insufficient XLM Balance",
      description: "Your connected Stellar account does not hold enough native XLM tokens to complete this operation and reserve ledger state fees.",
      remedy: "Fund your account using the Stellar Testnet Friendbot faucet in the dashboard, or transfer XLM to your address.",
      severity: "high",
    };
  }

  if (message.includes("tx_too_late") || message.includes("timeout") || message.includes("Timebound")) {
    return {
      code: "TX_TOO_LATE",
      title: "Transaction Session Expired",
      description: "The transaction expired on-chain because the submission window closed before the transaction reached the ledger.",
      remedy: "Your transaction was safely aborted without fee charges. Re-submit the request; transaction time bounds have been widened.",
      severity: "medium",
    };
  }

  if (message.includes("tx_bad_seq") || message.includes("sequence number out of sync")) {
    return {
      code: "TX_BAD_SEQ",
      title: "Account Sequence Number Mismatch",
      description: "A transaction sequence conflict occurred. This happens when multiple contract calls are broadcast simultaneously from the same account.",
      remedy: "Wait 5-10 seconds for the pending transaction to be validated and committed to the ledger, then try again.",
      severity: "medium",
    };
  }

  // 3. Custom Soroban Contract Revert Codes.
  // These MUST stay in sync with the ContractError enum in contract/src/lib.rs:
  //   1 = NotRegistered, 2 = AlreadyRegistered, 3 = NotAuthorized,
  //   4 = CertificateNotFound, 5 = AlreadyRevoked, 6 = InvalidInput
  if (message.includes("Error(Contract, U32(1))") || message.includes("U32(1)") || message.includes("NotRegistered")) {
    return {
      code: "CONTRACT_NOT_REGISTERED",
      title: "Institution Not Registered",
      description: "The contract rejected the call (Contract Revert U32(1)). This wallet is not registered as an institution, and only registered institutions can issue certificates.",
      remedy: "Register your wallet as an institution on the App page first, then retry the issuance.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(2))") || message.includes("U32(2)") || message.includes("AlreadyRegistered")) {
    return {
      code: "CONTRACT_ALREADY_REGISTERED",
      title: "Institution Already Registered",
      description: "The registration failed (Contract Revert U32(2)). This wallet address is already registered as an institution on CredChain.",
      remedy: "An address can only be registered once. You can go straight to issuing certificates with this wallet.",
      severity: "low",
    };
  }

  if (message.includes("Error(Contract, U32(3))") || message.includes("U32(3)") || message.includes("NotAuthorized")) {
    return {
      code: "CONTRACT_NOT_AUTHORIZED",
      title: "Action Unauthorized",
      description: "The contract rejected the call (Contract Revert U32(3)). Certificates can only be revoked by the institution that issued them, and fee configuration is restricted to the contract admin.",
      remedy: "Connect the wallet that issued this certificate — or, for fee changes, the admin wallet bound at deployment.",
      severity: "high",
    };
  }

  if (message.includes("Error(Contract, U32(4))") || message.includes("U32(4)") || message.includes("CertificateNotFound")) {
    return {
      code: "CONTRACT_CERTIFICATE_NOT_FOUND",
      title: "Certificate Not Found",
      description: "The lookup or revocation failed (Contract Revert U32(4)). No certificate with that ID exists on this contract.",
      remedy: "Double-check the certificate ID and confirm it was issued against the currently configured contract address.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(5))") || message.includes("U32(5)") || message.includes("AlreadyRevoked")) {
    return {
      code: "CONTRACT_ALREADY_REVOKED",
      title: "Certificate Already Revoked",
      description: "The transaction aborted (Contract Revert U32(5)). This certificate has already been revoked by its issuing institution.",
      remedy: "No action required. Revocation is permanent and cannot be applied twice.",
      severity: "low",
    };
  }

  if (message.includes("Error(Contract, U32(6))") || message.includes("U32(6)") || message.includes("InvalidInput")) {
    return {
      code: "CONTRACT_INVALID_INPUT",
      title: "Invalid Contract Arguments",
      description: "The transaction simulation failed (Contract Revert U32(6)). The arguments violate a contract constraint — an empty institution name, an empty metadata URI, or a negative fee.",
      remedy: "Check that every field is filled in and that no fee value is negative, then resubmit.",
      severity: "medium",
    };
  }

  // 4. Horizon & RPC Gateway API Statuses
  if (message.includes("429") || message.includes("Too Many Requests")) {
    return {
      code: "HTTP_RATE_LIMIT",
      title: "API Request Rate Limit Exceeded",
      description: "The Stellar Horizon gateway or Soroban RPC node rejected the request (HTTP 429 Too Many Requests) due to high volume traffic.",
      remedy: "Wait 15-30 seconds for the request quota window to reset, then reload the page.",
      severity: "medium",
    };
  }

  if (message.includes("500") || message.includes("Internal Server Error")) {
    return {
      code: "HTTP_SERVER_ERROR",
      title: "Stellar RPC Node Internal Error",
      description: "The public Testnet server returned an HTTP 500 error. The gateway is temporarily offline or experiencing consensus sync lag.",
      remedy: "Wait a moment for node operators to restore service, or switch RPC node providers.",
      severity: "high",
    };
  }

  if (message.includes("404") || message.includes("Not Found")) {
    return {
      code: "HTTP_NOT_FOUND",
      title: "Resource Not Found",
      description: "The Horizon endpoint or requested blockchain resource (HTTP 404) could not be resolved by the public node.",
      remedy: "Ensure the contract address and user public key are valid on the active network.",
      severity: "low",
    };
  }

  if (message.includes("Network Error") || message.includes("fetch") || message.includes("Failed to fetch")) {
    return {
      code: "NETWORK_DISCONNECTED",
      title: "Internet Connection Lost",
      description: "The browser failed to establish a TCP/IP network connection to the Stellar Horizon gateway.",
      remedy: "Check your local internet connection, wi-fi router, and firewall settings before retrying.",
      severity: "high",
    };
  }

  // Fallback for general simulation/execution errors
  return {
    code: "LEDGER_TX_FAILED",
    title: "On-Chain Transaction Failed",
    description: `The transaction could not be simulated or verified by Soroban: ${message}`,
    remedy: "Double-check your inputs, ensure you have enough XLM, and submit again.",
    severity: "high",
  };
}
