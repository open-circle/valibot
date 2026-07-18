import * as v from "valibot";

const Schema1 = v.union([v.string(), v.number()]);
const Schema2 = v.union([v.union([v.string(), v.number()]), v.boolean()]);