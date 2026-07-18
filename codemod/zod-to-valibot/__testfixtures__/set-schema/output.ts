import * as v from "valibot";

const Schema1 = v.set(v.number());
const Schema2 = v.set(v.number(), "some message");