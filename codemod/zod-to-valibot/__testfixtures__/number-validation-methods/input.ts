import { z } from "zod";

const GteSchema = z.number().gte(1);
const MinSchema = z.number().min(2);
const GtSchema = z.number().gt(3);
const LteSchema = z.number().lte(4);
const MaxSchema = z.number().max(5);
const LtSchema = z.number().lt(6);
const IntSchema = z.number().int();
const PositiveSchema = z.number().positive();
const NegativeSchema = z.number().negative();
const NonPositiveSchema = z.number().nonpositive();
const NonNegativeSchema = z.number().nonnegative();
const MultipleOfSchema = z.number().multipleOf(3);
const StepSchema = z.number().step(3);
const FiniteSchema = z.number().finite();
const SafeSchema = z.number().safe();
