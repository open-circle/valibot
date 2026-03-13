import { z } from "zod";

const Schema1 = z.coerce.date();
const Schema2 = z.date({ coerce: true });
const Schema3 = z.coerce.date().min(new Date("1/10/23"));
const Schema4 = z.date({ coerce: true }).max(new Date("2023-01-10"));