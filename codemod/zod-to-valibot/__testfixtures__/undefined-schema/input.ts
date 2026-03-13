import { z } from "zod";

const Schema1 = z.undefined();
const Schema2 = z.undefined({message: "some message"});
const Schema3 = z.undefined({description: "some description"});