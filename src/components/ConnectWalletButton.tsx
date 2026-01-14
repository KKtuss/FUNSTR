"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function ConnectWalletButton() {
  return (
    <div className="solana-wallet-wrapper">
      <WalletMultiButton className="!rounded-full !bg-white/10 !px-4 !py-2 !text-sm !font-semibold !text-white !transition hover:!bg-white/20" />
    </div>
  );
}
