import * as v from "valibot";

const Schema1 = v.map(v.number(), v.boolean());
const Schema2 = v.map(v.number(), v.boolean(), "some message");