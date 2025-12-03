import { z } from "zod";

const Schema1 = z.null();
const Schema2 = z.null({message: "some message"});
const Schema3 = z.null({description: "some description"});