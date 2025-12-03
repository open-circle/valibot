import { z } from "zod";

const Schema1 = z.string().email("invalid email address");
const Schema2 = z.string().url({message: "invalid url"});
const Schema3 = z.string().length(5, "must be exactly 5 characters long");
const Schema4 = z.string().startsWith("https://", {message: "must provide secure url"});