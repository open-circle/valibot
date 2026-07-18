import { z } from "zod";

// enum creation
// way #1
const FruitEnum = z.enum(["Apple", "Orange", "Banana"]);
// way #2
const VALUES = ["Valibot", "ModularForms"] as const;
const LibraryEnum = z.enum(VALUES);

// the enum property, not supported by Valibot
const AnswerEnum = z.enum(["Yes", "No"]);
const AnswerObj = AnswerEnum.enum; 

// retrieve the list of options
const BoolEnum = z.enum(["true", "false"]);
const boolOptions = BoolEnum.options;

// extract or exclude values 
const FishEnum = z.enum(["Salmon", "Tuna", "Trout"]);
const SalmonAndTrout = FishEnum.extract(["Salmon", "Trout"]);
// `exclude` is not supported by Valibot
const SalmonOnly = FishEnum.exclude(["Tuna", "Trout"]);