import { z } from "zod";

// Basic brand
const Schema1 = z.string().brand("StationNumber");

// Brand after validator chain
const Schema2 = z.string().min(1).brand("NonEmptyId");

// Brand on object schema
const Schema3 = z.object({ id: z.string() }).brand("Entity");

// Brand on linked schema
const BaseSchema = z.number();
const BrandedSchema = BaseSchema.brand("Count");
