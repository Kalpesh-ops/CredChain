#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Events, Env, Event, String};

#[test]
fn test_register_institution() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let addr = Address::generate(&env);
    client.register_institution(&addr, &String::from_str(&env, "Test University"));

    let inst = client.get_institution(&addr).unwrap();
    assert_eq!(inst.name, String::from_str(&env, "Test University"));
    assert!(inst.verified);
    assert_eq!(inst.cert_count, 0);
    assert!(client.is_institution(&addr));
}

#[test]
fn test_register_institution_already_registered() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let addr = Address::generate(&env);
    client.register_institution(&addr, &String::from_str(&env, "Test University"));

    let result = client.try_register_institution(&addr, &String::from_str(&env, "Duplicate"));
    assert!(result.is_err());
}

#[test]
fn test_issue_certificate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.register_institution(&issuer, &String::from_str(&env, "MIT"));

    let cert_id = client.issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCert123"),
    );
    assert_eq!(cert_id, 1);

    let cert = client.get_certificate(&cert_id).unwrap();
    assert_eq!(cert.id, 1);
    assert_eq!(cert.issuer, issuer);
    assert_eq!(cert.recipient, recipient);
    assert_eq!(
        cert.metadata_uri,
        String::from_str(&env, "ipfs://QmCert123")
    );
    assert!(!cert.revoked);
    assert_eq!(cert.issued_at, env.ledger().timestamp());

    let inst = client.get_institution(&issuer).unwrap();
    assert_eq!(inst.cert_count, 1);
}

#[test]
fn test_issue_certificate_not_registered() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);

    let result = client.try_issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCert"),
    );
    assert!(result.is_err());
}

#[test]
fn test_revoke_certificate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.register_institution(&issuer, &String::from_str(&env, "Stanford"));
    let cert_id = client.issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCert456"),
    );

    assert!(client.verify_certificate(&cert_id));
    client.revoke_certificate(&issuer, &cert_id);
    assert!(!client.verify_certificate(&cert_id));

    let cert = client.get_certificate(&cert_id).unwrap();
    assert!(cert.revoked);
}

#[test]
fn test_revoke_certificate_not_authorized() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let other = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.register_institution(&issuer, &String::from_str(&env, "Harvard"));
    client.register_institution(&other, &String::from_str(&env, "Other"));

    let cert_id = client.issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCert789"),
    );

    let result = client.try_revoke_certificate(&other, &cert_id);
    assert!(result.is_err());
}

#[test]
fn test_revoke_certificate_already_revoked() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.register_institution(&issuer, &String::from_str(&env, "Yale"));
    let cert_id = client.issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCert101"),
    );

    client.revoke_certificate(&issuer, &cert_id);
    let result = client.try_revoke_certificate(&issuer, &cert_id);
    assert!(result.is_err());
}

#[test]
fn test_get_certificate_not_found() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let cert = client.get_certificate(&999);
    assert!(cert.is_none());
}

#[test]
fn test_verify_certificate_not_found() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    assert!(!client.verify_certificate(&999));
}

#[test]
fn test_is_institution() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let addr = Address::generate(&env);
    assert!(!client.is_institution(&addr));

    client.register_institution(&addr, &String::from_str(&env, "Test College"));
    assert!(client.is_institution(&addr));
}

#[test]
fn test_get_all_institutions() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let insts = client.get_all_institutions();
    assert_eq!(insts.len(), 0);

    let addr1 = Address::generate(&env);
    let addr2 = Address::generate(&env);
    client.register_institution(&addr1, &String::from_str(&env, "Uni A"));
    client.register_institution(&addr2, &String::from_str(&env, "Uni B"));

    let insts = client.get_all_institutions();
    assert_eq!(insts.len(), 2);
}

#[test]
fn test_multiple_certificates() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    client.register_institution(&issuer, &String::from_str(&env, "Test Uni"));

    let r1 = Address::generate(&env);
    let r2 = Address::generate(&env);
    let r3 = Address::generate(&env);

    assert_eq!(
        client.issue_certificate(&issuer, &r1, &String::from_str(&env, "uri1")),
        1
    );
    assert_eq!(
        client.issue_certificate(&issuer, &r2, &String::from_str(&env, "uri2")),
        2
    );
    assert_eq!(
        client.issue_certificate(&issuer, &r3, &String::from_str(&env, "uri3")),
        3
    );

    let inst = client.get_institution(&issuer).unwrap();
    assert_eq!(inst.cert_count, 3);
}

#[test]
fn test_events_emitted() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let addr = Address::generate(&env);
    client.register_institution(&addr, &String::from_str(&env, "Event Uni"));

    assert_eq!(
        env.events().all(),
        std::vec![InstitutionRegisteredEvent { addr: addr.clone() }.to_xdr(&env, &contract_id)]
    );
}

#[test]
fn test_full_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);

    client.register_institution(&issuer, &String::from_str(&env, "Lifecycle Uni"));
    assert!(client.is_institution(&issuer));

    let cert_id = client.issue_certificate(
        &issuer,
        &recipient,
        &String::from_str(&env, "ipfs://QmCycle"),
    );
    assert!(client.verify_certificate(&cert_id));

    client.revoke_certificate(&issuer, &cert_id);
    assert!(!client.verify_certificate(&cert_id));

    let cert = client.get_certificate(&cert_id).unwrap();
    assert!(cert.revoked);
}

#[test]
fn test_revoke_not_found() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let caller = Address::generate(&env);
    let result = client.try_revoke_certificate(&caller, &999);
    assert!(result.is_err());
}

#[test]
fn test_configure_fees_and_registration_fee_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    // Register the Stellar Asset Token contract
    let token_admin = Address::generate(&env);
    let token_contract_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = soroban_sdk::token::Client::new(&env, &token_contract_id.address());
    let token_admin_client =
        soroban_sdk::token::StellarAssetClient::new(&env, &token_contract_id.address());

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let institution = Address::generate(&env);
    let fee: i128 = 10_000_000; // 1 XLM / 10M stroops

    // Configure fees
    client.configure_fees(&admin, &token_contract_id.address(), &treasury, &fee);

    // Mint tokens to the institution
    token_admin_client.mint(&institution, &fee);
    assert_eq!(token_client.balance(&institution), fee);
    assert_eq!(token_client.balance(&treasury), 0);

    // Register the institution (which should trigger the inter-contract fee transfer)
    client.register_institution(&institution, &String::from_str(&env, "Stanford Uni"));

    // Verify institution is registered
    assert!(client.is_institution(&institution));

    // Verify fee was transferred to treasury
    assert_eq!(token_client.balance(&institution), 0);
    assert_eq!(token_client.balance(&treasury), fee);
}

#[test]
fn test_register_institution_empty_name() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let addr = Address::generate(&env);
    let result = client.try_register_institution(&addr, &String::from_str(&env, ""));
    assert!(result.is_err());
}

#[test]
fn test_issue_certificate_empty_metadata() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(CredChain, ());
    let client = CredChainClient::new(&env, &contract_id);

    let issuer = Address::generate(&env);
    let recipient = Address::generate(&env);
    client.register_institution(&issuer, &String::from_str(&env, "MIT"));

    let result = client.try_issue_certificate(&issuer, &recipient, &String::from_str(&env, ""));
    assert!(result.is_err());
}
