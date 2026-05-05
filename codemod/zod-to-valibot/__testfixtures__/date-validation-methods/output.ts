import * as v from "valibot";

const MinSchema = v.pipe(v.date(), v.minValue(new Date("2025-04-04")));
const MaxSchema = v.pipe(v.date(), v.maxValue(new Date("1999-02-03")));