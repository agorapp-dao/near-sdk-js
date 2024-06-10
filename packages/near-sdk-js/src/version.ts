import * as fs from "fs";
import * as path from "path";

const PACKAGE_JSON = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../package.json"),
        "utf-8"
    )
);
export const LIB_VERSION: string = PACKAGE_JSON["version"];
