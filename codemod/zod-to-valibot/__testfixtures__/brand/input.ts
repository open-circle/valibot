import { z } from "zod";

const Schema1 = z.string().brand("StationNumber");
const Schema2 = z.object({key: z.string()}).brand("Config");