import { type RenderContext } from "../../Renderer";
import { BooleanOption, EnumOption, StringOption, getOptionValues } from "../../RendererOptions";
import { TargetLanguage } from "../../TargetLanguage";
import { type FixMeOptionsType } from "../../types";

import { ObjectiveCRenderer } from "./ObjectiveCRenderer";
import { DEFAULT_CLASS_PREFIX } from "./utils";

export const objectiveCOptions = {
    features: new EnumOption(
        "features",
        "Interface and implementation",
        {
            all: { interface: true, implementation: true },
            interface: { interface: true, implementation: false },
            implementation: { interface: false, implementation: true }
        } as const,
        "all"
    ),
    justTypes: new BooleanOption("just-types", "Plain types only", false),
    marshallingFunctions: new BooleanOption("functions", "C-style functions", false),
    classPrefix: new StringOption("class-prefix", "Class prefix", "PREFIX", DEFAULT_CLASS_PREFIX),
    extraComments: new BooleanOption("extra-comments", "Extra comments", false)
};

export const objectiveCLanguageConfig = {
    displayName: "Objective-C",
    names: ["objc", "objective-c", "objectivec"],
    extension: "m"
} as const;

export class ObjectiveCTargetLanguage extends TargetLanguage<typeof objectiveCLanguageConfig> {
    public constructor() {
        super(objectiveCLanguageConfig);
    }

    public getOptions(): typeof objectiveCOptions {
        return objectiveCOptions;
    }

    protected makeRenderer(renderContext: RenderContext, untypedOptionValues: FixMeOptionsType): ObjectiveCRenderer {
        return new ObjectiveCRenderer(this, renderContext, getOptionValues(objectiveCOptions, untypedOptionValues));
    }
}
