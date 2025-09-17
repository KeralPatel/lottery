# Lottery Next.js Frontend

This is a Next.js + Tailwind frontend for your Lottery contract.

## Setup

1. Replace `abi/LotteryABI.json` with the ABI from your compiled Lottery.sol.
2. Set your deployed contract address in `lib/lottery.js`.
3. Update WalletConnect RPC config in `app/page.jsx` with KXCO RPC details.
4. Install dependencies:
   ```bash
   npm install
   npm run dev
   ```
5. Deploy to Vercel.

