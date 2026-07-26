import { z } from "zod";

// Basic transform
const Schema1 = z.number().transform((val) => val * 2);

// Transform with string schema
const Schema2 = z.string().transform((val) => val.toUpperCase());

// Chained transform with validator
const Schema3 = z.number().min(0).transform((val) => val + 1);

// Transform after validator chain
const Schema4 = z.string().email().transform((val) => `Email: ${val}`);

// Multiple transforms
const Schema5 = z.number().transform((val) => val * 2).transform((val) => val + 10);

// Transform with complex function
const Schema6 = z.object({ name: z.string() }).transform((data) => ({
  ...data,
  displayName: data.name.toUpperCase()
}));

// Transform on linked schema
const BaseSchema = z.string();
const TransformedSchema = BaseSchema.transform((val) => val.trim());