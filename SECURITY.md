# Security Policy

## Responsible Disclosure

If you discover a security vulnerability or sensitive credential exposure in RoboLab Chain, please report it responsibly. Please do not open public GitHub issues for security vulnerabilities.

Instead, please contact the repository maintainers through GitHub Private Vulnerability Reporting or via private message to the project maintainer.

---

## Security Best Practices

When contributing or running RoboLab Chain locally or in production:

1. **Private Keys & Seed Phrases**:
   - Never commit private keys, mnemonics, or seed phrases to the repository.
   - Use testnet wallets with zero real economic value.
   - Do not use production wallets for testnet development.

2. **Frontend Environment Variables**:
   - Variables prefixed with `NEXT_PUBLIC_` are exposed in browser bundles. Never place secret keys or database credentials in `NEXT_PUBLIC_` variables.

3. **Smart Contract Interactions**:
   - Smart contracts on testnets should be audited prior to any mainnet deployment.
   - Use principle of least privilege for contract roles (e.g. `ANCHOR_ROLE`, `OPERATOR_ROLE`).

4. **Document Integrity Verification**:
   - Document verification checks cryptographic SHA-256 integrity against the on-chain registry. A valid hash match confirms that the document content has not changed since registration. It does not replace independent legal verification of real-world claims.
