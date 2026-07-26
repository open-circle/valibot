import { z } from "zod";

const Schema = z.string();

type Input = z.input<typeof Schema>;
type Output1 = z.output<typeof Schema>;
type Output2 = z.infer<typeof Schema>;