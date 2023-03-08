// @ts-nocheck
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as globby from 'globby';
import { parse } from '@babel/parser';
const compilerSFC = require('@vue/compiler-sfc');
import { transform } from '@vue/reactivity-transform';
import { regKey } from '../util/utils';
import MagicString from 'magic-string';
const getText = function (uri, start, end) {
  // console.log(uri);
  const s = new MagicString(fs.readFileSync(uri));

  return s.toString().substring(start + 1, end - 1);
  // s.toString().substring(start,end)
};
class Position {
  start: number;
  end: number;
  code: string;
  uri: string;
  line: number;
  vsPosStrat: vscode.Position;
  vsPosEnd: vscode.Position;

  constructor(start: number, end: number, code: string, uri: string, vsPosStrat: vscode.Position, vsPosEnd: vscode.Position) {
    this.start = start;
    this.end = end;
    this.code = code;
    this.uri = uri;
    this.vsPosStrat = vsPosStrat;
    this.vsPosEnd = vsPosEnd;
  }
}
export class TranslateProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;
  public dependencyLists: Array<Dependency>;
  constructor(private workspaceRoot: string) {
  }
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  getI18nText(text,uri) {
    // let reg = /"(.+?)"/gi;
    // let ref = text.replace(/[',`]/g, '"').match(reg);
    // 判断` ' " 这几个符号谁出现在第一个
  
    let code1 = text.indexOf('"') === -1 ? 100000:text.indexOf('"');
    let code2 = text.indexOf("'") === -1 ? 100000:text.indexOf("'");
    let code3 = text.indexOf('`')  === -1? 100000:text.indexOf('`');
    let regT = '';
    if (code1<code2 && code1<code3) {
      regT = '"';
    }
    if (code2<code1 && code2<code3) {
      regT = "'";
    }
    if (code3<code1 && code3<code2 ) {
      regT = '`';
    }
    let textx = '';
    switch (regT) {
      case '"':
        textx = text.match(/"([^"]*)"/)[1];
        break;
      case "'":
        textx = text.match(/'([^']*)'/)[1];
        break;
      case '`':
        textx = text.match(/`([^`]*)`/)[1];
        break;
    }

    // let textx = text.replace(/(^s*)|(s*$)|(^[\r\n])|([\r\n]$)/g, "").substring(1,text.length-1).replace(/(^\s*)|(\s*$)/g, "");
    if (text.length>2) {
      // if(uri&&uri.indexOf('BudgetManager/index')!==-1) {
      //   // console.log(text,11);
      // }
      // if(uri&&uri.indexOf('Binding.vue')!==-1 && textx.indexOf(textx)!==-1) {
      //   // const s = new MagicString(fs.readFileSync(uri)).toString().indexOf(textx.substring(1,textx.length-1));

      //   console.log(textx );
      // }
      // let res =textx.substring(1,textx.length-1);
      let res = textx;
      return res;
    }
    return '';

   
  }
  getI18nPositionInHtml(ast, uri, list, descriptor, inside) {
    
    let ctx = this;

    function bianli(tree, parent?, place?) {
      
      if (tree.props?.length > 0) {
        tree.props.forEach(item => {

          if (item.exp?.children?.length > 0) {
            
            item.exp.children.reduce((pre, cur) => {
              if (pre.content === '_ctx.$t') {
                const loc = pre.loc;
                let curN = '';
                let newcode = '';
// console.log(cur);
               
                // if (cur.indexOf('):')!==-1||cur.indexOf(') :')!==-1){
                //   console.log(11);
                //   curN =cur.replace(/(^s*)|(s*$)|(^[\r\n])/g, "").replace('):', ')');
                //   curN =cur.replace(/(^s*)|(s*$)|(^[\r\n])/g, "").replace(') :', ')');
                //   newcode = ctx.getI18nText(curN,uri);
                // } else {
                //   newcode = ctx.getI18nText(cur,uri);
                // }
                let reg = /\(([^)]*)\)/gi;
                
                // console.log(cur,1);
                // if(cur.match(reg)) {
                //   curN =cur.match(reg)[0];
                //   console.log(curN,1);
                //   newcode = ctx.getI18nText(cur,uri);
                // }
                newcode = ctx.getI18nText(cur,uri);
         
                if(newcode!==''){
             
                  let { test, macths } = regKey(config.reg, newcode, config.equal);
                  if ((!test && !macths && !inside) || (inside && (test || macths)) ) {
                    
                    let pos = new Position(loc.end.offset + 2, loc.end.offset + 2 + newcode.length, newcode, uri, new vscode.Position(loc.end.line -1 , loc.end.column + 1), new vscode.Position(loc.end.line-1  , loc.end.column + 1 + newcode.length));
                    list.push(new Dependency(vscode.TreeItemCollapsibleState.None, pos.code, pos.uri, pos));
                  }
                }
              }
              return cur;
            });
          }
        });
      }
      if (tree?.children?.length > 0) {
        tree.children.forEach((element, index) => {
          bianli(element, tree, index);
        });
      } else if (tree?.content?.children?.length > 0) {
        tree.content.children.forEach((item, index) => {
          bianli(item, tree.content, index);
        });
      } else if (tree?.branches?.length > 0) {
        tree.branches.forEach((item, index) => {
          bianli(item, tree, index);
        });
      } else {
        if (tree.content === '_ctx.$t') {
          
          const loc = tree.loc;
          let newStr = parent.children[place + 1].replace(', [',')');
          
          // let newStr = parent.children[place + 1];
          let newcode ='';
          let curN = '';
          let reg = /\(([^)]*)\)/gi;
          let fulnew = newStr.replace(/[\r\n]/g,'');
         
          // if(fulnew.match(reg)) {
          //   curN =fulnew.match(reg)[0];
            
          //   newcode = ctx.getI18nText(curN,uri);
          // }
          
          newcode = ctx.getI18nText(fulnew,uri);
        
          if(newcode!==''){

            
            let { test, macths } = regKey(config.reg, newcode, config.equal);
            if ((!test && !macths && !inside) || (inside && (test || macths)) ) {
              let pos = null;
              if (parent.children[1]&&parent.children[1].indexOf&&parent.children[1].indexOf('(\n')!==-1) {
                
                let pArr = parent.children[1].split('\n');
                
                let line = 0;
                let col = 0;
                pArr.some((item,index)=> {
                  
                  if(item.indexOf(newcode)!==-1){
                    line=index;
                    col =item.indexOf(newcode);
                    return true;
                  }
                });
                
                pos = new Position(loc.end.offset + 2, loc.end.offset + 2 + newcode.length, newcode, uri, new vscode.Position(loc.end.line -1, col), new vscode.Position(loc.end.line -1, col + newcode.length));
              } else {
                pos = new Position(loc.end.offset + 2, loc.end.offset + 2 + newcode.length, newcode, uri, new vscode.Position(loc.end.line -1, loc.end.column + 1), new vscode.Position(loc.end.line -1, loc.end.column + 1 + newcode.length));
              }
               
              list.push(new Dependency(vscode.TreeItemCollapsibleState.None, pos.code, pos.uri, pos));
            }
          }
        } else if (tree.content) {
          bianli(tree.content);
        }
      }
    }
    bianli(ast);
  }
  enumFolder(pathroot: string, inside?: boolean, document?) {
    let list: Array<Dependency> = [];
    try {
      let files = [];
      if (pathroot.endsWith('.js') || pathroot.endsWith('.vue') || pathroot.endsWith('.jsx') || pathroot.endsWith('.ts') || pathroot.endsWith('.tsx')) {
        files = [pathroot];
      } else if (document?.isDirty || fs.statSync(pathroot).isDirectory()) {
        let pathss = `${path.join(pathroot, '**', "*")}.+(vue|js|jsx)`;
        files = globby.globbySync([pathss.replace(/\\/g, '/')], { expandDirectories: {}, gitignore: true, cwd: vscode.workspace.workspaceFolders[0].uri.fsPath });
      }
      // console.log(files);
      files.forEach(item => {
        try {
          let s = new compilerSFC.MagicString(fs.readFileSync(item, 'utf-8'));
          if (s.toString().indexOf('$t(') == -1) { return; };
          if (item.endsWith('.vue')) {
            let sfc = compilerSFC.parse(fs.readFileSync(item, 'utf-8'), { sourceMap: true });
            if (sfc.descriptor.scriptSetup) {
  
              compilerSFC.walk(compilerSFC.compileScript(sfc.descriptor, { filename: 'a.vue' }).scriptSetupAst, {
                enter(node, parent, prop, index) {
                  
                  if (node.type === 'Identifier' && node.name === '$t' && parent.arguments && parent.arguments[0] && (parent.arguments[0].value||parent.arguments[0].quasis)) {
                  
                    let pos = new Position(parent.arguments[0].start + 1, parent.arguments[0].end - 1, parent.arguments[0].value||parent.arguments[0].quasis[0].value.raw, item, new vscode.Position(parent.arguments[0].loc.start.line - 2 + sfc.descriptor.scriptSetup.loc.start.line, parent.arguments[0].loc.start.column + 1), new vscode.Position(parent.arguments[0].loc.end.line - 2 + sfc.descriptor.scriptSetup.loc.start.line, parent.arguments[0].loc.end.column - 1));
                  
                    let { test,macths } = regKey(config.reg, pos.code || '',config.equal);
                    if ((!test && !macths && !inside) || (inside && (test || macths)) ) {
                      list.push(new Dependency(vscode.TreeItemCollapsibleState.None, pos.code, pos.uri, pos));
                    }
  
                  }
                },
              });
            }
            if (sfc.descriptor.script) {
              compilerSFC.walk(compilerSFC.compileScript(sfc.descriptor, { filename: 'a.vue' }).scriptAst, {
                enter(node, parent, prop, index) {
                  if (node.type === 'Identifier' && node.name === '$t' && parent.arguments) {
                   
                    let pos = new Position(parent.arguments[0].start + 1, parent.arguments[0].end - 1, parent.arguments[0].value||parent.arguments[0].quasis[0].value.raw, item, new vscode.Position(parent.arguments[0].loc.start.line - 2 + sfc.descriptor.script.loc.start.line, parent.arguments[0].loc.start.column + 1), new vscode.Position(parent.arguments[0].loc.end.line - 2 + sfc.descriptor.script.loc.start.line, parent.arguments[0].loc.end.column - 1));
                    if (pos.code !== undefined) {
  
                      let { test,macths } = regKey(config.reg, pos.code,config.equal);
                      if ((!test && !macths && !inside) || (inside && (test || macths)) ) {
                        list.push(new Dependency(vscode.TreeItemCollapsibleState.None, pos.code, pos.uri, pos));
                      }
                    }
                  }
                },
              });
            }
            if (sfc.descriptor.template) {
              let comppileData = compilerSFC.compileTemplate(sfc.descriptor);
              if (comppileData.code.indexOf('$t') !== -1) {
                this.getI18nPositionInHtml(comppileData.ast, item, list, sfc.descriptor, inside);
              }
  
            }
  
          }
          if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
        
            const ast = parse(fs.readFileSync(item, 'utf-8'), { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  
            compilerSFC.walk(ast, {
              enter(node, parent, prop, index) {
                if (node.type === 'Identifier' && node.name === '$t' && parent.arguments) {
  
                  let endvs = new vscode.Position(parent.arguments[0].loc.end.line - 1, parent.arguments[0].loc.end.column - 1);
                  let startvs = new vscode.Position(parent.arguments[0].loc.start.line - 1, parent.arguments[0].loc.start.column + 1);
                  let range = new vscode.Range(startvs, endvs);
  
                  let code = getText(item, parent.arguments[0].start, parent.arguments[0].end);
                  let pos = new Position(parent.arguments[0].start + 1, parent.arguments[0].end - 1, code, item, startvs, endvs);
                  let { test,macths } = regKey(config.reg, pos.code,config.equal);
                
                  if ((!test && !macths && !inside) || (inside && (test || macths)) ) {
                    list.push(new Dependency(vscode.TreeItemCollapsibleState.None, pos.code, pos.uri, pos));
                  }
  
                }
              },
            });
          }
          
        } catch (error) {
          console.log('enumFolder：', item );
        }

      });
    } catch (err) {
      console.log(err);
    }
    return list;
  }
  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (element) {
      // 遍历项目下的所有文件 查找所有没有被替换的国际化文案
      return new Promise(resolve => {
        let list = this.enumFolder(element.pathroot);
        element.setAllNum(list.length);

        resolve(list);
      });
    } else {
      // 遍历文件夹 找到项目名称

      let folders = fs.readdirSync(path.join(vscode.workspace.workspaceFolders[0].uri._fsPath, config.rootwork));
      let dependencyList: Array<Dependency> = [];
      folders.forEach((item) => {
        if (fs.existsSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.rootwork, item, 'package.json'))) {

          let packages = JSON.parse(fs.readFileSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.rootwork, item, 'package.json'), 'utf-8'));
          dependencyList.push(new Dependency(vscode.TreeItemCollapsibleState.Collapsed, packages.name, path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.rootwork, item), null, this.enumFolder(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, config.rootwork, item)).length));
        }
      });
      this.dependencyLists = dependencyList;
      return Promise.resolve(dependencyList);
    }
  }
  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly label: string,
    public readonly pathroot?: string,
    public readonly position?: Position,
    public allNum?: number,
  ) {
    super(label, collapsibleState);
    this.label = `${label}`;
    this.position = position;
    this.pathroot = pathroot;
    this.allNum = allNum;
    if (this.position) {
      this.contextValue = 'dependencyItem';
      this.iconPath = {
        light: path.join(__filename, '..', '..', 'images', 'king.svg'),
        dark: path.join(__filename, '..', '..', 'images', 'king.svg')
      };
    } else {

    }
  }

  contextValue = 'dependency';

  public setAllNum(val) {
    this.allNum = val;
  }

  get description(): string | boolean {
    if (this.contextValue === 'dependency') {
      return `(${this.allNum})`;
    } else {

      return this.pathroot.split(/[\\/]/).pop();
    }

  }

}