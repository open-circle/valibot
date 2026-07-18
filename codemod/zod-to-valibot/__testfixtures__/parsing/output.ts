import * as v from "valibot";

const Schema = v.string();

const output1 = v.parse(Schema, "to parse");

const output2 = v.parseAsync(Schema, "to parseAsync");

const result1 = v.safeParse(Schema, "to safeParse");
if (result1.success) {
	const output = result1.output;
} else {
	const errors = result1.issues;
}

const result2 = await v.safeParseAsync(Schema, "to safeParseAsync");
if (result2.success) {
	const output = result2.output;
} else {
	const errors = result2.issues;
}

const result3 = await v.safeParseAsync(Schema, "to spa");
if (result3.success) {
	const output = result3.output;
} else {
	const errors = result3.issues;
}