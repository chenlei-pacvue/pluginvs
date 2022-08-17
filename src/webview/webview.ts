import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "./getUri";
export const getWebviewContent = function(webview: Webview, extensionUri: Uri) {
  const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.css"]);
  // The JS file from the Vue build output
  const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "tools.js"]);
  const iconhref = getUri(webview, extensionUri, ['node_modules', '@vscode/codicons', 'dist', 'codicon.css']);
return  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="${stylesUri}">
    <link rel="stylesheet" type="text/css" href="${iconhref}">
    <title>国际化工具</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" crossorigin src="${scriptUri}"></script>
  </body>
</html>
`;
};
export const getWebviewContent1 = function() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title></title>
  </head>
  <style>
  .btn {
	align-self: center;
	margin-top: 10px;
	max-width: 300px;
	width: 100%;
    background-color: cornflowerblue;
	padding: 12px;
	border-radius:4px;
	cursor: pointer;
    width:100px;
    text-align:center
	
}

  </style>
  <body style='padding-top:20px'>
  <div class='btn' data-action="pacvueextension.show18Tool">国际化工具页面</div>
  <div class='btn' data-action="pacvueextension.showCreate">创建工程</div>
  <script>
        (function() {
            const vscode = acquireVsCodeApi();
			document.addEventListener('click',function(e) {
				if (e.target.matches('[data-action]')) {
					vscode.postMessage({
						command: 'alert',
						text:e.target.dataset.action
					})
				}
			})
            
        }())
    </script>

  </body>

  </html>`;
};
export const getWebviewExport = function(webview: Webview, extensionUri: Uri) {

  const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.js"]);
    const iconhref = getUri(webview, extensionUri, ['node_modules', '@vscode/codicons', 'dist', 'codicon.css']);
  return  `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" type="text/css" href="${stylesUri}">
      <link rel="stylesheet" type="text/css" href="${iconhref}">
      <title>国际化工具</title>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" crossorigin src="${scriptUri}"></script>
    </body>
  </html>
`;
};


export const getWebviewCreatePanel = function(webview: Webview, extensionUri: Uri) {

  const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "createTemplate.js"]);
    const iconhref = getUri(webview, extensionUri, ['node_modules', '@vscode/codicons', 'dist', 'codicon.css']);
  return  `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" type="text/css" href="${stylesUri}">
      <link rel="stylesheet" type="text/css" href="${iconhref}">
      <title>国际化工具</title>
    </head>
    <body>
      <div id="app"></div>
      <script type="module" crossorigin src="${scriptUri}"></script>
    </body>
  </html>
`;
};
