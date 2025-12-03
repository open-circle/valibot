import { z } from "zod";

const Person = z.object({
  name: z.string(),
});

const Employee = z.object({
  role: z.string(),
});

const Schema1 = z.intersection(Person, Employee);
const Schema2 = z.intersection(Person, Employee, {message: "some message"});