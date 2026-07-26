import * as v from "valibot";

const Schema1 = v.literal("valibot");
const Schema2 = v.literal("valibot", 'should be "valibot"');
const Schema3 = v.literal(123);
const Schema4 = v.literal(Symbol("someSymbol"));
const Schema5 = v.literal(321n);
const Schema6 = v.literal(true);
const Schema7 = v.null();
const Schema8 = v.null("should be null");
const Schema9 = v.undefined();
const Schema10 = v.undefined("should be undefined");