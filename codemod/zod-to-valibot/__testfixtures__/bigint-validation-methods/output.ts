import * as v from "valibot";

const GteSchema = v.pipe(v.bigint(), v.minValue(1n));
const MinSchema = v.pipe(v.bigint(), v.minValue(2n));
const GtSchema = v.pipe(v.bigint(), v.gtValue(3n));
const LteSchema = v.pipe(v.bigint(), v.maxValue(4n));
const MaxSchema = v.pipe(v.bigint(), v.maxValue(5n));
const LtSchema = v.pipe(v.bigint(), v.ltValue(6n));
const MultipleOfSchema = v.pipe(v.bigint(), v.multipleOf(7n));
const PositiveSchema = v.pipe(v.bigint(), v.gtValue(0n));
const NegativeSchema = v.pipe(v.bigint(), v.ltValue(0n));
const NonPositiveSchema = v.pipe(v.bigint(), v.maxValue(0n));
const NonNegativeSchema = v.pipe(v.bigint(), v.minValue(0n));