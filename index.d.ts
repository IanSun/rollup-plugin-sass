import type { PluginImpl } from "rollup";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Options as SassOptions } from "sass";

interface RollupPluginSassOptions extends Pick<SassOptions, "functions"> {
  exclude?: FilterPattern;
  include?: FilterPattern;
}

type RollupPluginSass = PluginImpl<RollupPluginSassOptions>;

export default RollupPluginSass;
export { RollupPluginSassOptions };
