import * as v from "valibot";

const GteSchema = v.pipe(v.number(), v.minValue(1));
const MinSchema = v.pipe(v.number(), v.minValue(2));
const GtSchema = v.pipe(v.number(), v.gtValue(3));
const LteSchema = v.pipe(v.number(), v.maxValue(4));
const MaxSchema = v.pipe(v.number(), v.maxValue(5));
const LtSchema = v.pipe(v.number(), v.ltValue(6));
const IntSchema = v.pipe(v.number(), v.integer());
const PositiveSchema = v.pipe(v.number(), v.gtValue(0));
const NegativeSchema = v.pipe(v.number(), v.ltValue(0));
const NonPositiveSchema = v.pipe(v.number(), v.maxValue(0));
const NonNegativeSchema = v.pipe(v.number(), v.minValue(0));
const MultipleOfSchema = v.pipe(v.number(), v.multipleOf(3));
const StepSchema = v.pipe(v.number(), v.multipleOf(3));
const FiniteSchema = v.pipe(v.number(), v.finite());
const SafeSchema = v.pipe(v.number(), v.safeInteger());