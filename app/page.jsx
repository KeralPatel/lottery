"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import ConnectButton from "../components/ConnectButton";
import { getContract, CONTRACT_ADDRESS } from "../lib/lottery";

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

export default function Home() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [connected, setConnected] = useState(false);

    const [playersCount, setPlayersCount] = useState(0);
    const [prizePool, setPrizePool] = useState("0");
    const [ticketPrice, setTicketPrice] = useState("0");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(false);

    function formatAddress(addr) {
        if (!addr) return "";
        return addr.slice(0, 6) + "..." + addr.slice(-4);
    }

    async function connectMetaMask() {
        if (!window.ethereum) return alert("MetaMask not detected");
        const ep = new ethers.BrowserProvider(window.ethereum);
        await ep.send("eth_requestAccounts", []);
        const s = await ep.getSigner();
        const addr = await s.getAddress();
        setProvider(window.ethereum);
        setSigner(s);
        setAccount(addr);
        setConnected(true);
        const c = getContract(s);
        setContract(c);
        checkOwner(c, addr);
    }

    async function connectWalletConnect() {
        const wcProvider = new WalletConnectProvider({
            rpc: {
                1337: "https://your-kxco-rpc-url" // replace
            }
        });
        await wcProvider.enable();
        const ep = new ethers.BrowserProvider(wcProvider);
        const s = await ep.getSigner();
        const addr = await s.getAddress();
        setProvider(wcProvider);
        setSigner(s);
        setAccount(addr);
        setConnected(true);
        const c = getContract(s);
        setContract(c);
        checkOwner(c, addr);
    }

    function disconnect() {
        setProvider(null);
        setSigner(null);
        setContract(null);
        setAccount(null);
        setConnected(false);
    }

    async function checkOwner(c, addr) {
        try {
            const mgr = await c.manager();
            setIsOwner(mgr.toLowerCase() === addr.toLowerCase());
        } catch {
            setIsOwner(false);
        }
    }

    async function loadData() {
        if (!contract || !signer) return;
        setLoading(true);
        try {
            const tp = await contract.ticketPrice();
            const tokenAddr = await contract.paymentToken();
            const erc20 = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

            const decimals = await erc20.decimals();
            const symbol = await erc20.symbol();

            setTicketPrice(ethers.formatUnits(tp, decimals));
            setTokenSymbol(symbol);

            const players = await contract.getPlayers();
            setPlayersCount(players.length);

            const pool = await contract.prizePool();
            setPrizePool(ethers.formatUnits(pool, decimals));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (contract) loadData();
    }, [contract]);

    async function buyTicket() {
        if (!contract || !signer) return;
        setLoading(true);
        try {
            const tokenAddr = await contract.paymentToken();
            const erc20 = new ethers.Contract(tokenAddr, ERC20_ABI, signer);

            const decimals = await erc20.decimals();
            const amount = ethers.parseUnits(ticketPrice, decimals);

            const approveTx = await erc20.approve(CONTRACT_ADDRESS, amount);
            await approveTx.wait();

            const tx = await contract.enter();
            await tx.wait();

            loadData();
        } finally {
            setLoading(false);
        }
    }

    async function pickWinner() {
        if (!contract) return;
        const tx = await contract.pickWinner();
        await tx.wait();
        loadData();
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-indigo-700">🎟️ Lottery DApp</h1>
                    <ConnectButton
                        connected={connected}
                        account={formatAddress(account)}
                        onConnect={() => {
                            const choice = window.confirm("OK = MetaMask, Cancel = WalletConnect");
                            choice ? connectMetaMask() : connectWalletConnect();
                        }}
                        onDisconnect={disconnect}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-indigo-50 rounded-xl text-center shadow-sm">
                        <div className="text-sm text-gray-500">Players</div>
                        <div className="text-2xl font-bold text-indigo-700">{playersCount}</div>
                    </div>
                    <div className="p-6 bg-purple-50 rounded-xl text-center shadow-sm">
                        <div className="text-sm text-gray-500">Prize Pool</div>
                        <div className="text-2xl font-bold text-purple-700">
                            {prizePool} {tokenSymbol}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={buyTicket}
                        disabled={!connected || loading}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md transition"
                    >
                        {loading ? "Processing..." : `Buy Ticket (${ticketPrice} ${tokenSymbol})`}
                    </button>

                    {isOwner && (
                        <button
                            onClick={pickWinner}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-md transition"
                        >
                            {loading ? "Processing..." : "Pick Winner"}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}
