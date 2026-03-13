import { z } from "zod";

const Schema1 = z.coerce.bigint();
const Schema2 = z.bigint({ coerce: true });
const Schema3 = z.coerce.bigint().gt(1n);
const Schema4 = z.bigint({ coerce: true }).lt(2n);