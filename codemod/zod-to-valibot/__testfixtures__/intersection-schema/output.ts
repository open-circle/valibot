import * as v from "valibot";

const Person = v.object({
  name: v.string(),
});

const Employee = v.object({
  role: v.string(),
});

const Schema1 = v.intersect([Person, Employee]);
const Schema2 = v.intersect([Person, Employee], "some message");