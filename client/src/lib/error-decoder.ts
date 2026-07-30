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

  // 3. Custom Soroban Contract Revert Codes (Errors 100-106)
  if (message.includes("Error(Contract, U32(1))") || message.includes("U32(1)") || message.includes("NotAuthorized") || message.includes("Error 100")) {
    return {
      code: "CONTRACT_NOT_AUTHORIZED",
      title: "Action Unauthorized",
      description: "The smart contract rejected your request (Contract Revert U32(1)). Only the contract administrator account is authorized to invoke this function.",
      remedy: "Check that your connected wallet matches the current administrator key (Privilege Key).",
      severity: "high",
    };
  }

  if (message.includes("Error(Contract, U32(2))") || message.includes("U32(2)") || message.includes("InstitutionAlreadyExists") || message.includes("Error 101")) {
    return {
      code: "CONTRACT_INSTITUTION_EXISTS",
      title: "Institution Already Registered",
      description: "The smart contract registration failed (Contract Revert U32(2)). This wallet address is already registered as an active institution on CredChain.",
      remedy: "An institution can only be registered once. Access the issuer console using your registered address.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(3))") || message.includes("U32(3)") || message.includes("InstitutionNotRegistered") || message.includes("Error 102")) {
    return {
      code: "CONTRACT_INSTITUTION_NOT_FOUND",
      title: "Institution Not Registered",
      description: "The operation failed because the caller is not a registered institution (Contract Revert U32(3)). Only registered institutions can issue or revoke credentials.",
      remedy: "Navigate to the home page or register dashboard and sign up your institution wallet first.",
      severity: "high",
    };
  }

  if (message.includes("Error(Contract, U32(4))") || message.includes("U32(4)") || message.includes("CertificateAlreadyExists") || message.includes("Error 103")) {
    return {
      code: "CONTRACT_CERTIFICATE_EXISTS",
      title: "Certificate ID Already Issued",
      description: "The contract rejected the issuance (Contract Revert U32(4)). A credential with this specific Certificate ID has already been recorded on the ledger.",
      remedy: "Choose a different unique ID number or counter sequence to register this new certificate.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(5))") || message.includes("U32(5)") || message.includes("CertificateNotExists") || message.includes("Error 104")) {
    return {
      code: "CONTRACT_CERTIFICATE_NOT_FOUND",
      title: "Certificate Not Found",
      description: "The lookup or revocation failed (Contract Revert U32(5)). The requested certificate ID is not registered on the Stellar blockchain.",
      remedy: "Verify the certificate ID spelling and confirm it was successfully submitted to the ledger.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(6))") || message.includes("U32(6)") || message.includes("CertificateAlreadyRevoked") || message.includes("Error 105")) {
    return {
      code: "CONTRACT_CERTIFICATE_REVOKED",
      title: "Certificate Already Revoked",
      description: "The transaction aborted (Contract Revert U32(6)). This certificate has already been revoked by its issuing institution and cannot be modified further.",
      remedy: "No action required. Revoked certificates are permanently locked on-chain.",
      severity: "medium",
    };
  }

  if (message.includes("Error(Contract, U32(7))") || message.includes("U32(7)") || message.includes("InvalidInput") || message.includes("Error 106")) {
    return {
      code: "CONTRACT_INVALID_INPUT",
      title: "Invalid Contract Arguments",
      description: "The transaction simulation failed (Contract Revert U32(7)). The parameters provided (e.g. empty names, negative fees) violate contract constraints.",
      remedy: "Review the input fields in the form to ensure they comply with character length and negative value limits.",
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
