import { z } from "zod";

const Schema = z.string();

const output1 = Schema.parse("to parse");

const output2 = Schema.parseAsync("to parseAsync");

const result1 = Schema.safeParse("to safeParse");
if (result1.success) {
	const output = result1.data;
} else {
	const errors = result1.error;
}

const result2 = await Schema.safeParseAsync("to safeParseAsync");
if (result2.success) {
	const output = result2.data;
} else {
	const errors = result2.error;
}

const result3 = await Schema.spa("to spa");
if (result3.success) {
	const output = result3.data;
} else {
	const errors = result3.error;
}