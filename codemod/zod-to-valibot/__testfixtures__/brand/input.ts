import { z } from "zod";

const StationNumberSchema = z.string().brand("StationNumber");
const IdSchema = z.number().brand("Id");
const NonEmptyBrandSchema = z.string().min(1).brand("NonEmpty");
