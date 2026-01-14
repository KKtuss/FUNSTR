"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
  PublicKey, 
  Transaction, 
  TransactionInstruction, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  ComputeBudgetProgram
} from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { Button } from "@/components/ui/Button";
import { token } from "@/lib/token";

// Treasury wallet that receives the FUNSTR tokens
const TREASURY_PUBKEY = new PublicKey("11111111111111111111111111111111"); 

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// Inline helper to find Associated Token Account (ATA) address
async function findAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const [address] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// Inline helper to create SPL Token TransferChecked instruction
// Layout: [12, amount_u64, decimals_u8]
function createSplTransferCheckedInstruction(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint,
  decimals: number
): TransactionInstruction {
  const data = new Uint8Array(10);
  const view = new DataView(data.buffer);
  view.setUint8(0, 12); // Instruction 12 = TransferChecked
  view.setBigUint64(1, amount, true); // Amount (u64 little endian)
  view.setUint8(9, decimals); // Decimals (u8)

  return new TransactionInstruction({
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.from(data),
  });
}

type DomainRow = {
  domain: string;
  status?: string;
  createdAt?: string;
  expires?: string;
  privacy?: boolean;
  autoRenew?: boolean;
  locked?: boolean;
  priceUsd?: number;
};

type ApiResponse =
  | {
      domains: DomainRow[];
      fetchedAt: string;
    }
  | { error: string; status?: number };

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function fmtFunstr(usdPrice?: number) {
  if (typeof usdPrice !== "number" || Number.isNaN(usdPrice)) return "—";
  const amount = Math.round(usdPrice * 100);
  return amount.toLocaleString();
}

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

// --- Components ---

function ConnectModal({
  isOpen,
  onClose,
  domain,
  priceUsd,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  priceUsd?: number;
  onConfirm: () => void;
}) {
  const [aRecord, setARecord] = React.useState("");
  const [cname, setCname] = React.useState("www");
  const [target, setTarget] = React.useState("parked.funstrategy.io");
  const [error, setError] = React.useState("");

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setARecord("");
      setCname("www");
      setTarget("parked.funstrategy.io");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const funstrPrice = priceUsd ? Math.round(priceUsd * 100).toLocaleString() : "0";

  const handleConfirm = () => {
    setError("");

    // Validation
    // Simple IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!aRecord.trim()) {
      setError("Please enter an A Record (IP Address).");
      return;
    }
    if (!ipv4Regex.test(aRecord.trim())) {
      setError("Invalid IP Address format (e.g. 192.168.1.1).");
      return;
    }
    if (!cname.trim()) {
      setError("Please enter a CNAME.");
      return;
    }
    if (!target.trim()) {
      setError("Please enter a Target.");
      return;
    }

    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-[#0a0a0a] ring-1 ring-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Connect Domain</h2>
          <p className="mt-1 text-sm text-white/60">Configure DNS records for <span className="text-cyan-300 font-mono">{domain}</span></p>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">A Record (IPv4) <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. 76.76.21.21" 
              value={aRecord}
              onChange={(e) => setARecord(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors placeholder:text-white/20"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">CNAME (Host) <span className="text-red-400">*</span></label>
            <input 
              type="text" 
              placeholder="www" 
              value={cname}
              onChange={(e) => setCname(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors placeholder:text-white/20"
            />
          </div>

           <div className="space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Target (@) <span className="text-red-400">*</span></label>
             <input 
              type="text" 
              placeholder="parked.funstrategy.io" 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="p-6 pt-2 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy & Connect ({funstrPrice} FUNSTR)
          </button>
        </div>
      </div>
    </div>
  );
}

export function DomainsClient() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [onlyAutoRenew, setOnlyAutoRenew] = React.useState(false);
  const [onlyPrivacy, setOnlyPrivacy] = React.useState(false);

  // Modal State
  const [selectedDomain, setSelectedDomain] = React.useState<DomainRow | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [txStatus, setTxStatus] = React.useState<"idle" | "pending" | "success" | "error">("idle");

  const parentRef = React.useRef<HTMLDivElement | null>(null);

  async function load(refresh = false) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/godaddy/domains${refresh ? "?refresh=1" : ""}`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      setData({ error: "Failed to load domains." });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load(false);
  }, []);

  const handleBuyClick = (domain: DomainRow) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const handleConfirmBuy = async () => {
    if (!publicKey || !selectedDomain) return;
    
    setIsModalOpen(false); // Close modal to show status
    setTxStatus("pending");

    try {
      const priceUsd = selectedDomain.priceUsd ?? 0;
      const funstrAmount = Math.round(priceUsd * 100);
      
      const mintAddress = new PublicKey(token.contractAddress || "11111111111111111111111111111111");
      const sourceAta = await findAssociatedTokenAddress(mintAddress, publicKey);
      const destAta = await findAssociatedTokenAddress(mintAddress, TREASURY_PUBKEY);

      const decimals = 6; 
      const rawAmount = BigInt(funstrAmount) * BigInt(10 ** decimals);

      // Use TransferChecked for better safety and wallet display
      const instruction = createSplTransferCheckedInstruction(
        sourceAta,
        mintAddress,
        destAta,
        publicKey,
        rawAmount,
        decimals
      );

      const transaction = new Transaction();
      
      // Add priority fee to help transaction land
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 100000, // 0.0001 SOL priority fee approx
        })
      );

      transaction.add(instruction);
      
      // Get fresh blockhash with context
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, { minContextSlot });
      
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");
      
      setTxStatus("success");
      
      // Reset after success (or update local state to show 'owned')
      setTimeout(() => setTxStatus("idle"), 3000);

    } catch (e) {
      console.error("Transfer failed:", e);
      setTxStatus("error");
      setTimeout(() => setTxStatus("idle"), 3000);
    }
  };

  const rows = React.useMemo(() => {
    if (!data || "error" in data) return [];
    const q = query.trim().toLowerCase();
    return data.domains
      .filter((d) => (q ? d.domain.toLowerCase().includes(q) : true))
      .filter((d) => (onlyAutoRenew ? d.autoRenew === true : true))
      .filter((d) => (onlyPrivacy ? d.privacy === true : true))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  }, [data, query, onlyAutoRenew, onlyPrivacy]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 14,
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black/40 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-100" />
      
      {/* Global Status Overlay */}
      {txStatus !== "idle" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           {txStatus === "pending" && (
             <div className="flex flex-col items-center gap-3">
               <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
               <div className="font-semibold text-white">Confirming Transaction...</div>
             </div>
           )}
           {txStatus === "success" && (
             <div className="flex flex-col items-center gap-3 text-green-400">
               <div className="text-2xl">✓</div>
               <div className="font-bold">Purchase Successful!</div>
             </div>
           )}
           {txStatus === "error" && (
             <div className="flex flex-col items-center gap-3 text-red-400">
               <div className="text-2xl">✕</div>
               <div className="font-bold">Transaction Failed</div>
             </div>
           )}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        domain={selectedDomain?.domain ?? ""}
        priceUsd={selectedDomain?.priceUsd}
        onConfirm={handleConfirmBuy}
      />
      
      <div className="relative z-10 flex flex-col gap-3 border-b border-white/5 p-4 sm:p-6 sm:flex-row sm:items-end sm:justify-between bg-black/20">
        <div>
          <div className="text-sm font-extrabold tracking-wide text-white sm:text-base uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Marketplace
          </div>
          <div className="mt-1 text-sm text-white/50 sm:text-base font-medium">
            {loading
              ? "Loading reserve..."
              : data && "error" in data
                ? "Unable to load domains"
                : `${rows.length.toLocaleString()} domains available`}
            {data && !("error" in data) && data.fetchedAt ? (
              <span className="text-white/20">
                {" "}
                • synced {fmtDate(data.fetchedAt)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="secondary" 
            onClick={() => void load(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs backdrop-blur-md"
          >
            Refresh List
          </Button>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 border-b border-white/5 p-4 sm:gap-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-md relative group">
            <div className="text-xs font-semibold tracking-wide text-white/40 sm:text-sm mb-2">
              Search
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a domain..."
                className="w-full rounded-2xl bg-black/30 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all sm:py-4 sm:text-base backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex gap-4 sm:mt-7">
            <label className="inline-flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-3 text-sm font-semibold text-white/70 ring-1 ring-white/10 hover:bg-black/40 hover:text-white transition-all cursor-pointer backdrop-blur-sm select-none">
              <input
                type="checkbox"
                checked={onlyAutoRenew}
                onChange={(e) => setOnlyAutoRenew(e.target.checked)}
                className="h-4 w-4 accent-cyan-500 rounded border-white/20 bg-white/5"
              />
              Premium
            </label>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-6 gap-0 border-b border-white/5 px-4 py-3 text-xs font-bold tracking-widest text-white/30 uppercase sm:px-6 sm:py-4 sm:text-xs sm:grid-cols-12 bg-black/20">
        <div className="col-span-3 sm:col-span-5">Domain</div>
        <div className="hidden sm:col-span-2 sm:block">Status</div>
        <div className="hidden sm:col-span-2 sm:block">Created</div>
        <div className="col-span-2 text-right sm:col-span-2">Price ($FUNSTR)</div>
        <div className="col-span-1 text-right sm:col-span-1">Action</div>
      </div>

      <div
        ref={parentRef}
        className="relative z-10 h-[60vh] overflow-auto sm:h-[70vh] custom-scrollbar"
        role="region"
        aria-label="Domains list"
      >
        {loading ? (
          <div className="p-4 text-sm text-white/60 sm:p-6 sm:text-base animate-pulse">
            Loading marketplace data…
          </div>
        ) : data && "error" in data ? (
          <div className="p-4 text-sm text-white/70 sm:p-6 sm:text-base">
            <div className="font-semibold text-red-400">Unable to load domains.</div>
            <div className="mt-2 text-white/60">
              Please try again later.
              {typeof data.status === "number" ? (
                <span className="text-white/45"> (HTTP {data.status})</span>
              ) : null}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-white/60 sm:p-6 sm:text-base text-center py-20">
            No matches found.
          </div>
        ) : (
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative">
            {rowVirtualizer.getVirtualItems().map((v) => {
              const d = rows[v.index];

              return (
                <div
                  key={v.key}
                  className={cn(
                    "absolute left-0 right-0 grid grid-cols-6 items-center gap-0 border-b border-white/5 px-4 text-sm sm:px-6 sm:text-base sm:grid-cols-12 transition-colors hover:bg-white/[0.03]",
                    v.index % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                  )}
                  style={{
                    transform: `translateY(${v.start}px)`,
                    height: `${v.size}px`,
                  }}
                >
                  <a
                    className="col-span-3 truncate font-bold text-white/90 hover:text-cyan-300 hover:underline sm:col-span-5 transition-colors"
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={d.domain}
                  >
                    {d.domain || "—"}
                  </a>
                  <div className="hidden sm:col-span-2 sm:block text-white/70">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      Available
                    </span>
                  </div>
                  <div className="hidden sm:col-span-2 sm:block text-white/50 font-mono text-xs">
                    {fmtDate(d.createdAt)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[13px] font-bold text-cyan-200 sm:col-span-2">
                    {fmtFunstr(d.priceUsd)}
                  </div>
                  <div className="col-span-1 flex justify-end sm:col-span-1">
                    {!connected ? (
                      <span className="text-xs font-medium text-white/40">Connect Wallet</span>
                    ) : (
                      <Button
                        variant="primary"
                        className="h-8 px-4 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 hover:scale-105"
                        onClick={() => handleBuyClick(d)}
                        disabled={!d.priceUsd}
                      >
                        Buy
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative z-10 border-t border-white/10 p-4 text-xs text-white/30 sm:p-6 sm:text-sm bg-black/20 backdrop-blur-md">
        Prices are estimated based on current market rates. Transactions require $FUNSTR tokens on Solana.
      </div>
    </div>
  );
}
