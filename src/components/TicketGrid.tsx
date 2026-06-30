// src/components/TicketGrid.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Priority, Status, PaginatedTickets } from "@/lib/type";
import { PriorityBadge, StatusPill } from "./Badges";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Props {
  refreshKey: number;
  onSelectTicket: (id: string) => void;
}

export function TicketGrid({ refreshKey, onSelectTicket }: Props) {
  const [data, setData] = useState<PaginatedTickets | null>(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (priority) params.set("priority", priority);
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [search, priority, status, page, refreshKey]); // eslint-disable-line

  useEffect(() => {
    const delay = setTimeout(fetchTickets, 300);
    return () => clearTimeout(delay);
  }, [fetchTickets]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, priority, status]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "")}
          className="bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "")}
          className="bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-black">
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                ID
              </th>
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                Subject
              </th>
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                Priority
              </th>
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Loader2
                    size={24}
                    className="animate-spin text-white mx-auto"
                  />
                </td>
              </tr>
            )}

            {!loading && tickets.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-slate-500 text-sm"
                >
                  No tickets found. Adjust your filters or create a new ticket.
                </td>
              </tr>
            )}

            {!loading &&
              tickets.map((ticket: Ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={`border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800 ${
                    ticket.isUrgent ? "bg-red-950" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ticket.isUrgent && (
                      <span title="Urgent">
                        <AlertTriangle
                          size={14}
                          className="text-red-400 shrink-0"
                        />
                      </span>
                      )}
                      <span className="font-mono text-xs text-slate-400">
                        {ticket.id.slice(0, 8)}…
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">
                      {ticket.customerName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {ticket.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="text-slate-200 line-clamp-1">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={ticket.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(ticket.createdAt)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 text-xs">
            Showing{" "}
            {Math.min(
              (pagination.page - 1) * pagination.pageSize + 1,
              pagination.total
            )}
            –
            {Math.min(
              pagination.page * pagination.pageSize,
              pagination.total
            )}{" "}
            of {pagination.total} tickets
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-slate-300 text-xs">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages <= 1 && pagination.total > 0 && (
        <div className="text-xs text-slate-500">
          Showing all {pagination.total} ticket{pagination.total > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
