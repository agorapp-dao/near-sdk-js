"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("./utils.js");
const signale_1 = __importDefault(require("signale"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const { Signale } = signale_1.default;
async function main() {
    const signale = new Signale({ scope: "postinstall", interactive: true });
    // Clean existing deps folder
    process.chdir("lib/cli");
    const DEPS = "deps";
    fs_1.default.rmSync(DEPS, { recursive: true, force: true });
    fs_1.default.mkdirSync(DEPS);
    process.chdir(DEPS);
    const PLATFORM = os_1.default.platform();
    const ARCH = os_1.default.arch();
    console.log(`Current platform: ${PLATFORM}, current architecture: ${ARCH}`);
    const SUPPORTED_PLATFORMS = ["linux", "darwin"]; // Unsaported platforms: 'win32', 'aix', 'freebsd', 'openbsd', 'sunos', 'android'
    const SUPPORTED_ARCH = ["x64", "arm64"]; // Unsaported arch: 'arm', 'ia32', 'mips','mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32'
    if (!SUPPORTED_PLATFORMS.includes(PLATFORM)) {
        console.error(`Platform ${PLATFORM} is not supported at the moment`);
        process.exit(1);
    }
    if (!SUPPORTED_ARCH.includes(ARCH)) {
        console.error(`Architecture ${ARCH} is not supported at the moment`);
        process.exit(1);
    }
    signale.await("Installing wasi-stub...");
    const BINARYEN_VERSION = `0.1.16`;
    const BINARYEN_VERSION_TAG = `v${BINARYEN_VERSION}`;
    const BINARYEN_SYSTEM_NAME = PLATFORM === "linux"
        ? "Linux"
        : PLATFORM === "darwin"
            ? "macOS"
            : PLATFORM === "win32"
                ? "windows"
                : "other";
    const BINARYEN_ARCH_NAME = (ARCH == 'aarch64') ? 'ARM64' : ARCH.toUpperCase();
    const BINARYEN_TAR_NAME = `binaryen-${BINARYEN_SYSTEM_NAME}-${BINARYEN_ARCH_NAME}.tar.gz`;
    await (0, utils_js_1.download)(`https://github.com/ailisp/binaryen/releases/download/${BINARYEN_VERSION_TAG}/${BINARYEN_TAR_NAME}`);
    fs_1.default.mkdirSync("binaryen");
    await (0, utils_js_1.executeCommand)(`tar xvf ${BINARYEN_TAR_NAME} --directory binaryen`);
    fs_1.default.rmSync(BINARYEN_TAR_NAME);
    signale.await("Installing QuickJS...");
    const QUICK_JS_VERSION = `0.1.3`;
    const QUICK_JS_VERSION_TAG = `v${QUICK_JS_VERSION}`;
    const QUICK_JS_SYSTEM_NAME = PLATFORM === "linux"
        ? "Linux"
        : PLATFORM === "darwin"
            ? "macOS"
            : PLATFORM === "win32"
                ? "windows"
                : "other";
    const QUICK_JS_ARCH_NAME = ARCH === "x64" ? "X64" : ARCH === "arm64" ? "arm64" : "other";
    const QUICK_JS_TAR_NAME = `${QUICK_JS_VERSION_TAG}.tar.gz`;
    const QUICK_JS_DOWNLOADED_FOLDER_NAME = `quickjs-${QUICK_JS_VERSION}`;
    const QUICK_JS_TARGET_FOLDER_NAME = "quickjs";
    const QUICK_JS_DOWNLOADED_NAME = `qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`;
    const QUICK_JS_TARGET_NAME = "qjsc";
    // Download QuickJS
    await (0, utils_js_1.download)(`https://github.com/near/quickjs/releases/download/${QUICK_JS_VERSION_TAG}/qjsc-${QUICK_JS_SYSTEM_NAME}-${QUICK_JS_ARCH_NAME}`);
    await (0, utils_js_1.download)(`https://github.com/near/quickjs/archive/refs/tags/${QUICK_JS_VERSION_TAG}.tar.gz`);
    // Extract QuickJS
    await (0, utils_js_1.executeCommand)(`tar xvf ${QUICK_JS_TAR_NAME}`);
    // Delete .tar file
    fs_1.default.rmSync(QUICK_JS_TAR_NAME);
    // Delete version from folder name
    fs_1.default.renameSync(QUICK_JS_DOWNLOADED_FOLDER_NAME, QUICK_JS_TARGET_FOLDER_NAME);
    // Rename qjsc file
    fs_1.default.renameSync(QUICK_JS_DOWNLOADED_NAME, QUICK_JS_TARGET_NAME);
    // chmod qjsc
    fs_1.default.chmodSync(QUICK_JS_TARGET_NAME, 0o755);
    signale.await("Installing wasi-sdk...");
    const WASI_SDK_MAJOR_VER = 11;
    const WASI_SDK_MINOR_VER = 0;
    const WASI_SDK_DOWNLOADED_FOLDER_NAME = `wasi-sdk-${WASI_SDK_MAJOR_VER}.${WASI_SDK_MINOR_VER}`;
    const WASI_SDK_SYSTEM_NAME = PLATFORM === "linux"
        ? "linux"
        : PLATFORM === "darwin"
            ? "macos"
            : PLATFORM === "win32"
                ? "windows"
                : "other";
    const WASI_SDK_TAR_NAME = `${WASI_SDK_DOWNLOADED_FOLDER_NAME}-${WASI_SDK_SYSTEM_NAME}.tar.gz`;
    // Download WASI SDK
    await (0, utils_js_1.download)(`https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_SDK_MAJOR_VER}/${WASI_SDK_TAR_NAME}`);
    // Extract WASI SDK
    await (0, utils_js_1.executeCommand)(`tar xvf ${WASI_SDK_TAR_NAME}`);
    // Delete .tar file
    fs_1.default.rmSync(WASI_SDK_TAR_NAME);
    // Delete version from folder name
    fs_1.default.renameSync(WASI_SDK_DOWNLOADED_FOLDER_NAME, "wasi-sdk");
    signale.success("Successfully finished postinstall script!");
}
main();
