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
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
const fs_1 = require("fs");
const path_1 = require("path");
const assertStringLiteral = t.assertStringLiteral;
function default_1() {
    return {
        visitor: {
            CallExpression(path, { opts, file }) {
                if (!("name" in path.node.callee)) {
                    return;
                }
                // Extract the called method name.
                const name = path.node.callee.name;
                // If the method name is not "includeBytes" do nothing.
                if (name === "includeBytes") {
                    // Extract the called method arguments.
                    const args = path.node.arguments;
                    // Get the path of file
                    const filename = file.opts.filename;
                    // User settings
                    const root = opts.root || (0, path_1.dirname)(filename);
                    // Read binary file into bytes, so encoding is 'latin1' (each byte is 0-255, become one character)
                    const encoding = "latin1";
                    const [firstArg] = args;
                    // Require first arg to be a string literal
                    assertStringLiteral(firstArg);
                    // Error if filename is not found
                    if (filename === undefined || filename === "unknown") {
                        throw new Error("`includeBytes` function called outside of file");
                    }
                    if (!("value" in firstArg && typeof firstArg.value === "string")) {
                        throw new Error(`\`includeBytes\` function called with invalid argument: ${args[0]}`);
                    }
                    // Generate and locate the file
                    const fileRelPath = firstArg.value; // Get literal string value
                    const filePath = (0, path_1.join)(root, fileRelPath);
                    const fileSrc = (0, fs_1.readFileSync)(filePath, { encoding }).toString();
                    path.replaceWith(t.callExpression(t.memberExpression(t.identifier("env"), t.identifier("latin1_string_to_uint8array")), [t.stringLiteral(fileSrc)]));
                }
            },
        },
    };
}
exports.default = default_1;
