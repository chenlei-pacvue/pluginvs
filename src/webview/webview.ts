import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import * as vscode from 'vscode';
import { getUri } from "./getUri";
export const getWebviewContent = function(webview: Webview, extensionUri: Uri) {
  const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.css"]);
  // The JS file from the Vue build output
  const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "tools.js"]);
  const iconhref = getUri(webview, extensionUri, ['images','codicon.css']);
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

export const getWebviewExport = function(webview: Webview, extensionUri: Uri) {

  const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.css"]);
    // The JS file from the Vue build output
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "main.js"]);
    const iconhref = getUri(webview, extensionUri, ['images','codicon.css']);
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
    const iconhref = getUri(webview, extensionUri, ['images','codicon.css']);
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
