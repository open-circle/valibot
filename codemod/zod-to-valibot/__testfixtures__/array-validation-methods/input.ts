import { z } from "zod";

const Schema1 = z.array(z.string()).min(2);
const Schema2 = z.array(z.string()).max(3);
const Schema3 = z.array(z.string()).length(4);