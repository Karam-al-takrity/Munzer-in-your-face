"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    console.log("Extension activated");
    const provider = new CustomSidebarViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(CustomSidebarViewProvider.viewType, provider));
    let _statusBarItem;
    let errorLensEnabled = true;
    let disposableEnableErrorLens = vscode.commands.registerCommand("ErrorLens.enable", () => {
        errorLensEnabled = true;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateDecorationsForUri(activeTextEditor.document.uri);
        }
    });
    context.subscriptions.push(disposableEnableErrorLens);
    let disposableDisableErrorLens = vscode.commands.registerCommand("ErrorLens.disable", () => {
        errorLensEnabled = false;
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            updateDecorationsForUri(activeTextEditor.document.uri);
        }
    });
    context.subscriptions.push(disposableDisableErrorLens);
    vscode.languages.onDidChangeDiagnostics((diagnosticChangeEvent) => {
        onChangedDiagnostics(diagnosticChangeEvent);
    }, null, context.subscriptions);
    vscode.workspace.onDidOpenTextDocument((textDocument) => {
        updateDecorationsForUri(textDocument.uri);
    }, null, context.subscriptions);
    vscode.window.onDidChangeActiveTextEditor((textEditor) => {
        if (textEditor) {
            updateDecorationsForUri(textEditor.document.uri);
        }
    }, null, context.subscriptions);
    function onChangedDiagnostics(diagnosticChangeEvent) {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return;
        }
        for (const uri of diagnosticChangeEvent.uris) {
            if (uri.fsPath === activeTextEditor.document.uri.fsPath) {
                updateDecorationsForUri(uri);
                break;
            }
        }
    }
    function updateDecorationsForUri(uriToDecorate) {
        if (!uriToDecorate || uriToDecorate.scheme !== "file" || !vscode.window) {
            return;
        }
        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor || !activeTextEditor.document.uri.fsPath) {
            return;
        }
        let numErrors = 0;
        let numWarnings = 0;
        if (errorLensEnabled) {
            let aggregatedDiagnostics = {};
            let diagnostic;
            for (diagnostic of vscode.languages.getDiagnostics(uriToDecorate)) {
                let key = "line" + diagnostic.range.start.line;
                if (aggregatedDiagnostics[key]) {
                    aggregatedDiagnostics[key].arrayDiagnostics.push(diagnostic);
                }
                else {
                    aggregatedDiagnostics[key] = {
                        line: diagnostic.range.start.line,
                        arrayDiagnostics: [diagnostic],
                    };
                }
                switch (diagnostic.severity) {
                    case vscode.DiagnosticSeverity.Error:
                        numErrors += 1;
                        break;
                    case vscode.DiagnosticSeverity.Warning:
                        numWarnings += 1;
                        break;
                }
            }
        }
    }
}
exports.activate = activate;
class CustomSidebarViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this.getHtmlContent0(webviewView.webview);
        setInterval(() => {
            let errors = getNumErrors();
            if (errors === 0) {
                webviewView.webview.html = this.getHtmlContent0(webviewView.webview);
            }
            else if (errors < 5) {
                webviewView.webview.html = this.getHtmlContent1(webviewView.webview);
            }
            else if (errors < 10) {
                webviewView.webview.html = this.getHtmlContent2(webviewView.webview);
            }
            else {
                webviewView.webview.html = this.getHtmlContent3(webviewView.webview);
            }
        }, 1000);
    }
    getHtmlContent0(webview) {
        const face0 = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "incredible0.png"));
        return getHtml(face0);
    }
    getHtmlContent1(webview) {
        const face1 = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "incredible1.png"));
        return getHtml(face1);
    }
    getHtmlContent2(webview) {
        const face2 = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "incredible2.png"));
        return getHtml(face2);
    }
    getHtmlContent3(webview) {
        const face3 = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "assets", "incredible3.png"));
        return getHtml(face3);
    }
}
CustomSidebarViewProvider.viewType = "in-your-face.openview";
function getHtml(doomFace) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    </head>
    <body>
    <section class="wrapper">
      <img class="doomFaces" src="${doomFace}" alt="">
      <h1 id="errorNum">${getNumErrors() + " errors"}</h1>
    </section>
    </body>
    </html>
  `;
}
function getNumErrors() {
    const activeTextEditor = vscode.window.activeTextEditor;
    if (!activeTextEditor) {
        return 0;
    }
    const document = activeTextEditor.document;
    let numErrors = 0;
    for (const diagnostic of vscode.languages.getDiagnostics(document.uri)) {
        if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
            numErrors += 1;
        }
    }
    return numErrors;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map