import * as vscode from 'vscode';
var fs = require("fs");
import { tsvFormatRows } from 'd3-dsv';
const compilerSFC = require('@vue/compiler-sfc');
function getPackageJson (fileName, rootwork, workuri) {
  let roots = `${workuri}/${rootwork}`;
  let p1 = fileName.split(roots)[1].split('/')[1];
  let packages = JSON.parse(fs.readFileSync(roots+"/"+p1+'/package.json', 'utf-8'));
  return packages.name;
}
function regKey(keyArr,code) {
  keyArr.join('|');
  let reg = new RegExp(`^(${keyArr.join('|')})[0-9]*[0-9]$`,'g');
  let reg1 = new RegExp(`(${keyArr.join('|')})[0-9]*[0-9]`,'g');
  let match = code.match(reg1);
  return {test:reg.test(code), macths: match};
 }
function codeReplace(list) {
  let map = new Map();
  let editArr = [];

  list.forEach(item => {
    let arr = map.get(item.pathroot) || [];
    arr.push(item);
    map.set(item.pathroot, arr);
  });
  let mainArr =[];
  try {
    let folders = fs.readdirSync(vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork);
    folders.forEach(item => {
      let packages = JSON.parse(fs.readFileSync(vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork+"/"+item+'/package.json', 'utf-8'));
      mainArr.push(packages.name);
    });
  } catch (error) {
      // console.log("读取根文件夹报错 可能出现了空的文件夹");
  }
  map.forEach((item,key) => {
    let packageName = getPackageJson(key, config.rootwork, vscode.workspace.workspaceFolders[0].uri.path);
    let maps = {};
    let isInclude = mainArr.some(item => {
      if(MapforValue[packageName]) {
        maps = MapforValue[item];
        return true;
      }
    });
    if (!isInclude) {
      maps = MapforValue.AllIn;
    }
    const edit = new vscode.WorkspaceEdit();
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
  fs.writeFileSync(path, content);
 }
export {getPackageJson, regKey, codeReplace,exporttsv};