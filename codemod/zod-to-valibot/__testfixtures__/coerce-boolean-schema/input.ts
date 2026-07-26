import { z } from "zod";

const Schema1 = z.coerce.boolean();
const Schema2 = z.boolean({ coerce: true });