// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardStatsGrid } from "@/components/DashboardStats";
import { CreateTicketForm } from "@/components/CreateTicketForm";
import { TicketGrid } from "@/components/TicketGrid";
import { TicketDrawer } from "@/components/TicketDrawer";
import { DashboardStats, Ticket } from "@/lib/type";


const EMPTY_STATS: DashboardStats = {
  totalTickets: 0,
  openCount: 0,
  inProgressCount: 0,
  resolvedCount: 0,
  urgentCount: 0,
};

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    } catch {
      // Silently fail on initial load — stats are supplementary
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshKey]);

  function handleTicketCreated() {
    setRefreshKey((k) => k + 1);
  }

  function handleStatusUpdate(updated: Ticket) {
    void updated; // ticket grid will refresh on close; drawer handles optimistic UI
    setRefreshKey((k) => k + 1);
  }
  return (
    <div className="min-h-screen  text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-lg tracking-tight text-white">
              SupportDesk
            </span>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-xs text-white-400 hover:text-white transition-colors rounded-lg px-3 py-1.5 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </header>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <DashboardStatsGrid stats={stats} />
        <div className="flex gap-6 flex-col lg:flex-row">
          <aside className="lg:w-80 shrink-0">
            <div className="bg-black border rounded-2xl p-5 sticky top-20">
              <h2 className="text-sm font-bold text-white mb-1">
                New Ticket
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Fill in customer details to create a support request.
              </p>
              <CreateTicketForm onTicketCreated={handleTicketCreated} />
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="bg-black border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">All Tickets</h2>
                <span className="text-xs text-slate-500">
                  Click any row to view details
                </span>
              </div>
              <TicketGrid
                refreshKey={refreshKey}
                onSelectTicket={setSelectedTicketId}
              />
            </div>
          </main>
        </div>
      </div>
      <TicketDrawer
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
