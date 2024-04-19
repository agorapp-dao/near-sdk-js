#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCom = exports.transpileJsAndBuildWasmCom = exports.createJsFileWithRollupCom = exports.generateAbi = exports.checkTypescriptCom = exports.validateCom = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importStar(require("path"));
const plugin_node_resolve_1 = require("@rollup/plugin-node-resolve");
const rollup_plugin_sourcemaps_1 = __importDefault(require("rollup-plugin-sourcemaps"));
const plugin_babel_1 = require("@rollup/plugin-babel");
const rollup_1 = require("rollup");
const commander_1 = require("commander");
const signale_1 = __importDefault(require("signale"));
const utils_js_1 = require("./utils.js");
const abi_js_1 = require("./abi.js");
const { Signale } = signale_1.default;
const PROJECT_DIR = process.cwd();
const NEAR_SDK_JS = "node_modules/near-sdk-js";
const TSC = "node_modules/.bin/tsc";
const QJSC_DIR = `${NEAR_SDK_JS}/lib/cli/deps/quickjs`;
const QJSC = `${NEAR_SDK_JS}/lib/cli/deps/qjsc`;
const program = new commander_1.Command();
program
    .name("near-sdk-js")
    .addCommand(new commander_1.Command("build")
    .usage("[source] [target]")
    .description("Build NEAR JS Smart-contract")
    .argument("[source]", "Contract to build.", "src/index.js")
    .argument("[target]", "Target file path and name.", "build/contract.wasm")
    .argument("[packageJson]", "Target file path and name.", "package.json")
    .argument("[tsConfig]", "Target file path and name.", "tsconfig.json")
    .option("--verbose", "Whether to print more verbose output.", false)
    .option("--generateABI", "Whether to generate ABI.", false)
    .action(buildCom))
    .addCommand(new commander_1.Command("validateContract")
    .usage("[source]")
    .description("Validate a NEAR JS Smart-contract. Validates the contract by checking that all parameters are initialized in the constructor. Works only for typescript.")
    .argument("[source]", "Contract to validate.", "src/index.ts")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(validateCom))
    .addCommand(new commander_1.Command("checkTypescript")
    .usage("[source]")
    .description("Run TSC with some cli flags - warning - ignores tsconfig.json.")
    .argument("[source]", "Typescript file to validate", "src/index.ts")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(checkTypescriptCom))
    .addCommand(new commander_1.Command("createJsFileWithRollup")
    .usage("[source] [target]")
    .description("Create intermediate javascript file for later processing with QJSC")
    .argument("[source]", "Contract to build.", "src/index.js")
    .argument("[target]", "Target file path and name. The default corresponds to contract.js", "build/contract.wasm")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(createJsFileWithRollupCom))
    .addCommand(new commander_1.Command("transpileJsAndBuildWasm")
    .usage("[source] [target]")
    .description("Transpiles the target javascript file into .c and .h using QJSC then compiles that into wasm using clang")
    .argument("[target]", "Target file path and name. The js file must correspond to the same path with the js extension.", "build/contract.wasm")
    .option("--verbose", "Whether to print more verbose output.", false)
    .action(transpileJsAndBuildWasmCom))
    .parse();
function getTargetDir(target) {
    return (0, path_1.dirname)(target);
}
function getTargetExt(target) {
    return target.split(".").pop();
}
function getTargetFileName(target) {
    return (0, path_1.basename)(target, `.${getTargetExt(target)}`);
}
function getRollupTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.js`;
}
function getQjscTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.h`;
}
function getContractTarget(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}.wasm`;
}
function getContractAbi(target) {
    return `${getTargetDir(target)}/${getTargetFileName(target)}-abi.json`;
}
function requireTargetExt(target) {
    if (getTargetExt(target) === "wasm") {
        return;
    }
    signale_1.default.error(`Unsupported target ${getTargetExt(target)}, make sure target ends with .wasm!`);
    process.exit(1);
}
function ensureTargetDirExists(target) {
    const targetDir = getTargetDir(target);
    if (fs_1.default.existsSync(targetDir)) {
        return;
    }
    signale_1.default.await(`Creating ${targetDir} directory...`);
    fs_1.default.mkdirSync(targetDir, {});
}
async function validateCom(source, { verbose = false }) {
    const signale = new Signale({ scope: "validate", interactive: !verbose });
    signale.await(`Validating ${source} contract...`);
    if (!(await (0, utils_js_1.validateContract)(source, verbose))) {
        process.exit(1);
    }
}
exports.validateCom = validateCom;
async function checkTypescriptCom(source, { verbose = false }) {
    const signale = new Signale({
        scope: "checkTypescript",
        interactive: !verbose,
    });
    const sourceExt = source.split(".").pop();
    if (sourceExt !== "ts") {
        signale.info(`Source file is not a typescript file ${source}`);
        return;
    }
    signale.await(`Typechecking ${source} with tsc...`);
    await checkTsBuildWithTsc(source, verbose);
}
exports.checkTypescriptCom = checkTypescriptCom;
async function generateAbi(source, target, packageJson, tsConfig, { verbose = false }) {
    const signale = new Signale({ scope: "generateAbi", interactive: !verbose });
    const sourceExt = source.split(".").pop();
    if (sourceExt !== "ts") {
        signale.info(`Skipping ABI generation as source file is not a typescript file ${source}`);
        return;
    }
    signale.await("Generating ABI...");
    const abi = (0, abi_js_1.runAbiCompilerPlugin)(source, packageJson, tsConfig);
    fs_1.default.writeFileSync(getContractAbi(target), JSON.stringify(abi, null, 2));
    signale.success(`Generated ${getContractAbi(target)} ABI successfully!`);
}
exports.generateAbi = generateAbi;
async function createJsFileWithRollupCom(source, target, { verbose = false }) {
    const signale = new Signale({
        scope: "createJsFileWithRollup",
        interactive: !verbose,
    });
    requireTargetExt(target);
    ensureTargetDirExists(target);
    signale.await(`Creating ${source} file with Rollup...`);
    await createJsFileWithRullup(source, getRollupTarget(target), verbose);
}
exports.createJsFileWithRollupCom = createJsFileWithRollupCom;
async function transpileJsAndBuildWasmCom(target, { verbose = false }) {
    const signale = new Signale({
        scope: "transpileJsAndBuildWasm",
        interactive: !verbose,
    });
    requireTargetExt(target);
    ensureTargetDirExists(target);
    signale.await(`Creating ${getQjscTarget(target)} file with QJSC...`);
    await createHeaderFileWithQjsc(getRollupTarget(target), getQjscTarget(target), verbose);
    signale.await("Generating methods.h file...");
    await createMethodsHeaderFile(getRollupTarget(target), verbose);
    signale.await(`Creating ${getContractTarget(target)} contract...`);
    await createWasmContract(getQjscTarget(target), getContractTarget(target), verbose);
    signale.await("Executing wasi-stub...");
    await wasiStubContract(getContractTarget(target), verbose);
    signale.success(`Generated ${getContractTarget(target)} contract successfully!`);
}
exports.transpileJsAndBuildWasmCom = transpileJsAndBuildWasmCom;
async function buildCom(source, target, packageJson, tsConfig, { verbose = false, generateABI = false }) {
    const signale = new Signale({ scope: "build", interactive: !verbose });
    requireTargetExt(target);
    signale.await(`Building ${source} contract...`);
    await checkTypescriptCom(source, { verbose });
    ensureTargetDirExists(target);
    if (generateABI) {
        await generateAbi(source, target, packageJson, tsConfig, { verbose });
    }
    await validateCom(source, { verbose });
    await createJsFileWithRollupCom(source, target, { verbose });
    await transpileJsAndBuildWasmCom(target, { verbose });
}
exports.buildCom = buildCom;
async function checkTsBuildWithTsc(sourceFileWithPath, verbose = false) {
    await (0, utils_js_1.executeCommand)(`${TSC} --noEmit --skipLibCheck --experimentalDecorators --target es2020 --moduleResolution node ${sourceFileWithPath}`, verbose);
}
// Common build function
async function createJsFileWithRullup(sourceFileWithPath, rollupTarget, verbose = false) {
    const bundle = await (0, rollup_1.rollup)({
        input: sourceFileWithPath,
        plugins: [
            (0, plugin_node_resolve_1.nodeResolve)({
                extensions: [".js", ".ts"],
            }),
            (0, rollup_plugin_sourcemaps_1.default)(),
            // commonjs(),
            (0, plugin_babel_1.babel)({
                babelHelpers: "bundled",
                extensions: [".ts", ".js", ".jsx", ".es6", ".es", ".mjs"],
                presets: ["@babel/preset-typescript"],
                plugins: [
                    "near-sdk-js/lib/cli/build-tools/include-bytes.js",
                    [
                        "near-sdk-js/lib/cli/build-tools/near-bindgen-exporter.js",
                        { verbose },
                    ],
                    ["@babel/plugin-proposal-decorators", { version: "legacy" }],
                ],
            }),
        ],
    });
    await bundle.write({
        sourcemap: true,
        file: rollupTarget,
        format: "es",
    });
}
async function createHeaderFileWithQjsc(rollupTarget, qjscTarget, verbose = false) {
    await (0, utils_js_1.executeCommand)(`${QJSC} -c -m -o ${qjscTarget} -N code ${rollupTarget}`, verbose);
}
async function createMethodsHeaderFile(rollupTarget, verbose = false) {
    const buildPath = path_1.default.dirname(rollupTarget);
    if (verbose) {
        new Signale({ scope: "method-header" }).info(rollupTarget);
    }
    const mod = await Promise.resolve().then(() => __importStar(require(`${PROJECT_DIR}/${rollupTarget}`)));
    const exportNames = Object.keys(mod);
    if (exportNames.includes('panic')) {
        signale_1.default.error("'panic' is a reserved word, please use another name for contract method");
        process.exit(1);
    }
    const methods = exportNames.reduce((result, key) => `${result}DEFINE_NEAR_METHOD(${key})\n`, "");
    fs_1.default.writeFileSync(`${buildPath}/methods.h`, methods);
}
async function createWasmContract(qjscTarget, contractTarget, verbose = false) {
    const WASI_SDK_PATH = `${NEAR_SDK_JS}/lib/cli/deps/wasi-sdk`;
    const CC = `${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot`;
    const DEFS = `-D_GNU_SOURCE '-DCONFIG_VERSION="2021-03-27"' -DCONFIG_BIGNUM`;
    const INCLUDES = `-I${QJSC_DIR} -I.`;
    const ORIGINAL_BUILDER_PATH = `${NEAR_SDK_JS}/builder/builder.c`;
    const NEW_BUILDER_PATH = `${path_1.default.dirname(contractTarget)}/builder.c`;
    const SOURCES = `${NEW_BUILDER_PATH} ${QJSC_DIR}/quickjs.c ${QJSC_DIR}/libregexp.c ${QJSC_DIR}/libunicode.c ${QJSC_DIR}/cutils.c ${QJSC_DIR}/quickjs-libc-min.c ${QJSC_DIR}/libbf.c`;
    const LIBS = `-lm`;
    // copying builder.c file to the build folder
    fs_1.default.cpSync(ORIGINAL_BUILDER_PATH, NEW_BUILDER_PATH);
    fs_1.default.renameSync(qjscTarget, "build/code.h");
    await (0, utils_js_1.executeCommand)(`${CC} --target=wasm32-wasi -nostartfiles -Oz -flto ${DEFS} ${INCLUDES} ${SOURCES} ${LIBS} -Wl,--no-entry -Wl,--allow-undefined -Wl,-z,stack-size=${256 * 1024} -Wl,--lto-O3 -o ${contractTarget}`, verbose);
}
async function wasiStubContract(contractTarget, verbose = false) {
    const WASI_STUB = `${NEAR_SDK_JS}/lib/cli/deps/binaryen/wasi-stub/run.sh`;
    await (0, utils_js_1.executeCommand)(`${WASI_STUB} ${contractTarget}`, verbose);
}
