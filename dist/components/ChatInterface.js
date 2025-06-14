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
const react_1 = __importStar(require("react"));
const ChatInterface = ({ messages, onSendMessage }) => {
    const [input, setInput] = (0, react_1.useState)('');
    const messagesEndRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    return (react_1.default.createElement("div", { className: "mt-6" },
        react_1.default.createElement("h3", { className: "text-lg font-semibold text-slate-800 mb-2" }, "Ask Follow-up Questions"),
        react_1.default.createElement("div", { className: "space-y-4 mb-4 max-h-96 overflow-y-auto" },
            messages.map((message, index) => (react_1.default.createElement("div", { key: index, className: `p-4 rounded-lg ${message.role === 'user'
                    ? 'bg-ice-blue-50 ml-12'
                    : message.role === 'assistant'
                        ? 'bg-creme-50 mr-12'
                        : 'bg-red-50'}` },
                react_1.default.createElement("span", { className: "font-semibold text-slate-700" }, message.role === 'user' ? 'You: ' : message.role === 'assistant' ? 'Coach: ' : 'Error: '),
                react_1.default.createElement("span", { className: "text-slate-600" }, message.content)))),
            react_1.default.createElement("div", { ref: messagesEndRef })),
        react_1.default.createElement("form", { onSubmit: handleSubmit, className: "flex space-x-4" },
            react_1.default.createElement("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), className: "input-field", placeholder: "Ask a question about the feedback..." }),
            react_1.default.createElement("button", { type: "submit", disabled: !input.trim(), className: "btn-primary" }, "Ask"))));
};
exports.default = ChatInterface;
//# sourceMappingURL=ChatInterface.js.map