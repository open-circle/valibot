import { z } from "zod";

const Schema = z.string().describe("some description");
const description = Schema.description;