import * as v from "valibot";

const Schema1 = v.array(v.string());
const Schema2 = v.pipe(Schema1, v.nonEmpty());
const Schema3 = v.pipe(v.array(v.number()), v.nonEmpty());
const Schema4 = v.pipe(v.array(v.boolean()), v.nonEmpty("cannot be empty"));
const Schema5 = v.pipe(v.array(v.null()), v.nonEmpty());
const Schema6 = v.pipe(v.array(v.unknown()), v.nonEmpty("Cannot be empty."));