import { z } from "zod";

const MinSchema = z.date().min(new Date("2025-04-04"));
const MaxSchema = z.date().max(new Date("1999-02-03"));