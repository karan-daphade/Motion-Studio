"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X, QrCode, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { appName } from "@/config/branding";

interface ShareSessionQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  tableLabel: string;
  branchName?: string;
}

export default function ShareSessionQRModal({
  isOpen,
  onClose,
  sessionId,
  tableLabel,
  branchName,
}: ShareSessionQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [joinUrl, setJoinUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/session/join?session_id=${encodeURIComponent(sessionId)}&table=${encodeURIComponent(tableLabel)}`;
    setJoinUrl(url);

    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: "#1e1b4b", // Brand secondary
        light: "#ffffff",
      },
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error("Failed to generate QR:", err));
  }, [isOpen, sessionId, tableLabel]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-brand-border p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-brand-secondary">
                Customer QR Dining Session
              </h3>
              <p className="text-[10px] text-brand-text-muted">
                {branchName ? `${branchName} • ` : ""}Table {tableLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-secondary hover:bg-brand-surface-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Narrative & Scope Notice */}
        <div className="rounded-2xl bg-purple-50/80 border border-purple-200/80 p-3 text-left">
          <p className="text-[11px] text-purple-900 leading-relaxed">
            Accessible via QR code scan without mandatory app installation. Automatically establishes or joins a shared{" "}
            <code className="font-mono font-bold text-purple-950 bg-purple-100 px-1 py-0.5 rounded text-[10px]">
              table_session
            </code>
            .
          </p>
        </div>

        {/* QR Display */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Dining Session QR for Table ${tableLabel}`}
              className="w-56 h-56 rounded-xl border border-brand-border/40 shadow-2xs"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-brand-surface-muted rounded-xl">
              <Sparkles className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
          )}
          <span className="text-[10px] font-bold text-brand-text-muted mt-2">
            Scan to view menu & join table orders
          </span>
        </div>

        {/* Copy Link Action */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-brand-surface-muted border border-brand-border text-left">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="flex-1 bg-transparent text-[11px] font-mono text-brand-text-secondary outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                isCopied
                  ? "bg-emerald-600 text-white"
                  : "bg-brand-primary text-white hover:bg-brand-primary-hover"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <a
            href={joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-brand-secondary hover:text-brand-primary transition-colors"
          >
            <span>Open in Customer View (`/customer`)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-brand-border/60 text-[10px] text-brand-text-muted">
          Powered by {appName} • Dynamic Table Session Handshake
        </div>
      </div>
    </div>
  );
}
