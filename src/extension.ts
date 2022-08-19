// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readConfigFile, getConfigByKey, initI18nData } from './config';
import { getWebviewContent, getWebviewExport, getWebviewCreatePanel } from './webview/webview';
import {TranslateProvider} from './webview/TranslateProvider';
import { addi18n } from './i18n/I18nCommon';
import {FileClass} from './util/FileClass';
import {getPackageJson, codeReplace,exporttsv} from './util/utils';
var fs = require('fs');
import {
	WebviewView,
	WebviewViewResolveContext,
	Position,
	window,
	MarkdownString,
	Range
} from 'vscode';
import {createProject} from './create/create';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let createPanel = vscode.commands.registerCommand('pacvueextension.showCreate', () => {
		const panel = vscode.window.createWebviewPanel(
			'sidebar',
			'createPanel',
			{ viewColumn: vscode.ViewColumn.Beside, preserveFocus: false },
			{
				retainContextWhenHidden: true,
				enableFindWidget: true,
				enableCommandUris: true,
				enableScripts: true,
			},
		);
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'create':
						try {
							createProject(message.text.outPath, message.text.projectName);
						} catch (error) {
						}
						return;
					case 'selectfile':
						window.showOpenDialog({canSelectFolders: true, canSelectFiles: false}).then(iten=> {
						
							panel.webview.postMessage({ command: 'refactor', text: iten[0].fsPath});
						});
						break;
				}
			},
			undefined,
			context.subscriptions
		);
		panel.webview.html = getWebviewCreatePanel(panel.webview, context.extensionUri);
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
		);


		panel.webview.onDidReceiveMessage(
			message => {

				switch (message.command) {
          case 'chooseExcel':
            window.showOpenDialog({canSelectFolders: false, canSelectFiles: true}).then(iten=> {
						
							panel.webview.postMessage({ command: 'i18nfile', text: iten[0].fsPath});
						});
            break;
					case 'export':
						try {
							let ff = new FileClass(message.text.file, message.text.outFile, 'B');
              if (message.text.data.radioChceck === 'sheet') {

                let sheetArr = message.text.data.sheet.split(',');
                ff.checkSheet(sheetArr, ["C", "D"]);
              } else {
                ff.checkAllSheet(["C", "D"]);
              }
							vscode.window.showInformationMessage('导出完成');
              panel.webview.postMessage({ command: 'success'});
						} catch (error) {
							panel.webview.postMessage({ command: 'fail'});
              vscode.window.showErrorMessage(error.stack);
						}
						return;
					case 'selectfile':
						window.showOpenDialog({canSelectFolders: true, canSelectFiles: false}).then(iten=> {
						
							panel.webview.postMessage({ command: 'refactor', text: iten[0].fsPath});
						});
						break;
				}
			},
			undefined,
			context.subscriptions
		);
		panel.webview.html = getWebviewExport(panel.webview, context.extensionUri);


	});
  context.subscriptions.push(createPanel);
	context.subscriptions.push(i18nView);
	var thisProvider = {
		resolveWebviewView: function (thisWebview: WebviewView, contexts: WebviewViewResolveContext) {
			thisWebview.webview.options = { enableScripts: true };
			thisWebview.webview.html = getWebviewContent(thisWebview.webview, context.extensionUri);
			thisWebview.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'alert':
							vscode.commands.executeCommand(message.text);
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
	if (!readConfigFile()) {
		return;
	}
	// todo 增加全局性的文件数据	
	const config = getConfigByKey();
  initI18nData();
	console.log('Congratulations, your extension "pacvueextension" is now active!!');
	vscode.languages.registerHoverProvider(['javascript', 'vue'], {
		provideHover(doc: vscode.TextDocument, position: Position) {
			// console.log(window.activeTextEditor?.selections[0]);
      if (langtype === 'string'){
        let text = window.activeTextEditor?.selections[0];
        if (text) {
          return hoverFun(MapforValue);
        }
      } else {
        let mainArr =[];
        try {
          let folders = fs.readdirSync(vscode.workspace.workspaceFolders[0].uri.fsPath+'/' + config.rootwork);
          folders.forEach(item => {
            let packages = JSON.parse(fs.readFileSync(vscode.workspace.workspaceFolders[0].uri.fsPath+'/' + config.rootwork+"/"+item+'/package.json', 'utf-8'));
            mainArr.push(packages.name);
          });
        } catch (error) {
            console.log("读取根文件夹报错 可能出现了空的文件夹");
        }
        let map = {};
        let isInclude = mainArr.some(item => {
          let packageName = getPackageJson(window.activeTextEditor.document.fileName, config.rootwork, vscode.workspace.workspaceFolders[0].uri.fsPath);
          if(MapforValue[packageName]) {
            map = MapforValue[item];
            return true;
          }
        });
        if (!isInclude) {
          map = MapforValue.AllIn;
        }
      
        return hoverFun(map);
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
			vscode.workspace.applyEdit(edit);
		} catch (error) {
			console.log(error);
		}
	});

	let exportExcel = vscode.commands.registerCommand('pacvueextension.exportExcel', (x) => {
	});

	context.subscriptions.push(i18nreplace);
	context.subscriptions.push(exportExcel);

	
	// context.subscriptions.push(disposables);
  const rootPath =
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
    let translateP = new TranslateProvider(rootPath);
	
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				addi18n(translateP);
			}
		}, null)
	);

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((editor) => {
      let langDistarr = [];
      for (let i in global.langDist) {
        langDistarr.push(global.langDist[i]);
      }
      let include = langDistarr.some(item=> {
        if(editor.uri.path.indexOf(item)!==-1) {return true;};
      });
      if (include) {
        getConfigByKey();
        initI18nData();
      } else if (editor.uri.path.indexOf('pacvue.config.json')!==-1){
        getConfigByKey();
        initI18nData();
      } else {
        addi18n(translateP);
      }
		}, null)
	);
	addi18n(translateP);
 
  let refresh = vscode.commands.registerCommand('pacvueextension.refresh', (x) => {
    translateP.refresh();
    });
  context.subscriptions.push(refresh);
  let itemclick = vscode.commands.registerCommand('pacvueextension.click', (x) => {
  });
context.subscriptions.push(itemclick);
let preview = vscode.commands.registerCommand('pacvueextension.preview', (x) => {
  vscode.workspace.openTextDocument(vscode.Uri.file(x.pathroot)).then(doc=> {
    vscode.window.showTextDocument(doc,{selection:new vscode.Range(new vscode.Position(x.position.vsPosStrat.line,x.position.vsPosStrat.character),new vscode.Position(x.position.vsPosEnd.line,x.position.vsPosEnd.character))} );
  });
});
let replaceAll = vscode.commands.registerCommand('pacvueextension.replaceAll', async (x) => {
  await codeReplace(translateP.enumFolder(x.pathroot));
  await vscode.workspace.saveAll();
  translateP.refresh();
});
context.subscriptions.push(replaceAll);
let exporttsvcontext = vscode.commands.registerCommand('pacvueextension.export', async (x) => {
  await exporttsv(translateP.enumFolder(x.pathroot),x.pathroot+'/'+x.label.replace('/','-'));
  vscode.window.showInformationMessage('导出完成');
});
context.subscriptions.push(exporttsvcontext);
  vscode.window.createTreeView('pacvueextension.pacvue.info', {
    treeDataProvider: translateP
  });
}

function hoverFun(map) {
  let text = window.activeTextEditor?.selections[0];
  if (text) {
    let range = new Range(text.start, text.end);
    let wenan = window.activeTextEditor?.document.getText(new Range(text.start, text.end));
    if (!map[wenan]) {return;}
    const params = encodeURIComponent(JSON.stringify({ range: range, text: map[wenan] }));
    let details = `发现可以替换的文案：[${map[wenan]}](command:pacvueextension.replace?${params})`;
    const markdown = new MarkdownString(details, true);
    markdown.supportHtml = true;
    markdown.isTrusted = true;
    return new vscode.Hover(markdown);
  }
}
// this method is called when your extension is deactivated
export function deactivate() { }
