import React, { useState } from "react";
import { Lock, ShieldAlert, Key, X, CheckCircle2 } from "lucide-react";
import { Language } from "../types";

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const isAr = lang === "ar";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "jana") {
      setError(false);
      setPassword("");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 ${
          shake ? "animate-bounce" : ""
        }`}
      >
        <button
          onClick={() => {
            setPassword("");
            setError(false);
            onClose();
          }}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isAr ? "نظام الإدارة والتحكم السري" : "Restricted Master Console"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {isAr
                ? "يرجى إدخال كلمة مرور المشرف العام لفتح لوحة التحكم"
                : "Enter master supervisor passkey to unlock administrative suite"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isAr ? "كلمة المرور المشفرة:" : "Master Admin Passkey:"}
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-hidden transition-colors ${
                  error
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                }`}
              />
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
            {error && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{isAr ? "كلمة المرور غير صحيحة! تم رفض الوصول." : "Invalid Master Passkey. Access Denied."}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPassword("");
                setError(false);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              {isAr ? "تحقق ودخول" : "Authenticate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
