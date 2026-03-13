import * as v from "valibot";

const Schema1 = v.union([v.string(), v.number(), v.boolean()]);
const Schema2 = v.union([v.string(), v.number(), v.boolean()], "some message");