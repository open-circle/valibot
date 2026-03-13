import { z } from "zod";

const Schema1 = z.symbol();
const Schema2 = z.symbol({message: "some message"});
const Schema3 = z.symbol({description: "some description"});