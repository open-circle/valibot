import { z } from "zod";

const Schema1 = z.never();
const Schema2 = z.never({message: "some message"});
const Schema3 = z.never({description: "some description"});