import { z } from "zod";

// Basic refine
const Schema1 = z.number().refine((val) => val < 100, "Must be less then 100");

// Refine with string schema
const Schema2 = z.string().refine((val) => val.length > 0, "Required");

// Refine after validator
const Schema3 = z.number().min(0).refine((val) => val % 2 === 0, "Must be even");

// Multiple refines
const Schema4 = z.string().refine((val) => val.length > 3).refine((val) => val.includes("@"));

// Refine with complex condition
const Schema5 = z.object({ name: z.string() }).refine((data) => data.name !== "admin", {
  message: "Cannot use admin"
});

// Refine on linked schema
const BaseSchema = z.string();
const RefinedSchema = BaseSchema.refine((val) => val.trim().length > 0);