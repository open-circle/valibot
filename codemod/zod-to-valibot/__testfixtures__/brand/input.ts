import { z } from "zod";

const Schema1 = z.string().brand("StationNumber");
const Schema2 = z.object({key: z.string()}).brand("Config");
const Schema3 = z.string().brand<"Cat">();
const Schema4 = z.string().min(1).brand<"NonEmpty">();
const Schema5 = z.number().brand<1>();
const Schema6 = Schema1.brand<"Linked">();