import { z } from "zod";

const Schema1 = z.string().brand("StationNumber");
const Schema2 = z.number().brand("UserId");
const Schema3 = z.string().min(1).brand("NonEmptyString");
