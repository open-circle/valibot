import { z } from "zod";

export const StationNumberSchema = z.string().brand("StationNumber");
export const NumericId = z.number().int().brand("NumericId");
