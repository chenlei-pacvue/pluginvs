import * as vscode from 'vscode';
var fs = require("fs");
import * as path from 'path';
import { tsvFormatRows } from 'd3-dsv';
const compilerSFC = require('@vue/compiler-sfc');
function getPackageJson (fileName, rootwork, workuri) {
  let packageName = '';
  try {
    let roots = path.join(workuri,rootwork).replace(/\\/g,'/');
    let p1 = fileName.replace(/\\/g,'/').split(roots)[1].split('/')[1];
    let packages = JSON.parse(fs.readFileSync(path.join(roots,p1,'package.json'), 'utf-8'));
    packageName = packages.name;
  } catch (error) {
    packageName ='';
  }
  return packageName;
}
function regKey(keyArr,code, keyArr2) {
  let reg = new RegExp(`^(${keyArr.join('|')})[0-9]*[0-9]$`,'g');
  // let reg = new RegExp(`^\\b(${keyArr.join('|')})\\b[0-9]*[0-9]$`,'g');
  let reg1 = new RegExp(`^\\b(${keyArr2.join('|')})\\b$`);
  let match = reg1.test(code);
  return {test:reg.test(code), macths: match};
 }
function codeReplace(list) {
  channel.clear();
  let map = new Map();

  let editArr = [];

  list.forEach(item => {
    let arr = map.get(item.pathroot) || [];
    arr.push(item);
    map.set(item.pathroot, arr);
  });
  let mainArr =[];
  try {
    
    let folders = fs.readdirSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,config.rootwork));
  
    folders.forEach(item => {
      if (fs.existsSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,config.rootwork,item,'package.json'))) {

        let packages = JSON.parse(fs.readFileSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,config.rootwork,item,'package.json'), 'utf-8'));
       
        mainArr.push(packages.name);
      }
    });
  } catch (error) {
      console.log("读取根文件夹报错 可能出现了空的文件夹");
  }


  map.forEach((item,key) => {
    let packageName = getPackageJson(key, config.rootwork, vscode.workspace.workspaceFolders[0].uri.fsPath);
    let maps = {};
   
    let isInclude = mainArr.some(item => {
      if(MapforValue[packageName] && item===packageName) {
       
        maps = Object.assign(maps,MapforValue[item]||{});
        return true;
      }
    });
    if (!isInclude) {
      maps = MapforValue.AllIn;
    }
    
    const edit = new vscode.WorkspaceEdit();
    channel.appendLine(key);
    let s = new compilerSFC.MagicString(fs.readFileSync(key,'utf-8'));
    item.forEach(items=> {
     
      if (maps[items.label]) {
        edit.replace(
          vscode.Uri.file(key),
          new vscode.Range(items.position.vsPosStrat, items.position.vsPosEnd),
          maps[items.label]
        );

      }
      // s.overwrite(items.position.start,items.position.end,'sss');
    });
    // new vscode.Position(1);

    editArr.push(edit);
  });

  return Promise.all(editArr.map(item=>{
    return vscode.workspace.applyEdit(item);
  }));
  // 
  // console.log(list);
 }
 function exporttsv(list,path) {
  const content = tsvFormatRows(list.map(item=>[item.label]));
  console.log(list, path);
  fs.writeFileSync(path, content);
 }
export {getPackageJson, regKey, codeReplace,exporttsv};