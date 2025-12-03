import * as v from "valibot";

const Schema = v.string();

type Input = v.InferInput<typeof Schema>;
type Output1 = v.InferOutput<typeof Schema>;
type Output2 = v.InferOutput<typeof Schema>;