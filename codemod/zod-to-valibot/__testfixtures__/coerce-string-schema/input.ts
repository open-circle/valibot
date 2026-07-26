import { z } from "zod";

const Schema1 = z.coerce.string();
const Schema2 = z.string({ coerce: true });
const Schema3 = z.coerce.string().email();
const Schema4 = z.string({ coerce: true }).url();