import { z } from "zod";

const Schema1 = z.string().or(z.number());
const Schema2 = z.string().or(z.number()).or(z.boolean());