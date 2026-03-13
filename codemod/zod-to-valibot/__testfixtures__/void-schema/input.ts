import { z } from "zod";

const Schema1 = z.void();
const Schema2 = z.void({message: "some message"});
const Schema3 = z.void({description: "some description"});