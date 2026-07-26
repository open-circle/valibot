import { z } from "zod";

const Schema1 = z.union([z.string(), z.number(), z.boolean()]);
const Schema2 = z.union([z.string(), z.number(), z.boolean()], {message: "some message"});