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
exports.runAbiCompilerPlugin = void 0;
const typescript_1 = __importDefault(require("typescript"));
const json5_1 = __importDefault(require("json5"));
const abi = __importStar(require("near-abi"));
const TJS = __importStar(require("near-typescript-json-schema"));
const fs = __importStar(require("fs"));
const version_js_1 = require("../version.js");
function parseMetadata(packageJsonPath) {
    const packageJson = json5_1.default.parse(fs.readFileSync(packageJsonPath, "utf8"));
    let authors = [];
    if (packageJson["author"])
        authors.push(packageJson["author"]);
    authors = authors.concat(packageJson["contributors"] || []);
    return {
        name: packageJson["name"],
        version: packageJson["version"],
        authors,
        build: {
            compiler: "tsc " + typescript_1.default.version,
            builder: "near-sdk-js " + version_js_1.LIB_VERSION,
        },
    };
}
function getProgramFromFiles(files, jsonCompilerOptions, basePath = "./") {
    const { options, errors } = typescript_1.default.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath);
    if (errors.length > 0) {
        errors.forEach((error) => {
            console.log(error.messageText);
        });
        throw Error("Invalid compiler options");
    }
    return typescript_1.default.createProgram(files, options);
}
function validateNearClass(node) {
    if (node.kind !== typescript_1.default.SyntaxKind.ClassDeclaration) {
        throw Error("Expected NEAR function to be inside of a class");
    }
    const classDeclaration = node;
    const decorators = classDeclaration.decorators || [];
    const containsNearBindgen = decorators.some((decorator) => {
        if (decorator.expression.kind !== typescript_1.default.SyntaxKind.CallExpression)
            return false;
        const decoratorExpression = decorator.expression;
        if (decoratorExpression.expression.kind !== typescript_1.default.SyntaxKind.Identifier)
            return false;
        const decoratorIdentifier = decoratorExpression.expression;
        const decoratorName = decoratorIdentifier.text;
        return decoratorName === "NearBindgen";
    });
    if (!containsNearBindgen) {
        throw Error("Expected NEAR function to be inside of a class decorated with @NearBindgen");
    }
}
function runAbiCompilerPlugin(tsFile, packageJsonPath, tsConfigJsonPath) {
    const tsConfig = json5_1.default.parse(fs.readFileSync(tsConfigJsonPath, "utf8"));
    const program = getProgramFromFiles([tsFile], tsConfig["compilerOptions"]);
    const typeChecker = program.getTypeChecker();
    const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
    if (diagnostics.length > 0) {
        diagnostics.forEach((diagnostic) => {
            const message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            if (diagnostic.file && diagnostic.start) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.error(message);
            }
        });
        throw Error("Failed to compile the contract");
    }
    const generator = TJS.buildGenerator(program);
    if (!generator) {
        throw Error("Failed to generate ABI due to an unexpected typescript-json-schema error. Please report this.");
    }
    const abiFunctions = [];
    program.getSourceFiles().forEach((sourceFile, _sourceFileIdx) => {
        function inspect(node, tc) {
            if (node.kind === typescript_1.default.SyntaxKind.MethodDeclaration) {
                const methodDeclaration = node;
                const decorators = methodDeclaration.decorators ||
                    [];
                let isCall = false;
                let isView = false;
                let isInit = false;
                const abiModifiers = [];
                decorators.forEach((decorator) => {
                    if (decorator.expression.kind !== typescript_1.default.SyntaxKind.CallExpression)
                        return;
                    const decoratorExpression = decorator.expression;
                    if (decoratorExpression.expression.kind !== typescript_1.default.SyntaxKind.Identifier)
                        return;
                    const decoratorIdentifier = decoratorExpression.expression;
                    const decoratorName = decoratorIdentifier.text;
                    if (decoratorName === "call") {
                        isCall = true;
                        decoratorExpression.arguments.forEach((arg) => {
                            if (arg.kind !== typescript_1.default.SyntaxKind.ObjectLiteralExpression)
                                return;
                            const objLiteral = arg;
                            objLiteral.properties.forEach((prop) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const propName = prop.name.text;
                                if (propName === "privateFunction") {
                                    if (prop.kind !== typescript_1.default.SyntaxKind.PropertyAssignment)
                                        return;
                                    const propAssignment = prop;
                                    const init = propAssignment.initializer;
                                    if (init.kind === typescript_1.default.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Private);
                                    }
                                    else if (init.kind === typescript_1.default.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    }
                                    else {
                                        throw Error("Unexpected initializer for `privateFunction`: kind " +
                                            init.kind);
                                    }
                                }
                                if (propName === "payableFunction") {
                                    if (prop.kind !== typescript_1.default.SyntaxKind.PropertyAssignment)
                                        return;
                                    const propAssignment = prop;
                                    const init = propAssignment.initializer;
                                    if (init.kind === typescript_1.default.SyntaxKind.TrueKeyword) {
                                        abiModifiers.push(abi.AbiFunctionModifier.Payable);
                                    }
                                    else if (init.kind === typescript_1.default.SyntaxKind.FalseKeyword) {
                                        // Do nothing
                                    }
                                    else {
                                        throw Error("Unexpected initializer for `publicFunction`: kind " +
                                            init.kind);
                                    }
                                }
                            });
                        });
                    }
                    if (decoratorName === "view")
                        isView = true;
                    if (decoratorName === "initialize") {
                        isInit = true;
                        abiModifiers.push(abi.AbiFunctionModifier.Init);
                    }
                });
                const nearDecoratorsCount = [isCall, isView, isInit].filter((b) => b).length;
                if (nearDecoratorsCount > 1) {
                    throw Error("NEAR function cannot be init, call and view at the same time");
                }
                if (nearDecoratorsCount === 0) {
                    return;
                }
                validateNearClass(node.parent);
                let abiParams = [];
                if (methodDeclaration.parameters.length > 1) {
                    throw Error("Expected NEAR function to have a single object parameter, but got " +
                        methodDeclaration.parameters.length);
                }
                else if (methodDeclaration.parameters.length === 1) {
                    const jsonObjectParameter = methodDeclaration.parameters[0];
                    if (!jsonObjectParameter.type) {
                        throw Error("Expected NEAR function to have explicit types, e.g. `{ id }: {id : string }`");
                    }
                    if (jsonObjectParameter.type.kind !== typescript_1.default.SyntaxKind.TypeLiteral) {
                        throw Error("Expected NEAR function to have a single object binding parameter, e.g. `{ id }: { id: string }`");
                    }
                    const typeLiteral = jsonObjectParameter.type;
                    abiParams = typeLiteral.members.map((member) => {
                        if (member.kind !== typescript_1.default.SyntaxKind.PropertySignature) {
                            throw Error("Expected NEAR function to have a single object binding parameter, e.g. `{ id }: { id: string }`");
                        }
                        const propertySignature = member;
                        const nodeType = tc.getTypeAtLocation(propertySignature.type);
                        const schema = generator.getTypeDefinition(nodeType, true);
                        const abiParameter = {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            name: propertySignature.name.text,
                            type_schema: schema,
                        };
                        return abiParameter;
                    });
                }
                let abiResult = undefined;
                const returnType = methodDeclaration.type;
                if (returnType) {
                    const nodeType = tc.getTypeAtLocation(returnType);
                    const schema = generator.getTypeDefinition(nodeType, true);
                    abiResult = {
                        serialization_type: abi.AbiSerializationType.Json,
                        type_schema: schema,
                    };
                }
                const abiFunction = {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name: methodDeclaration.name.text,
                    kind: isView ? abi.AbiFunctionKind.View : abi.AbiFunctionKind.Call,
                };
                if (abiModifiers.length > 0) {
                    abiFunction.modifiers = abiModifiers;
                }
                if (abiParams.length > 0) {
                    abiFunction.params = {
                        serialization_type: abi.AbiSerializationType.Json,
                        args: abiParams,
                    };
                }
                if (abiResult) {
                    abiFunction.result = abiResult;
                }
                abiFunctions.push(abiFunction);
            }
            else {
                typescript_1.default.forEachChild(node, (n) => inspect(n, tc));
            }
        }
        inspect(sourceFile, typeChecker);
    });
    const abiRoot = {
        schema_version: abi.SCHEMA_VERSION,
        metadata: parseMetadata(packageJsonPath),
        body: {
            functions: abiFunctions,
            root_schema: generator.getSchemaForSymbol("String", true, false),
        },
    };
    return abiRoot;
}
exports.runAbiCompilerPlugin = runAbiCompilerPlugin;
