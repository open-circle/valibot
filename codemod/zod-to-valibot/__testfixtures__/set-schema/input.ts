import { z } from "zod";

const Schema1 = z.set(z.number());
const Schema2 = z.set(z.number(), {message: "some message"});