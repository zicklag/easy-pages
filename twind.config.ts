import { Options } from "$fresh/plugins/twindv1.ts";
import { defineConfig } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import presetTypography from '@twind/preset-typography'

const config = defineConfig({
  presets: [presetTailwind(), presetTypography()],
  // deno-lint-ignore no-explicit-any
}) as any;

export default {
  selfURL: import.meta.url,
  ...config,
} as Options;
