"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContract = exports.download = exports.executeCommand = void 0;
const child_process_1 = __importDefault(require("child_process"));
const util_1 = require("util");
const signale_1 = __importDefault(require("signale"));
const ts_morph_1 = require("ts-morph");
const chalk_1 = __importDefault(require("chalk"));
const { Signale } = signale_1.default;
const exec = (0, util_1.promisify)(child_process_1.default.exec);
async function executeCommand(command, verbose = false) {
    const signale = new Signale({ scope: "exec", interactive: !verbose });
    if (verbose) {
        signale.info(`Running command: ${command}`);
    }
    let stdout, stderr, code = 0;
    try {
        ({ stdout, stderr } = await exec(command));
    }
    catch (error) {
        ({ stdout, stderr, code } = error);
    }
    if (code != 0) {
        signale.error(`Command failed: ${command}`);
        const failDueToNameConflict = stderr.match(/conflicting types for '([a-zA-Z0-9_]+)'/);
        if (failDueToNameConflict && failDueToNameConflict.length > 1) {
            signale.error(`'${failDueToNameConflict[1]}' is a reserved word, please use another name for contract method"`);
        }
    }
    if (stderr && verbose) {
        signale.error(`Command stderr: ${stderr}`);
    }
    if (verbose) {
        signale.info(`Command stdout: ${stdout}`);
    }
    if (code != 0) {
        process.exit(1);
    }
    return stdout.trim();
}
exports.executeCommand = executeCommand;
async function download(url, verbose = false) {
    await executeCommand(`curl -LOf ${url}`, verbose);
}
exports.download = download;
const UNINITIALIZED_PARAMETERS_ERROR = "All parameters must be initialized in the constructor. Uninitialized parameters:";
/**
 * Validates the contract by checking that all parameters are initialized in the constructor. Works only for contracts written in TypeScript.
 *
 * @param contractPath - Path to the contract.
 * @param verbose - Whether to print verbose output.
 **/
async function validateContract(contractPath, verbose = false) {
    const signale = new Signale({ scope: "validate-contract" });
    const project = new ts_morph_1.Project();
    project.addSourceFilesAtPaths(contractPath);
    const sourceFile = project.getSourceFile(contractPath);
    const classDeclarations = sourceFile.getClasses();
    for (const classDeclaration of classDeclarations) {
        const classStructure = classDeclaration.getStructure();
        const { decorators, properties, name } = classStructure;
        const hasNearBindgen = decorators.some(({ name }) => name === "NearBindgen");
        if (hasNearBindgen) {
            if (verbose) {
                signale.info(`Validating ${name} class...`);
            }
            const constructors = classDeclaration.getConstructors();
            const hasConstructor = constructors.length > 0;
            const propertiesToBeInited = properties.filter(({ initializer }) => !initializer);
            if (!hasConstructor && propertiesToBeInited.length === 0) {
                return true;
            }
            if (!hasConstructor && propertiesToBeInited.length > 0) {
                signale.error(chalk_1.default.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${propertiesToBeInited
                    .map(({ name }) => name)
                    .join(", ")}`));
                return false;
            }
            const [constructor] = constructors;
            const constructorContent = constructor.getText();
            if (verbose) {
                signale.info("Checking for non initialized properties...");
            }
            const nonInitedProperties = propertiesToBeInited.reduce((properties, { name }) => {
                if (constructorContent.includes(`this.${name}`)) {
                    return properties;
                }
                return [...properties, name];
            }, []);
            if (nonInitedProperties.length > 0) {
                signale.error(chalk_1.default.redBright(`${UNINITIALIZED_PARAMETERS_ERROR} ${nonInitedProperties.join(", ")}`));
                return false;
            }
        }
    }
    return true;
}
exports.validateContract = validateContract;
