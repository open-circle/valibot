import * as v from "valibot";

// enum creation
// way #1
const FruitEnum = v.picklist(["Apple", "Orange", "Banana"]);
// way #2
const VALUES = ["Valibot", "ModularForms"] as const;
const LibraryEnum = v.picklist(VALUES);

// the enum property, not supported by Valibot
const AnswerEnum = v.picklist(["Yes", "No"]);
const AnswerObj = AnswerEnum.enum; 

// retrieve the list of options
const BoolEnum = v.picklist(["true", "false"]);
const boolOptions = BoolEnum.options;

// extract or exclude values 
const FishEnum = v.picklist(["Salmon", "Tuna", "Trout"]);
const SalmonAndTrout = v.picklist(["Salmon", "Trout"]);
// `exclude` is not supported by Valibot
const SalmonOnly = v.exclude(FishEnum, ["Tuna", "Trout"]);