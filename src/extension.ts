// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readConfigFile, getConfigByKey,getLangJson } from './config';
import { addi18n } from './i18n/I18nCommon'
import {
	WebviewView,
	WebviewViewResolveContext,
	Position,
	window,
	MarkdownString,
	Range
} from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	if (!readConfigFile()) {
		return;
	}
	// todo 增加全局性的文件数据	
	const config = getConfigByKey();
	const useLang = config.useLang;
	const langDist = config.langDist;
	let langFile = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/${langDist}/${useLang}.js` : ''
	const langmap = getLangJson(path.resolve(langFile));
	global.langmap = langmap;
	let MapforValue:any = {};
	for (let key in langmap) {
		MapforValue[langmap[key]] = key;
	}
	console.log('Congratulations, your extension "pacvueextension" is now active!!');
	addi18n()
	vscode.languages.registerHoverProvider(['javascript', 'vue'], {
		provideHover(doc: vscode.TextDocument,position: Position) {
			// console.log(window.activeTextEditor?.selections[0]);
			let text = window.activeTextEditor?.selections[0];
			if (text) {
				let range = new Range(text.start, text.end)
				let wenan = window.activeTextEditor?.document.getText(new Range(text.start, text.end))
				if (!MapforValue[wenan]) return;
				const params = encodeURIComponent(JSON.stringify({ range: range, text: MapforValue[wenan]}))
				let details = `发现可以替换的文案：[${MapforValue[wenan]}](command:pacvueextension.replace?${params})`
				const markdown = new MarkdownString(details, true);
				markdown.supportHtml = true;
				markdown.isTrusted = true;
				return new vscode.Hover(markdown);
			}
		}
	});
	let disposable = vscode.commands.registerCommand('pacvueextension.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from pacvueExtension!!');
	});

	let i18nreplace = vscode.commands.registerCommand('pacvueextension.replace', (x) => {
		const edit = new vscode.WorkspaceEdit();
		edit.replace(
			window.activeTextEditor.document.uri,
			new Range(x.range[0], x.range[1]),
			`$t('${x.text}')`
		  );
		  try {
			vscode.workspace.applyEdit(edit)
		  } catch (error) {
			  console.log(error)
		  }
		 
		vscode.window.showInformationMessage('Hello World from pacvueExtension!!');
	});
	let i18nView = vscode.commands.registerCommand('pacvueextension.show18Tool', () => {
		const panel = vscode.window.createWebviewPanel(
			'sidebar',
			'pacvueTools',
			{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
			{
				retainContextWhenHidden: true,
				enableFindWidget: true,
				enableCommandUris: true,
				enableScripts: true,
			},
		)


		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			undefined,
			context.subscriptions
		);
		panel.webview.html = getWebviewContent()


	});
	
	context.subscriptions.push(i18nView);
	context.subscriptions.push(i18nreplace);
	context.subscriptions.push(disposable);
	// context.subscriptions.push(disposables);
	var thisProvider = {
		resolveWebviewView: function (thisWebview: WebviewView, contexts: WebviewViewResolveContext) {
			thisWebview.webview.options = { enableScripts: true }
			thisWebview.webview.html = getWebviewContent();
			thisWebview.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'alert':
							vscode.commands.executeCommand(message.text)
							return;
					}
				},
				undefined,
				context.subscriptions
			);

		}
	};
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("pacvueextension.pacvue.show", thisProvider)
	);
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
		  if (editor) {
			addi18n();
		  }
		}, null)
	  );

	context.subscriptions.push(
	vscode.workspace.onDidSaveTextDocument(() => {
		addi18n()
	}, null)
	);
}
function getWebviewContent() {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
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
	
}

  </style>
  <body style='padding-top:20px'>
  <div class='btn' data-action="pacvueextension.show18Tool">国际化工具页面1</div>
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
}

// this method is called when your extension is deactivated
export function deactivate() { }
