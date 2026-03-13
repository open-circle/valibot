import { z } from "zod";

const GteSchema = z.bigint().gte(1n);
const MinSchema = z.bigint().min(2n);
const GtSchema = z.bigint().gt(3n);
const LteSchema = z.bigint().lte(4n);
const MaxSchema = z.bigint().max(5n);
const LtSchema = z.bigint().lt(6n);
const MultipleOfSchema = z.bigint().multipleOf(7n);
const PositiveSchema = z.bigint().positive();
const NegativeSchema = z.bigint().negative();
const NonPositiveSchema = z.bigint().nonpositive();
const NonNegativeSchema = z.bigint().nonnegative();