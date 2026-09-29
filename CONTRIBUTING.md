# Contributing to RoboLab Chain

Thank you for your interest in contributing to RoboLab Chain! This project was built for the BMSCE Hackathon exploring decentralized robotics verification on the MST Blockchain and NEWRRO simulation engine.

---

## Getting Started

1. **Fork and Clone** the repository:
   ```bash
   git clone https://github.com/avinashkumaarr/mstxnewrro.git
   cd mstxnewrro
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Backend Setup** (Optional for local simulation & WebSocket services):
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

---

## Branching & Workflow

- Create feature branches from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  # Or for bug fixes:
  git checkout -b fix/issue-description
  ```
- Keep commits concise, atomic, and descriptive.
- **Never commit secrets**, private keys, or `.env` files.

---

## Code Quality & Standards

- **TypeScript / Frontend**: Ensure all changes pass typechecking without errors:
  ```bash
  cd frontend
  npx tsc --noEmit
  npm run lint
  ```
- **Styling**: Use standard Tailwind CSS utility classes adhering to the project's dark cybersecurity aesthetic.
- **Smart Contracts**: Validate Solidity contracts via Hardhat in `web3/`:
  ```bash
  cd web3
  npx hardhat compile
  ```

---

## Pull Request Guidelines

1. Ensure the development server runs cleanly without build or runtime errors.
2. Verify that no personal credentials or hardcoded sensitive data are included.
3. Open a Pull Request against `main` with a clear description of the problem solved and testing performed.
