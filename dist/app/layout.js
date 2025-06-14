"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
const google_1 = require("next/font/google");
require("./globals.css");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'Debate Coach',
    description: 'AI-powered debate coaching application',
};
function RootLayout({ children, }) {
    return (React.createElement("html", { lang: "en" },
        React.createElement("body", { className: inter.className },
            React.createElement("main", { className: "container mx-auto px-4 py-8" }, children))));
}
exports.default = RootLayout;
//# sourceMappingURL=layout.js.map