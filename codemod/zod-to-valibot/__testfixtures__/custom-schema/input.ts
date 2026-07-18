import { z } from "zod";

const Schema1 = z.custom<{value: string}>();
const Schema2 = z.custom<{value: string}>(input => input);
const Schema3 = z.custom<{value: string}>(input => input, "some message");
const Schema4 = z.custom<{value: string}>(input => input, {message: "some message"});
const Schema5 = z.custom<{value: string}>(input => input, {fatal: true});
const Schema6 = z.custom<{value: string}>(input => input, {fatal: true, message: "some message"});
const Schema7 = z.custom<{value: string}>(input => input, {params: {key: "value"}});
const Schema8 = z.custom<{value: string}>(input => input, {path: ["key"]});
const Schema9 = z.custom<{value: string}>(input => input, input => ({fatal: Boolean(input)}));