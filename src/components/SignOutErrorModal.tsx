"use client";

import { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface SignOutErrorModalProps {
  error: string | null; // when null, modal is closed
  attempts: number; // signOutAttempts from parent (≥2 reveals Force Sign Out)
  onRetry: () => void; // sign-out retry handler
  onForceSignOut: () => void; // hard-reload destructive path
  onCancel: () => void; // setSignOutError(null)
}

/**
 * Session-safety-critical alertdialog: shown when sign-out fails.
 * - role="alertdialog" auto-couples non-dismissibility from <Modal>
 *   (no backdrop tap, no Escape — matches DESIGN.md L693).
 * - initialFocusRef binds to "Try Again" so the safe recoverable
 *   action receives initial focus; the destructive Force Sign Out
 *   path (which hard-reloads the page) never receives initial focus
 *   even when revealed at attempts ≥ 2.
 */
export const SignOutErrorModal = ({
  error,
  attempts,
  onRetry,
  onForceSignOut,
  onCancel,
}: SignOutErrorModalProps) => {
  const tryAgainRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={!!error}
      onClose={onCancel}
      role="alertdialog"
      initialFocusRef={tryAgainRef}
      header={<h2 className="text-lg font-bold">Couldn&apos;t sign you out</h2>}
      footer={
        <div className="flex flex-col gap-2 w-full">
          <Button ref={tryAgainRef} onClick={onRetry}>
            Try Again
          </Button>
          {attempts >= 2 && (
            <Button variant="destructive" onClick={onForceSignOut}>
              Force Sign Out (reload page)
            </Button>
          )}
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      }
    >
      {error && <p className="text-sm text-text-muted">{error}</p>}
    </Modal>
  );
};
