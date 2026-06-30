import { Priority, Status } from "@/lib/type";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    LOW: "bg-white-100 text-gray-700 border border-gray-300",
    MEDIUM: "bg-white-100 text-yellow-800 border border-yellow-300",
    HIGH: "bg-white-100 text-red-700 border border-rose-300",
  }; 
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
export function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    OPEN: "bg-white-100 text-sky-700 border border-sky-300",
    IN_PROGRESS: "bg-white-100 text-blue-700 border border-orange-300",
    RESOLVED: "bg-white-100 text-green-700 border border-green-300",
  };
  const labels: Record<Status, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
