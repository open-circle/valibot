import * as v from "valibot";

const ResultSchema1 = v.variant("status", [
  v.object({ status: v.literal("success"), data: v.number() }),
  v.object({ status: v.literal("failed"), error: v.string() }),
]);

const ResultSchema2 = v.variant("status", [
  v.object({ status: v.literal("success"), data: v.number() }),
  v.object({ status: v.literal("failed"), error: v.string() }),
], "some message");

const StateSchema = v.variant(
  "status",
  [...ResultSchema1.options, v.object({status: v.literal("loading")})]
);