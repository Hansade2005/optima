import { ClineProvider } from "../core/webview/ClineProvider";
export const handleUri = async (uri) => {
    const path = uri.path;
    const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"));
    const visibleProvider = ClineProvider.getVisibleInstance();
    if (!visibleProvider) {
        return;
    }
    switch (path) {
        case "/glama": {
            const code = query.get("code");
            if (code) {
                await visibleProvider.handleGlamaCallback(code);
            }
            break;
        }
        case "/openrouter": {
            const code = query.get("code");
            if (code) {
                await visibleProvider.handleOpenRouterCallback(code);
            }
            break;
        }
        default:
            break;
    }
};
//# sourceMappingURL=handleUri.js.map