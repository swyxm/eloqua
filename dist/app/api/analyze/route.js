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
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const server_1 = require("next/server");
const child_process_1 = require("child_process");
function POST(request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { audioPath, motion, format } = yield request.json();
            if (!audioPath || !motion || !format) {
                return server_1.NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
            }
            return new Promise((resolve) => {
                const pythonProcess = (0, child_process_1.spawn)('python', [
                    'scripts/speech_analyzer.py',
                    audioPath,
                    motion,
                    format
                ]);
                let output = '';
                let error = '';
                pythonProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });
                pythonProcess.stderr.on('data', (data) => {
                    error += data.toString();
                });
                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        resolve(server_1.NextResponse.json({ error: `Python process exited with code ${code}: ${error}` }, { status: 500 }));
                    }
                    else {
                        try {
                            const analysis = JSON.parse(output);
                            resolve(server_1.NextResponse.json(analysis));
                        }
                        catch (e) {
                            resolve(server_1.NextResponse.json({ error: 'Failed to parse analysis output' }, { status: 500 }));
                        }
                    }
                });
            });
        }
        catch (error) {
            return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
    });
}
exports.POST = POST;
//# sourceMappingURL=route.js.map