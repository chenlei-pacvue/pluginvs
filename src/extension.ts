// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readConfigFile, getConfigByKey, getLangJson } from './config';
import { getWebviewContent, getWebviewExport } from './webview/webview';
import { addi18n } from './i18n/I18nCommon';
import {FileClass} from './util/FileClass';
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
	let MapforValue: any = {};
	for (let key in langmap) {
		MapforValue[langmap[key]] = key;
	}
	console.log('Congratulations, your extension "pacvueextension" is now active!!');
	vscode.languages.registerHoverProvider(['javascript', 'vue'], {
		provideHover(doc: vscode.TextDocument, position: Position) {
			// console.log(window.activeTextEditor?.selections[0]);
			let text = window.activeTextEditor?.selections[0];
			if (text) {
				let range = new Range(text.start, text.end)
				let wenan = window.activeTextEditor?.document.getText(new Range(text.start, text.end))
				if (!MapforValue[wenan]) return;
				const params = encodeURIComponent(JSON.stringify({ range: range, text: MapforValue[wenan] }))
				let details = `发现可以替换的文案：[${MapforValue[wenan]}](command:pacvueextension.replace?${params})`
				const markdown = new MarkdownString(details, true);
				markdown.supportHtml = true;
				markdown.isTrusted = true;
				return new vscode.Hover(markdown);
			}
		}
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
					case 'export':
						
						console.log(message)
						// vscode.window.showErrorMessage(message.text);
						try {
							let ff = new FileClass(message.text.file, message.text.outFile, 'B')
							ff.checkSheet([message.text.sheetname], ["C", "D"])
							vscode.window.showInformationMessage('导出完成');
						} catch (error) {
							console.log(error)
						}
						return;
					case 'selectfile':
						window.showOpenDialog({canSelectFolders: true, canSelectFiles: false}).then(iten=> {
						
							panel.webview.postMessage({ command: 'refactor', text: iten[0].path});
						})
						break;
				}
			},
			undefined,
			context.subscriptions
		);
		panel.webview.html = getWebviewExport()


	});
	let exportExcel = vscode.commands.registerCommand('pacvueextension.exportExcel', (x) => {
		console.log(x)
	});
	context.subscriptions.push(i18nView);
	context.subscriptions.push(i18nreplace);
	context.subscriptions.push(exportExcel);
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
	addi18n()
}


// this method is called when your extension is deactivated
export function deactivate() { }
