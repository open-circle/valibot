import { z } from "zod";

const ObjectSchema = z.object({apple: z.string(), banana: z.number(), orange: z.boolean()});
const FruitEnum1 = ObjectSchema.keyof();
const FruitEnum2 = z.object({apple: z.string(), banana: z.number(), orange: z.boolean()}).keyof();
