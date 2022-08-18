import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

export const readConfigFile = function () {

    let pacvueConfigJson = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/pacvue.config.json` : '';

    if (!fs.existsSync(pacvueConfigJson)) {
        return null;
    }
    return pacvueConfigJson;
};
export const initI18nData = function() {
  let langmap = {};
  if (langtype === 'string') {
    let langFile = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/${langDist}/${useLang}.js` : '';
    langmap = getLangJson(path.resolve(langFile));
  } else {
    Object.keys(langDist).forEach(item => {
      let langMapCoch = {};
      let langFile = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/${langDist[item]}/${useLang}.js` : '';
      langMapCoch = getLangJson(path.resolve(langFile));
      langmap[item] = langMapCoch;
    });
  }
	global.langmap = langmap;
	let MapforValue:any = {};
  if (langtype === 'string') {
    for (let key in langmap) {
      MapforValue[langmap[key]] = key;
    }
  } else {
    for (let key in langmap) {
      MapforValue[key] = {};
      for (let keyItem in langmap[key]) {
        MapforValue[key][langmap[key][keyItem]] = keyItem;
      }
    }
  }
  global.MapforValue = MapforValue;
};

export const getConfigByKey = function(): any {
    const configFile = vscode.workspace.workspaceFolders ? `${vscode.workspace.workspaceFolders[0].uri.fsPath}/pacvue.config.json` : '';
    let content:any = {};
  
    try {
      if (fs.existsSync(configFile)) {
        content = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }
    } catch (error) {
      console.log(error);
    }
    const useLang = content.useLang;
    const langDist = content.langDist;
    const langtype = typeof langDist;
    global.config= content;
    global.langtype = langtype;
    global.useLang= useLang;
    global.langDist = langDist;
    
    return content;
  };

  export const getLangJson = function(fileName: string) {
   
    const fileContent = fs.readFileSync(fileName, { encoding: 'utf8' });
    // module.exports = /export\s*default\s*({[\s\S]+);?$/
    // let obj = fileContent.replace('module.exports = ', '');
   let  obj = fileContent.replace('module.exports =', 'module.exports = ');
   obj = fileContent.replace('export default ', 'module.exports = ');
  //  obj = obj.replace('=', '}');
  //   obj = obj.replace('};', '}');
    let jsObj = {};
    try {
      jsObj = eval(obj);
    } catch (err) {
      console.log(obj);
      console.error(err);
    }
    return jsObj;
  };