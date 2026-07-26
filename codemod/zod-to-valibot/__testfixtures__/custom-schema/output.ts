import * as v from "valibot";

const Schema1 = v.custom<{value: string}>(() => true);
const Schema2 = v.custom<{value: string}>(input => input);
const Schema3 = v.custom<{value: string}>(input => input, "some message");
const Schema4 = v.custom<{value: string}>(input => input, "some message");
const Schema5 = v.custom<{value: string}>(input => input, {fatal: true});
const Schema6 = v.custom<{value: string}>(input => input, {fatal: true, message: "some message"});
const Schema7 = v.custom<{value: string}>(input => input, {params: {key: "value"}});
const Schema8 = v.custom<{value: string}>(input => input, {path: ["key"]});
const Schema9 = v.custom<{value: string}>(input => input, input => ({fatal: Boolean(input)}));