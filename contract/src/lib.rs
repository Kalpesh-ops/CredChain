#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, contractevent, panic_with_error, Address, Env, String, Vec};

#[contracttype]
pub enum DataKey {
    Institution(Address),
    Certificate(u64),
    NextCertId,
    InstitutionList,
    Admin,
    TokenAddress,
    TreasuryAddress,
    RegFee,
}

#[contracttype]
#[derive(Clone)]
pub struct Institution {
    pub name: String,
    pub verified: bool,
    pub cert_count: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct Certificate {
    pub id: u64,
    pub issuer: Address,
    pub recipient: Address,
    pub metadata_uri: String,
    pub issued_at: u64,
    pub revoked: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    NotRegistered = 1,
    AlreadyRegistered = 2,
    NotAuthorized = 3,
    CertificateNotFound = 4,
    AlreadyRevoked = 5,
}

#[contractevent(topics = ["inst_reg"])]
pub struct InstitutionRegisteredEvent {
    pub addr: Address,
}

#[contractevent(topics = ["cert_iss"])]
pub struct CertificateIssuedEvent {
    pub id: u64,
    pub issuer: Address,
    pub recipient: Address,
}

#[contractevent(topics = ["cert_rev"])]
pub struct CertificateRevokedEvent {
    pub id: u64,
    pub caller: Address,
}

#[contract]
pub struct CredChain;

#[contractimpl]
impl CredChain {
    pub fn configure_fees(
        env: Env,
        admin: Address,
        token: Address,
        treasury: Address,
        fee: i128,
    ) {
        admin.require_auth();
        if let Some(existing_admin) = env.storage().instance().get::<_, Address>(&DataKey::Admin) {
            if existing_admin != admin {
                panic_with_error!(&env, ContractError::NotAuthorized);
            }
        } else {
            env.storage().instance().set(&DataKey::Admin, &admin);
        }
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
        env.storage().instance().set(&DataKey::RegFee, &fee);
    }

    pub fn register_institution(env: Env, addr: Address, name: String) {
        addr.require_auth();
        if env.storage().persistent().has(&DataKey::Institution(addr.clone())) {
            panic_with_error!(&env, ContractError::AlreadyRegistered);
        }

        // Check if registration fee is configured
        if let Some(token_addr) = env.storage().instance().get::<_, Address>(&DataKey::TokenAddress) {
            if let Some(treasury_addr) = env.storage().instance().get::<_, Address>(&DataKey::TreasuryAddress) {
                if let Some(fee) = env.storage().instance().get::<_, i128>(&DataKey::RegFee) {
                    if fee > 0 {
                        // Inter-contract call to the token contract
                        let token_client = soroban_sdk::token::Client::new(&env, &token_addr);
                        token_client.transfer(&addr, &treasury_addr, &fee);
                    }
                }
            }
        }

        env.storage().persistent().set(
            &DataKey::Institution(addr.clone()),
            &Institution { name, verified: true, cert_count: 0 },
        );

        let mut list: Vec<Address> =
            env.storage().instance().get(&DataKey::InstitutionList).unwrap_or(Vec::new(&env));
        list.push_back(addr.clone());
        env.storage().instance().set(&DataKey::InstitutionList, &list);
        env.storage().instance().extend_ttl(5000, 10000);

        InstitutionRegisteredEvent { addr: addr.clone() }.publish(&env);
    }

    pub fn issue_certificate(
        env: Env,
        issuer: Address,
        recipient: Address,
        metadata_uri: String,
    ) -> u64 {
        issuer.require_auth();
        let inst: Institution = env.storage()
            .persistent()
            .get(&DataKey::Institution(issuer.clone()))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::NotRegistered));

        let next_id: u64 = env.storage().instance().get(&DataKey::NextCertId).unwrap_or(1);
        let issued_at = env.ledger().timestamp();

        env.storage().persistent().set(
            &DataKey::Certificate(next_id),
            &Certificate {
                id: next_id,
                issuer: issuer.clone(),
                recipient: recipient.clone(),
                metadata_uri,
                issued_at,
                revoked: false,
            },
        );
        env.storage().instance().set(&DataKey::NextCertId, &(next_id + 1));

        let mut inst_up = inst;
        inst_up.cert_count += 1;
        env.storage().persistent().set(&DataKey::Institution(issuer.clone()), &inst_up);

        CertificateIssuedEvent {
            id: next_id,
            issuer: issuer.clone(),
            recipient: recipient.clone(),
        }.publish(&env);

        next_id
    }

    pub fn revoke_certificate(env: Env, caller: Address, cert_id: u64) {
        caller.require_auth();
        let mut cert: Certificate = env.storage()
            .persistent()
            .get(&DataKey::Certificate(cert_id))
            .unwrap_or_else(|| panic_with_error!(&env, ContractError::CertificateNotFound));
        if cert.issuer != caller {
            panic_with_error!(&env, ContractError::NotAuthorized);
        }
        if cert.revoked {
            panic_with_error!(&env, ContractError::AlreadyRevoked);
        }
        cert.revoked = true;
        env.storage().persistent().set(&DataKey::Certificate(cert_id), &cert);
        CertificateRevokedEvent { id: cert_id, caller }.publish(&env);
    }

    pub fn get_certificate(env: Env, cert_id: u64) -> Option<Certificate> {
        env.storage().persistent().get(&DataKey::Certificate(cert_id))
    }

    pub fn get_institution(env: Env, addr: Address) -> Option<Institution> {
        env.storage().persistent().get(&DataKey::Institution(addr))
    }

    pub fn verify_certificate(env: Env, cert_id: u64) -> bool {
        match env.storage().persistent().get::<_, Certificate>(&DataKey::Certificate(cert_id)) {
            Some(cert) => !cert.revoked,
            None => false,
        }
    }

    pub fn is_institution(env: Env, addr: Address) -> bool {
        env.storage().persistent().has(&DataKey::Institution(addr))
    }

    pub fn get_all_institutions(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::InstitutionList)
            .unwrap_or(Vec::new(&env))
    }
}

mod test;
