import { type ConvenienceRenderer } from "../../ConvenienceRenderer";
import { type RenderContext } from "../../Renderer";
import { BooleanOption, EnumOption, StringOption, getOptionValues } from "../../RendererOptions";
import { assertNever } from "../../support/Support";
import { TargetLanguage } from "../../TargetLanguage";
import { type PrimitiveStringTypeKind, type TransformedStringTypeKind, type Type } from "../../Type";
import { type StringTypeMapping } from "../../TypeBuilder";
import { type FixMeOptionsType } from "../../types";

import { NewtonsoftCSharpRenderer } from "./NewtonSoftCSharpRenderer";
import { SystemTextJsonCSharpRenderer } from "./SystemTextJsonCSharpRenderer";
import { needTransformerForType } from "./utils";

export interface OutputFeatures {
    attributes: boolean;
    helpers: boolean;
}

export type CSharpTypeForAny = "object" | "dynamic";

export const cSharpOptions = {
    framework: new EnumOption(
        "framework",
        "Serialization framework",
        {
            NewtonSoft: "NewtonSoft",
            SystemTextJson: "SystemTextJson"
        } as const,
        "NewtonSoft"
    ),
    useList: new EnumOption(
        "array-type",
        "Use T[] or List<T>",
        {
            array: false,
            list: true
        },
        "array"
    ),
    dense: new EnumOption(
        "density",
        "Property density",
        {
            normal: false,
            dense: true
        } as const,
        "normal",
        "secondary"
    ),
    // FIXME: Do this via a configurable named eventually.
    namespace: new StringOption("namespace", "Generated namespace", "NAME", "QuickType"),
    version: new EnumOption(
        "csharp-version",
        "C# version",
        {
            "5": 5,
            "6": 6
        } as const,
        "6",
        "secondary"
    ),
    virtual: new BooleanOption("virtual", "Generate virtual properties", false),
    typeForAny: new EnumOption(
        "any-type",
        'Type to use for "any"',
        {
            object: "object",
            dynamic: "dynamic"
        } as const,
        "object",
        "secondary"
    ),
    useDecimal: new EnumOption(
        "number-type",
        "Type to use for numbers",
        {
            double: false,
            decimal: true
        } as const,
        "double",
        "secondary"
    ),
    features: new EnumOption(
        "features",
        "Output features",
        {
            "complete": { namespaces: true, helpers: true, attributes: true },
            "attributes-only": { namespaces: true, helpers: false, attributes: true },
            "just-types-and-namespace": { namespaces: true, helpers: false, attributes: false },
            "just-types": { namespaces: true, helpers: false, attributes: false }
        } as const,
        "complete"
    ),
    baseclass: new EnumOption(
        "base-class",
        "Base class",
        {
            EntityData: "EntityData",
            Object: undefined
        } as const,
        "Object",
        "secondary"
    ),
    checkRequired: new BooleanOption("check-required", "Fail if required properties are missing", false),
    keepPropertyName: new BooleanOption("keep-property-name", "Keep original field name generate", false)
} as const;

export const newtonsoftCSharpOptions = Object.assign({}, cSharpOptions, {});

export const systemTextJsonCSharpOptions = Object.assign({}, cSharpOptions, {});

export const cSharpLanguageConfig = { displayName: "C#", names: ["cs", "csharp"], extension: "cs" } as const;

export class CSharpTargetLanguage extends TargetLanguage<typeof cSharpLanguageConfig> {
    public constructor() {
        super(cSharpLanguageConfig);
    }

    public getOptions(): typeof cSharpOptions {
        return cSharpOptions;
    }

    public get stringTypeMapping(): StringTypeMapping {
        const mapping: Map<TransformedStringTypeKind, PrimitiveStringTypeKind> = new Map();
        mapping.set("date", "date-time");
        mapping.set("time", "date-time");
        mapping.set("date-time", "date-time");
        mapping.set("uuid", "uuid");
        mapping.set("uri", "uri");
        mapping.set("integer-string", "integer-string");
        mapping.set("bool-string", "bool-string");
        return mapping;
    }

    public get supportsUnionsWithBothNumberTypes(): boolean {
        return true;
    }

    public get supportsOptionalClassProperties(): boolean {
        return true;
    }

    public needsTransformerForType(t: Type): boolean {
        const need = needTransformerForType(t);
        return need !== "none" && need !== "nullable";
    }

    protected makeRenderer(renderContext: RenderContext, untypedOptionValues: FixMeOptionsType): ConvenienceRenderer {
        const options = getOptionValues(cSharpOptions, untypedOptionValues);

        switch (options.framework) {
            case "NewtonSoft":
                return new NewtonsoftCSharpRenderer(
                    this,
                    renderContext,
                    getOptionValues(newtonsoftCSharpOptions, untypedOptionValues)
                );
            case "SystemTextJson":
                return new SystemTextJsonCSharpRenderer(
                    this,
                    renderContext,
                    getOptionValues(systemTextJsonCSharpOptions, untypedOptionValues)
                );
            default:
                return assertNever(options.framework);
        }
    }
}
