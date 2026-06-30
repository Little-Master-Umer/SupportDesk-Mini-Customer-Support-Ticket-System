"use client";

import { DashboardStats } from "@/lib/type";
import { Ticket, Clock, CheckCircle, AlertTriangle, LayoutGrid } from "lucide-react";

interface Props {
  stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: Props) {
  const cards = [
    {
      label: "Total Tickets",
      value: stats.totalTickets,
      icon: LayoutGrid,
      className: "bg-black border border-slate-700",
      iconClass: "text-white-400",
      valueClass: "text-white-400",
    },
    {
      label: "Open",
      value: stats.openCount,
      icon: Ticket,
      className: "bg-black border",
      iconClass: "text-white-400",
      valueClass: "text-white-400",
    },
    {
      label: "In Progress",
      value: stats.inProgressCount,
      icon: Clock,
      className: "bg-black border",
      iconClass: "text-white-400",
      valueClass: "text-white-400",
    },
    {
      label: "Resolved",
      value: stats.resolvedCount,
      icon: CheckCircle,
      className: "bg-black border",
      iconClass: "text-white-400",
      valueClass: "text-white-400",
    },
    {
      label: "Urgent",
      value: stats.urgentCount,
      icon: AlertTriangle,
      className: "bg-red-200 border-2 border-red-500",
      iconClass: "text-red-600",
      valueClass: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`rounded-xl p-4 ${card.className}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <Icon size={16} className={card.iconClass} />
            </div>
            <div className={`text-3xl font-bold tabular-nums ${card.valueClass}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
