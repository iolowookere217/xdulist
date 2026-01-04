"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { expensesApi } from "@/lib/api/expenses";
import {
  CreateExpenseData,
  ExpenseCategory,
  Currency,
  UserSubscription,
} from "@/types";
import VoiceInputButton from "./VoiceInputButton";

const categories: ExpenseCategory[] = [
  "groceries",
  "transport",
  "dining",
  "entertainment",
  "utilities",
  "healthcare",
  "shopping",
  "travel",
  "education",
  "subscriptions",
  "other",
];

const currencies: { code: Currency; symbol: string }[] = [
  { code: "NGN", symbol: "₦" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: UserSubscription;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState<Partial<CreateExpenseData>>({
    description: "",
    amount: 0,
    category: undefined,
    currency: "USD",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canScanReceipt =
    subscription?.tier === "premium" ||
    (subscription?.receiptsScannedThisMonth || 0) < 5;

  const handleVoiceTranscript = async (
    transcript: string,
    field: "description" | "full" | "amount"
  ) => {
    try {
      if (field === "full") {
        // Parse full expense from voice
        const result = await expensesApi.parseVoice(transcript);
        if (result.success && result.data) {
          setFormData((prev) => ({
            ...prev,
            description: result.data?.description || prev.description,
            amount: result.data?.amount || prev.amount,
            category: result.data?.category || prev.category,
          }));
          toast.success("Voice input processed!");
        }
      } else if (field === "amount") {
        // Parse amount from voice
        const result = await expensesApi.parseVoice(transcript);
        if (result.success && result.data?.amount) {
          setFormData((prev) => ({ ...prev, amount: result.data!.amount }));
          toast.success("Amount captured!");
        } else {
          toast.info(
            "Could not extract amount. Please try again or enter manually."
          );
        }
      } else {
        setFormData((prev) => ({ ...prev, description: transcript }));
      }
    } catch (error) {
      toast.error("Failed to process voice input");
      if (field !== "amount") {
        setFormData((prev) => ({ ...prev, description: transcript }));
      }
    }
  };

  const handleReceiptUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canScanReceipt) {
      toast.error(
        "Monthly receipt scan limit reached. Upgrade to Premium for unlimited scans!"
      );
      return;
    }

    setReceiptFile(file);
    setIsProcessingReceipt(true);

    try {
      const result = await expensesApi.uploadReceipt(file);
      if (result.success && result.data) {
        const { extracted, receiptUrl } = result.data;

        setFormData((prev) => ({
          ...prev,
          description:
            extracted.vendorName ||
            extracted.items?.[0]?.name ||
            prev.description,
          amount: extracted.totalAmount || prev.amount,
          category: (extracted.category as ExpenseCategory) || prev.category,
          currency: (extracted.currency as Currency) || prev.currency,
          receiptUrl,
        }));

        toast.success("Receipt scanned successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process receipt");
    } finally {
      setIsProcessingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await expensesApi.createExpense({
        ...formData,
        amount: Number(formData.amount),
      } as CreateExpenseData);

      if (result.success) {
        toast.success("Expense added successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          description: "",
          amount: 0,
          category: undefined,
          currency: "USD",
        });
        setReceiptFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Receipt Upload */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleReceiptUpload}
              accept="image/*,.pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingReceipt || !canScanReceipt}
              className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${
                isProcessingReceipt
                  ? "border-emerald-400 bg-emerald-50"
                  : canScanReceipt
                  ? "border-slate-200 hover:border-emerald-400 hover:bg-slate-50"
                  : "border-red-200 bg-red-50"
              }`}>
              {isProcessingReceipt ? (
                <>
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  <span className="text-sm font-medium text-emerald-700">
                    Processing Receipt...
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-700">
                      Upload Receipt
                    </p>
                    <p className="text-xs text-slate-500">
                      {canScanReceipt
                        ? "Image or PDF - AI will extract details"
                        : "Limit reached - Upgrade for unlimited"}
                    </p>
                  </div>
                </>
              )}
            </button>
          </div>

          {receiptFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 truncate">
                {receiptFile.name}
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Description *
            </label>
            <div className="relative">
              <input
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What did you spend on?"
                className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-600"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  onTranscript={(text) => handleVoiceTranscript(text, "full")}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  placeholder="0.00"
                  className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-12 text-lg font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-600"
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputButton
                    onTranscript={(text) =>
                      handleVoiceTranscript(text, "amount")
                    }
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value as Currency,
                  }))
                }
                className="w-full h-12 rounded-xl border border-slate-200 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Category (optional)
            </label>
            <select
              value={formData.category || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as ExpenseCategory,
                }))
              }
              className="w-full h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none capitalize">
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.description || !formData.amount}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-base shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Expense"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
