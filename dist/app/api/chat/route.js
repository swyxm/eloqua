"use strict";
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
exports.POST = void 0;
const server_1 = require("next/server");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { analysis, message } = yield request.json();
            if (!analysis || !message) {
                return server_1.NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
            }
            const response = yield openai.chat.completions.create({
                model: "gpt-4.1-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a debate coach providing detailed feedback on speeches."
                    },
                    {
                        role: "user",
                        content: analysis.llm_prompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            });
            return server_1.NextResponse.json({
                response: response.choices[0].message.content
            });
        }
        catch (error) {
            console.error('Chat error:', error);
            return server_1.NextResponse.json({ error: 'Failed to get chat response' }, { status: 500 });
        }
    });
}
exports.POST = POST;
//# sourceMappingURL=route.js.map