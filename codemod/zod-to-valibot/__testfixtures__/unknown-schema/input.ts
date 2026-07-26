import { z } from "zod";

const Schema1 = z.unknown();
const Schema2 = z.unknown({message: "some message"});
const Schema3 = z.unknown({description: "some description"});