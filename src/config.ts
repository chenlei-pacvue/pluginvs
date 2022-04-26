import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export const readConfigFile = function () {

    let pacvueConfigJson = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/pacvue.config.json` : '';

    if (!fs.existsSync(pacvueConfigJson)) {
        return null;
    }
    return pacvueConfigJson;
}

export const getConfigByKey = function(): any {
    const configFile = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/pacvue.config.json` : '';
    let content = '';
  
    try {
      if (fs.existsSync(configFile)) {
        content = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }
    } catch (error) {
      console.log(error);
    }
    return content;
  };

  export const getLangJson = function(fileName: string) {
   
    const fileContent = fs.readFileSync(fileName, { encoding: 'utf8' });
    // module.exports = /export\s*default\s*({[\s\S]+);?$/
    // let obj = fileContent.replace('module.exports = ', '');
   let  obj = fileContent.replace('module.exports', '');
   obj = obj.replace('=', '}');
    obj = obj.replace('};', '}');
    let jsObj = {};
    try {
      jsObj = eval(fileContent);
    } catch (err) {
      console.log(obj);
      console.error(err);
    }
    return jsObj;
  }