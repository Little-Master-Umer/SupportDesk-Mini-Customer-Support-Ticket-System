export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  priority: Priority;
  status: Status;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketWithPastCount extends Ticket {
  pastTicketsCount: number;
}

export interface DashboardStats {
  totalTickets: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  urgentCount: number;
}

export interface PaginatedTickets {
  tickets: Ticket[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTicketPayload {
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  priority: Priority;
}
