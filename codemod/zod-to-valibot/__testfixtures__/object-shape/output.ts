import * as v from "valibot";

const ObjectSchema = v.object({key: v.string()});

const StringSchema = ObjectSchema.entries.key;
