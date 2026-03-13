import * as v from "valibot";

const ObjectSchema = v.object({apple: v.string(), banana: v.number(), orange: v.boolean()});
const FruitEnum1 = v.keyof(ObjectSchema);
const FruitEnum2 = v.keyof(v.object({apple: v.string(), banana: v.number(), orange: v.boolean()}));
