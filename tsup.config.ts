import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/EgRadar.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
});