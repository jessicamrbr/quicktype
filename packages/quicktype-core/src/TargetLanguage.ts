import { mapMap } from "collection-utils";

import { ConvenienceRenderer } from "./ConvenienceRenderer";
import { type DateTimeRecognizer, DefaultDateTimeRecognizer } from "./DateTime";
import { type RenderContext, type Renderer } from "./Renderer";
import { type Option, type OptionDefinition } from "./RendererOptions";
import { type SerializedRenderResult, serializeRenderResult } from "./Source";
import { type Comment } from "./support/Comments";
import { defined } from "./support/Support";
import { type Type } from "./Type";
import { type StringTypeMapping } from "./TypeBuilder";
import { type TypeGraph } from "./TypeGraph";
import { type FixMeOptionsType } from "./types";

export type MultiFileRenderResult = ReadonlyMap<string, SerializedRenderResult>;

export interface LanguageConfig {
    readonly displayName: string;
    readonly extension: string;
    readonly names: readonly string[];
}

export abstract class TargetLanguage<Config extends LanguageConfig = LanguageConfig> {
    public readonly displayName: Config["displayName"];

    public readonly names: Config["names"];

    public readonly extension: Config["extension"];

    public constructor({ displayName, names, extension }: Config) {
        this.displayName = displayName;
        this.names = names;
        this.extension = extension;
    }

    protected abstract getOptions(): Record<string, Option<string, unknown>>;

    public get optionDefinitions(): Array<OptionDefinition<string, unknown>> {
        return Object.values(this.getOptions()).map(o => o.definition);
    }

    public get cliOptionDefinitions(): {
        actual: Array<OptionDefinition<string, unknown>>;
        display: Array<OptionDefinition<string, unknown>>;
    } {
        let actual: Array<OptionDefinition<string, unknown>> = [];
        let display: Array<OptionDefinition<string, unknown>> = [];
        for (const { cliDefinitions } of Object.values(this.getOptions())) {
            actual = actual.concat(cliDefinitions.actual);
            display = display.concat(cliDefinitions.display);
        }

        return { actual, display };
    }

    public get name(): (typeof this.names)[0] {
        return defined(this.names[0]);
    }

    protected abstract makeRenderer(renderContext: RenderContext, optionValues: FixMeOptionsType): Renderer;

    public renderGraphAndSerialize(
        typeGraph: TypeGraph,
        givenOutputFilename: string,
        alphabetizeProperties: boolean,
        leadingComments: Comment[] | undefined,
        rendererOptions: FixMeOptionsType,
        indentation?: string
    ): MultiFileRenderResult {
        if (indentation === undefined) {
            indentation = this.defaultIndentation;
        }

        const renderContext = { typeGraph, leadingComments };
        const renderer = this.makeRenderer(renderContext, rendererOptions);
        if (renderer instanceof ConvenienceRenderer) {
            renderer.setAlphabetizeProperties(alphabetizeProperties);
        }

        const renderResult = renderer.render(givenOutputFilename);
        return mapMap(renderResult.sources, s => serializeRenderResult(s, renderResult.names, defined(indentation)));
    }

    protected get defaultIndentation(): string {
        return "    ";
    }

    public get stringTypeMapping(): StringTypeMapping {
        return new Map();
    }

    public get supportsOptionalClassProperties(): boolean {
        return false;
    }

    public get supportsUnionsWithBothNumberTypes(): boolean {
        return false;
    }

    public get supportsFullObjectType(): boolean {
        return false;
    }

    public needsTransformerForType(_t: Type): boolean {
        return false;
    }

    public get dateTimeRecognizer(): DateTimeRecognizer {
        return new DefaultDateTimeRecognizer();
    }
}
