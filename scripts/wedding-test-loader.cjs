const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  ts = require("typescript");
const root = path.resolve(__dirname, "..");
/** Loads the real server-action source with explicit boundary doubles; no network, mail or client store access. */
exports.loader = function (doubles = {}) {
  const cache = {};
  function load(name, from = root) {
    if (Object.hasOwn(doubles, name)) return doubles[name];
    if (name === "server-only") return {};
    if (
      !name.startsWith(".") &&
      !name.startsWith("@/") &&
      !path.isAbsolute(name)
    )
      return require(name);
    let file = name.startsWith("@/")
      ? path.join(root, name.slice(2))
      : path.resolve(from, name);
    if (!path.extname(file))
      file =
        [".ts", ".tsx", ".json"]
          .map((e) => file + e)
          .find((f) => fs.existsSync(f)) || file;
    if (cache[file]) return cache[file].exports;
    if (file.endsWith(".json"))
      return JSON.parse(fs.readFileSync(file, "utf8"));
    const mod = { exports: {} };
    cache[file] = mod;
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const execute = vm.runInThisContext(
      `(function(require,module,exports){${source}\n})`,
      { filename: file },
    );
    execute((n) => load(n, path.dirname(file)), mod, mod.exports);
    return mod.exports;
  }
  return load;
};
