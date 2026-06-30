// src/components/TicketDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { Ticket, TicketWithPastCount, Status } from "@/lib/type";
import { PriorityBadge, StatusPill } from "./Badges";
import { X, AlertTriangle, Users, Loader2 } from "lucide-react";

interface Props {
  ticketId: string | null;
  onClose: () => void;
  onStatusUpdate: (updated: Ticket) => void;
}

export function TicketDrawer({ ticketId, onClose, onStatusUpdate }: Props) {
  const [ticket, setTicket] = useState<TicketWithPastCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>("OPEN");
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      return;
    }
    setLoading(true);
    setUpdateError("");
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((data) => {
        setTicket(data);
        setSelectedStatus(data.status as Status);
      })
      .catch(() => setUpdateError("Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [ticketId]);

  async function handleStatusUpdate() {
    if (!ticket || selectedStatus === ticket.status) return;

    setStatusUpdating(true);
    setUpdateError("");

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUpdateError(data.error ?? "Update failed.");
        return;
      }

      setTicket((prev) =>
        prev ? { ...prev, status: data.status, updatedAt: data.updatedAt } : null
      );
      onStatusUpdate(data);
    } catch {
      setUpdateError("Network error.");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (!ticketId) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-black border-l z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Ticket Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors rounded-lg p-1"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-slate-500" />
            </div>
          )}

          {!loading && ticket && (
            <div className="space-y-5">
              {ticket.isUrgent && (
                <div className="flex items-center gap-2 bg-red-950 border border-red-700 rounded-lg px-4 py-3">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span className="text-red-300 text-sm font-semibold">
                    This ticket is marked URGENT
                  </span>
                </div>
              )}
              {ticket.pastTicketsCount > 0 && (
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3">
                  <Users size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-300 text-sm">
                    This customer has{" "}
                    <strong className="text-white">
                      {ticket.pastTicketsCount}
                    </strong>{" "}
                    other ticket{ticket.pastTicketsCount > 1 ? "s" : ""} on file.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Customer
                  </p>
                  <p className="text-white text-sm font-medium">
                    {ticket.customerName}
                  </p>
                  <p className="text-slate-400 text-xs">{ticket.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Ticket ID
                  </p>
                  <p className="text-slate-300 text-xs font-mono break-all">
                    {ticket.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Priority
                  </p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <StatusPill status={ticket.status} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Created
                  </p>
                  <p className="text-slate-300 text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Last Updated
                  </p>
                  <p className="text-slate-300 text-sm">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Subject
                </p>
                <p className="text-white text-sm font-semibold">{ticket.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </p>
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                  Update Status
                </p>
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as Status)
                    }
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      statusUpdating || selectedStatus === ticket.status
                    }
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
                  >
                    {statusUpdating && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Save
                  </button>
                </div>
                {updateError && (
                  <p className="text-red-400 text-xs mt-2">{updateError}</p>
                )}
                {selectedStatus === ticket.status && !updateError && (
                  <p className="text-slate-500 text-xs mt-2">
                    Select a different status to save changes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
