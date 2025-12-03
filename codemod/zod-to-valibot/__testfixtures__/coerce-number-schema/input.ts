import { z } from "zod";

const Schema1 = z.coerce.number();
const Schema2 = z.number({ coerce: true });
const Schema3 = z.coerce.number().finite();
const Schema4 = z.number({ coerce: true }).multipleOf(12);