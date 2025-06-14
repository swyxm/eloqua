"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const AnalysisPanel = ({ analysis }) => {
    return (react_1.default.createElement("div", { className: "space-y-6" },
        react_1.default.createElement("div", { className: "bg-creme-50 rounded-lg p-4" },
            react_1.default.createElement("h3", { className: "text-lg font-semibold text-slate-800 mb-2" }, "Score"),
            react_1.default.createElement("p", { className: "text-2xl font-bold text-ice-blue-600" }, analysis.score || '--')),
        react_1.default.createElement("div", { className: "bg-slate-50 rounded-lg p-4" },
            react_1.default.createElement("h3", { className: "text-lg font-semibold text-slate-800 mb-2" }, "Speech Statistics"),
            react_1.default.createElement("div", { className: "grid grid-cols-2 gap-4" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Duration"),
                    react_1.default.createElement("p", { className: "font-medium" },
                        analysis.duration_seconds.toFixed(1),
                        "s")),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Word Count"),
                    react_1.default.createElement("p", { className: "font-medium" }, analysis.transcript_stats.word_count)),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Sentences"),
                    react_1.default.createElement("p", { className: "font-medium" }, analysis.transcript_stats.sentences.length)),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Words per Minute"),
                    react_1.default.createElement("p", { className: "font-medium" }, ((analysis.transcript_stats.word_count / analysis.duration_seconds) * 60).toFixed(1))))),
        react_1.default.createElement("div", { className: "bg-slate-50 rounded-lg p-4" },
            react_1.default.createElement("h3", { className: "text-lg font-semibold text-slate-800 mb-2" }, "Delivery Analysis"),
            react_1.default.createElement("div", { className: "grid grid-cols-2 gap-4" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Pitch Variation"),
                    react_1.default.createElement("p", { className: "font-medium" }, analysis.prosody_stats.F0semitoneFrom27_5Hz_sma3nz_stddevNorm.toFixed(2))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Volume"),
                    react_1.default.createElement("p", { className: "font-medium" }, analysis.prosody_stats.loudness_sma3_amean.toFixed(2))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Voice Stability"),
                    react_1.default.createElement("p", { className: "font-medium" }, analysis.prosody_stats.jitterLocal_sma3nz_amean.toFixed(4))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("p", { className: "text-sm text-slate-600" }, "Speech Rate"),
                    react_1.default.createElement("p", { className: "font-medium" },
                        analysis.prosody_stats.VoicedSegmentsPerSec.toFixed(2),
                        " segments/s")))),
        react_1.default.createElement("div", { className: "bg-slate-50 rounded-lg p-4" },
            react_1.default.createElement("h3", { className: "text-lg font-semibold text-slate-800 mb-2" }, "Transcript"),
            react_1.default.createElement("div", { className: "prose prose-slate max-w-none" },
                react_1.default.createElement("p", { className: "text-slate-600" }, analysis.transcript)))));
};
exports.default = AnalysisPanel;
//# sourceMappingURL=AnalysisPanel.js.map