import { z } from "zod";

const ObjectSchema = z.object({key: z.string()});

const StringSchema = ObjectSchema.shape.key;
