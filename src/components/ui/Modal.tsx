"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ModalProps {
    open?: boolean;
    /** Alias for open */
    isOpen?: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl";
    children: React.ReactNode;
    footer?: React.ReactNode;
    closeOnBackdrop?: boolean;
}

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
};

export function Modal({
                          open: openProp,
                          isOpen,
                          onClose,
                          title,
                          description,
                          size = "md",
                          children,
                          footer,
                          closeOnBackdrop = true,
                      }: ModalProps) {
    const open = openProp ?? isOpen ?? false;
    const contentRef = useRef<HTMLDivElement>(null);

    // Trap focus and close on Escape
    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement as HTMLElement | null;
        const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
            prev?.focus();
        };
    }, [open, onClose]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby={description ? "modal-desc" : undefined}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-[var(--text)]/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        onClick={closeOnBackdrop ? onClose : undefined}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        ref={contentRef}
                        className={cn(
                            "relative w-full bg-[var(--surface)] rounded-[var(--radius-xl)]",
                            "shadow-[var(--shadow-xl)]",
                            "flex flex-col max-h-[90vh]",
                            sizeStyles[size]
                        )}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 pb-4">
                            <div className="flex-1 pr-4">
                                <h2
                                    id="modal-title"
                                    className="text-heading-s text-[var(--text)]"
                                >
                                    {title}
                                </h2>
                                {description && (
                                    <p
                                        id="modal-desc"
                                        className="text-body-s text-[var(--muted)] mt-1"
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="shrink-0 w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-4 overflow-y-auto flex-1">{children}</div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

// ─── Confirm Dialog ───────────────────────────────────────
export interface ConfirmDialogProps {
    open?: boolean;
    /** Alias for open */
    isOpen?: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "default";
    loading?: boolean;
}

export function ConfirmDialog({
                                  open: openProp,
                                  isOpen,
                                  onClose,
                                  onConfirm,
                                  title,
                                  description,
                                  confirmLabel = "Confirm",
                                  cancelLabel = "Cancel",
                                  variant = "danger",
                                  loading = false,
                              }: ConfirmDialogProps) {
    const open = openProp ?? isOpen ?? false;
    const [pending, setPending] = React.useState(false);

    const handleConfirm = async () => {
        setPending(true);
        try {
            await onConfirm();
        } finally {
            setPending(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            size="sm"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={pending || loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "danger" : "filled"}
                        onClick={handleConfirm}
                        loading={pending || loading}
                    >
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <></>
        </Modal>
    );
}