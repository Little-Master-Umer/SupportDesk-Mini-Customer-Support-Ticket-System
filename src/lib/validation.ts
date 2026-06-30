
import { z } from "zod";

export const createTicketSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer_name is required")
    .max(20, "Name must be less than 20 chars"),
  customerEmail: z
    .string()
    .email("A valid_email is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be under 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
     message: "Priority must be LOW, MEDIUM, or HIGH",
  }),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"], {
      message: "Status must be OPEN, IN_PROGRESS, or RESOLVED",  
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

//check weather ticket should be marked urgent or not on the basis of the description word "urgent" or priority

export function computeIsUrgent(
  priority: string,
  description: string
): boolean {
  if (priority === "HIGH") return true;
  if (description.toLowerCase().includes("urgent")) return true;
  return false;
}
