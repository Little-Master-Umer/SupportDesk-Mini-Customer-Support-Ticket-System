// src/components/CreateTicketForm.tsx
"use client";

import { useState } from "react";
import { CreateTicketPayload, Priority } from "@/lib/type";
import { Send, Loader2 } from "lucide-react";

interface Props {
  onTicketCreated: () => void;
}

const INITIAL_FORM: CreateTicketPayload = {
  customerName: "",
  customerEmail: "",
  subject: "",
  description: "",
  priority: "MEDIUM",
};

interface FieldErrors {
  customerName?: string[];
  customerEmail?: string[];
  subject?: string[];
  description?: string[];
  priority?: string[];
}

export function CreateTicketForm({ onTicketCreated }: Props) {
  const [form, setForm] = useState<CreateTicketPayload>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setGlobalError("");
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setGlobalError(data.error ?? "Something went wrong.");
        }
        return;
      }

      setForm(INITIAL_FORM);
      setSuccess(true);
      onTicketCreated();
    } catch {
      setGlobalError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Customer Name
        </label>
        <input
          type="text"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          placeholder="Umer Afaq"
          className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.customerName && (
          <p className="text-red-400 text-xs mt-1">{errors.customerName[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Email
        </label>
        <input
          type="email"
          name="customerEmail"
          value={form.customerEmail}
          onChange={handleChange}
          placeholder="omer@example.com"
          className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.customerEmail && (
          <p className="text-red-400 text-xs mt-1">{errors.customerEmail[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Cannot log into account"
          className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.subject && (
          <p className="text-red-400 text-xs mt-1">{errors.subject[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Priority
        </label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        {errors.priority && (
          <p className="text-red-200 text-xs mt-1">{errors.priority[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Description
          <span className="ml-1 normal-case font-normal">
            (min 10 chars)
          </span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the issue in detail..."
          className="w-full  border border-slate-600 rounded-lg px-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.description && (
          <p className="text-red-200 text-xs mt-1">{errors.description[0]}</p>
        )}
      </div>

      {globalError && (
        <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2">
          {globalError}
        </p>
      )}

      {success && (
        <p className="text-emerald-400 text-sm bg-emerald-950 border border-emerald-800 rounded-lg px-3 py-2">
          Ticket created successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        {loading ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  );
}
