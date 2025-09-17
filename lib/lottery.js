import ABI from "../abi/LotteryABI.json";
import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x02C3D3D5C37F285e4D59fC5E29172D9AbB0F1858";

export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}
