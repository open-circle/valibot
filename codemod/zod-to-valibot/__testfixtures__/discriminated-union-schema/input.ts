import { z } from "zod";

const ResultSchema1 = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.number() }),
  z.object({ status: z.literal("failed"), error: z.string() }),
]);

const ResultSchema2 = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.number() }),
  z.object({ status: z.literal("failed"), error: z.string() }),
], {message: "some message"});

const StateSchema = z.discriminatedUnion("status", [...ResultSchema1.options, z.object({status: z.literal("loading")})]);