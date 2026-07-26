import { z } from "zod";

const Schema1 = z.map(z.number(), z.boolean());
const Schema2 = z.map(z.number(), z.boolean(), {message: "some message"});