"use client";
import React from "react";

export default function ConnectButton({ connected, onConnect, onDisconnect, account }) {
  return (
    <div>
      {!connected ? (
        <button
          onClick={onConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-200 rounded text-sm">
            {account}
          </div>
          <button
            onClick={onDisconnect}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
