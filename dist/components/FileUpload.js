"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const FileUpload = ({ selectedFile, onFileSelect }) => {
    const handleFileChange = (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            onFileSelect(file.name);
        }
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("label", { className: "block text-slate-700 mb-2" }, "Audio File"),
        react_1.default.createElement("div", { className: "flex items-center space-x-4" },
            react_1.default.createElement("label", { className: "btn-primary cursor-pointer" },
                react_1.default.createElement("span", null, "Select File"),
                react_1.default.createElement("input", { type: "file", className: "hidden", accept: ".wav,.mp3", onChange: handleFileChange })),
            react_1.default.createElement("span", { className: "text-slate-600" }, selectedFile || 'No file selected'))));
};
exports.default = FileUpload;
//# sourceMappingURL=FileUpload.js.map