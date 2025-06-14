"use strict";
'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const FileUpload_1 = __importDefault(require("@/components/FileUpload"));
const AnalysisPanel_1 = __importDefault(require("@/components/AnalysisPanel"));
const ChatInterface_1 = __importDefault(require("@/components/ChatInterface"));
function Home() {
    const [selectedFile, setSelectedFile] = (0, react_1.useState)(null);
    const [motion, setMotion] = (0, react_1.useState)('');
    const [format, setFormat] = (0, react_1.useState)('BP');
    const [analysis, setAnalysis] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [chatMessages, setChatMessages] = (0, react_1.useState)([]);
    const handleAnalyze = () => __awaiter(this, void 0, void 0, function* () {
        if (!selectedFile || !motion)
            return;
        setIsLoading(true);
        try {
            // TODO: Implement actual API call
            const response = yield fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioPath: selectedFile, motion, format }),
            });
            if (!response.ok)
                throw new Error('Analysis failed');
            const data = yield response.json();
            setAnalysis(data);
        }
        catch (error) {
            console.error('Analysis error:', error);
            // TODO: Add proper error handling
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleChatMessage = (message) => __awaiter(this, void 0, void 0, function* () {
        if (!analysis)
            return;
        const newMessage = {
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, newMessage]);
        try {
            // TODO: Implement actual API call
            const response = yield fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysis,
                    message,
                }),
            });
            if (!response.ok)
                throw new Error('Chat failed');
            const data = yield response.json();
            setChatMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date(),
                },
            ]);
        }
        catch (error) {
            console.error('Chat error:', error);
            setChatMessages(prev => [
                ...prev,
                {
                    role: 'error',
                    content: 'Failed to get response',
                    timestamp: new Date(),
                },
            ]);
        }
    });
    return (React.createElement("div", { className: "space-y-8" },
        React.createElement("header", null,
            React.createElement("h1", { className: "text-4xl font-bold text-ice-blue-700 mb-2" }, "Debate Coach"),
            React.createElement("p", { className: "text-slate-600" }, "AI-powered debate speech analysis and feedback")),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
            React.createElement("div", { className: "card" },
                React.createElement("h2", { className: "text-2xl font-semibold text-slate-800 mb-4" }, "Analyze Speech"),
                React.createElement(FileUpload_1.default, { selectedFile: selectedFile, onFileSelect: setSelectedFile }),
                React.createElement("div", { className: "space-y-4 mt-6" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-slate-700 mb-2" }, "Debate Motion"),
                        React.createElement("input", { type: "text", value: motion, onChange: (e) => setMotion(e.target.value), className: "input-field", placeholder: "Enter the debate motion" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-slate-700 mb-2" }, "Debate Format"),
                        React.createElement("select", { value: format, onChange: (e) => setFormat(e.target.value), className: "input-field" },
                            React.createElement("option", { value: "BP" }, "British Parliamentary"),
                            React.createElement("option", { value: "WSDC" }, "World Schools"))),
                    React.createElement("button", { onClick: handleAnalyze, disabled: !selectedFile || !motion || isLoading, className: "btn-primary w-full" }, isLoading ? 'Analyzing...' : 'Analyze Speech'))),
            React.createElement("div", { className: "card" },
                React.createElement("h2", { className: "text-2xl font-semibold text-slate-800 mb-4" }, "Analysis Results"),
                isLoading ? (React.createElement("div", { className: "flex items-center justify-center space-x-2 py-12" },
                    React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-ice-blue-600" }),
                    React.createElement("span", { className: "text-slate-600" }, "Analyzing speech..."))) : analysis ? (React.createElement(React.Fragment, null,
                    React.createElement(AnalysisPanel_1.default, { analysis: analysis }),
                    React.createElement(ChatInterface_1.default, { messages: chatMessages, onSendMessage: handleChatMessage }))) : (React.createElement("div", { className: "text-center py-12" },
                    React.createElement("div", { className: "text-creme-400 mb-4" },
                        React.createElement("svg", { className: "w-16 h-16 mx-auto", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" }))),
                    React.createElement("p", { className: "text-slate-600" }, "Select an audio file and enter the debate motion to begin analysis")))))));
}
exports.default = Home;
//# sourceMappingURL=page.js.map