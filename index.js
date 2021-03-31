import { readFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { promisify } from "node:util";
import { createFilter } from "@rollup/pluginutils";
import Fiber from "fibers";
import sass from "sass";
import { SourceMapConsumer, SourceMapGenerator, SourceNode } from "source-map";

const OFFSET_BASE = 0,
      LINE_BASE = 1, COLUMN_BASE = 0;
const BACKSPACE = "\u0008",
      CARRIAGE_RETURN = "\u000d",
      CHARACTER_TABULATION = "\u0009",
      FORM_FEED = "\u000c",
      LINE_FEED = "\u000a",
      QUOTATION_MARK = "\u0022",
      REVERSE_SOLIDUS = "\u005c",
      SOLIDUS = "\u002f";
const ESCAPE_CHARACTER = [BACKSPACE, CARRIAGE_RETURN, CHARACTER_TABULATION, FORM_FEED, LINE_FEED, QUOTATION_MARK, REVERSE_SOLIDUS, SOLIDUS];

const render = promisify(sass.render);

/** @type {import("./index").default} */
export default function (options = {}) {
  const filter = createFilter(
    options.include || ["**/*.sass", "**/*.scss"],
    options.exclude,
  );

  return {
    name: "sass",
    async load (id) {
      if (filter(id)) {
        const css = await compile.call(
          this,
          id,
          { functions: options.functions },
        );
        const result = transform(css.code, id);

        const sourcemap = SourceMapGenerator.fromSourceMap(
          await new SourceMapConsumer({ ...result.map, version: 3 }),
        );
        sourcemap.applySourceMap(
          await new SourceMapConsumer({ ...css.map, version: 3 }),
          id,
        );
        const map = sourcemap.toJSON();

        return {
          code: result.code,
          map: {
            mappings: map.mappings,
            sources: map.sources,
          },
        };
      }
    },
    async resolveId (source, importer) {
      if (filter(importer)) {
        let resolution = await this.resolve(source, importer, { skipSelf: true });

        if (!resolution) {
          resolution = await this.resolve(
            source + extname(importer),
            importer,
            { skipSelf: true },
          );
        }

        return resolution;
      }
    },
  };
}

/**
 * @this {import("rollup").PluginContext}
 * @param {string} id
 * @param {import("sass").Options} options
 * @return {Promise<import("rollup").SourceDescription>}
 */
async function compile (id, options) {
  const sourceRoot = dirname(id);

  const result = await render({
    ...options,
    data: await readFile(id, "utf8"),
    fiber: Fiber,
    file: id,
    importer: createImporter.call(this),
    linefeed: "lf",
    omitSourceMapUrl: true,
    outFile: id,
    sourceMap: true,
    sourceMapRoot: sourceRoot,
  });

  for (const id of result.stats.includedFiles) {
    this.addWatchFile(id);
  }

  const map = JSON.parse(result.map.toString());

  return {
    code: result.css.toString(),
    map: {
      mappings: map.mappings,
      sources: map.sources.map(source => join(sourceRoot, source)),
    },
  };
}

/**
 * @this {import("rollup").PluginContext}
 * @return {import("sass").Options["importer"]}
 */
function createImporter () {
  return (source, importer, next) => {
    this
      .resolve(source, importer)
      .then(
        resolution =>
          resolution
            ? { file: resolution.id }
            : Object.assign(
              new Error(`Cannot find module "${ source }"`),
              { code: "MODULE_NOT_FOUND" },
            ),
      )
      .then(next);
  };
}

/**
 * @param {string} code
 * @param {string} id
 * @return {import("rollup").SourceDescription}
 */
function transform (code, id) {
  const sourceNode = new SourceNode(LINE_BASE, COLUMN_BASE, id);

  const ITERATION_BASE = 1;
  let line = LINE_BASE, column = COLUMN_BASE;
  for (
    let index = OFFSET_BASE, { [index]: character } = code;
    character;
    { [index += ITERATION_BASE]: character } = code
  ) {
    sourceNode.add(
      new SourceNode(
        line,
        column,
        id,
        ESCAPE_CHARACTER.includes(character)
          ? JSON
            .stringify(character)
            .slice(QUOTATION_MARK.length, -QUOTATION_MARK.length)
          : character,
      ),
    );

    switch (character) {
    case LINE_FEED:
      line += ITERATION_BASE;
      column = COLUMN_BASE;
      break;

    default:
      column += ITERATION_BASE;
    }
  }
  sourceNode.prepend(`export default ${ QUOTATION_MARK }`);
  sourceNode.add(`${ QUOTATION_MARK };${ LINE_FEED }`);

  const result = sourceNode.toStringWithSourceMap();
  const map = result.map.toJSON();

  return {
    code: result.code,
    map: {
      mappings: map.mappings,
      sources: map.sources,
    },
  };
}
