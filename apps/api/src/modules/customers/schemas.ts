import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().max(40).optional(),
  companyName: z.string().trim().max(160).optional(),
  country: z.string().trim().max(80).optional(),
});

export const customerParamsSchema = z.object({ customerId: z.string().uuid() });
