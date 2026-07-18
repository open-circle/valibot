import { z } from "zod";

const Schema1 = z.array(z.string());
const Schema2 = Schema1.nonempty();
const Schema3 = z.array(z.number()).nonempty();
const Schema4 = z.array(z.boolean()).nonempty("cannot be empty");
const Schema5 = z.array(z.null()).nonempty({});
const Schema6 = z.array(z.unknown()).nonempty({message: "Cannot be empty."});