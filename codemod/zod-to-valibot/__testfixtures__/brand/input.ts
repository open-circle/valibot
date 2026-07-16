import { z } from "zod";

// Basic brand on string schema
export const StationNumberSchema = z.string().brand("StationNumber");

// Brand after a validator chain
const UserId = z.string().uuid().brand("UserId");

// Brand on number schema
const Price = z.number().min(0).brand("Price");

// Brand on linked schema
const BaseSchema = z.string();
const BrandedSchema = BaseSchema.brand("Branded");
