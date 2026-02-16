"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ParentConsentFormProps {
  onConsent: (parentEmail: string) => void;
  onCancel: () => void;
}

const ParentConsentForm = ({ onConsent, onCancel }: ParentConsentFormProps) => {
  const [parentEmail, setParentEmail] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(parentEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    onConsent(parentEmail);
  };

  const canSubmit = parentEmail.trim() !== "" && consentChecked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">&#11088;</div>
        <h2 className="text-2xl font-bold mb-2">Junior Otaku Mode!</h2>
        <p className="text-white/60 text-sm">
          Since you&apos;re under 13, we need a parent or guardian&apos;s
          permission before you can create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="parent-email"
            className="block text-sm font-medium text-white/70 mb-1"
          >
            Parent or Guardian&apos;s Email
          </label>
          <input
            id="parent-email"
            type="email"
            required
            value={parentEmail}
            onChange={(e) => {
              setParentEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="parent@example.com"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {emailError && (
            <p className="text-accent text-xs mt-1">{emailError}</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-primary"
          />
          <span className="text-sm text-white/70">
            I am the parent or legal guardian and I give permission for my child
            to create an OtakuQuiz account. I understand that only age-appropriate
            content will be shown.
          </span>
        </label>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/50">
            <strong className="text-white/70">Privacy notice:</strong> We only
            collect a username and quiz scores. We do not collect personal
            information from children under 13 beyond what is needed for the
            account. No social features, chat, or location data is collected.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ParentConsentForm;
