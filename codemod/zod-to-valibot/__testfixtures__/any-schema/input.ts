import { z } from "zod";

const Schema1 = z.any();
const Schema2 = z.any({message: "some message"});
const Schema3 = z.any({description: "some description"});