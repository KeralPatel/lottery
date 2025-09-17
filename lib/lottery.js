import ABI from "../abi/LotteryABI.json";
import { ethers } from "ethers";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}
