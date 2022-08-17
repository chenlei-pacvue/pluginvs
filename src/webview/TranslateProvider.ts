import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as globby from 'globby';
import { parse } from '@babel/parser';
const compilerSFC = require('@vue/compiler-sfc');
import { transform } from '@vue/reactivity-transform';
import {regKey} from '../util/utils';
class Position {
  start: number;
  end: number;
  code: string;
  uri: string;
  line: number;
  vsPosStrat: vscode.Position;
  vsPosEnd: vscode.Position;
  constructor(start: number,end: number,code: string,uri: string, vsPosStrat: vscode.Position, vsPosEnd:vscode.Position) {
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
  constructor(private workspaceRoot: string) {

  }
  refresh(): void {
    this._onDidChangeTreeData.fire();
}
  getI18nPositionInHtml(ast,uri,list,descriptor) {
    function bianli(tree,parent?, place?) {
      if (tree?.children?.length>0 ) {
        tree.children.forEach((element,index) => {
          bianli(element,tree, index);
        });
      } else if(tree?.content?.children?.length>0) {
        tree.content.children.forEach((item,index)=> {
          bianli(item,tree.content, index);
        });
      }else{
        if (tree.content === '_ctx.$t') {
          const loc = tree.loc;
          let newStr = parent.children[place+1].replace(/'/g, '"');
          let reg = /"(.+?)"/gi;
          let ref = newStr.match(reg);
          let newcode =ref[0].replace(/"/g,'');
          let {test} = regKey(config.reg,newcode);
          if (!test) {
            let pos = new Position(loc.end.offset + 2, loc.end.offset + 2 + newcode.length, newcode, uri, new vscode.Position(loc.end.line-2+descriptor.template.loc.start.line,loc.end.column+1),new vscode.Position(loc.end.line-2+descriptor.template.loc.start.line,loc.end.column+1 + newcode.length));
            list.push(new Dependency(vscode.TreeItemCollapsibleState.None,pos.code,pos.uri,pos));
          }
        }
      }
    }
    bianli(ast);
  }
  enumFolder(pathroot: string) {
    let list:Array<Dependency> = [];
    try{
      let files = globby.globbySync([`${pathroot}/src/**/*.+(vue|js|jsx)`], {expandDirectories:{},gitignore: true,cwd:vscode.workspace.workspaceFolders[0].uri.path});
      files.forEach(item => {
        let s = new compilerSFC.MagicString(fs.readFileSync(item,'utf-8'));
        if (item.endsWith('.vue')){
          let sfc =compilerSFC.parse(fs.readFileSync(item,'utf-8'),{ sourceMap: true });
          if (sfc.descriptor.scriptSetup) {
           
            compilerSFC.walk(compilerSFC.compileScript(sfc.descriptor,{filename:'a.vue'}).scriptSetupAst, {
              enter(node, parent, prop, index) {
                if (node.type === 'Identifier' && node.name === '$t') { 
                  let pos = new Position(parent.arguments[0].start+1, parent.arguments[0].end-1, parent.arguments[0].value,item, new vscode.Position(parent.arguments[0].loc.start.line-2 + sfc.descriptor.scriptSetup.loc.start.line,parent.arguments[0].loc.start.column+1),new vscode.Position(parent.arguments[0].loc.end.line-2+ sfc.descriptor.scriptSetup.loc.start.line,parent.arguments[0].loc.end.column-1));
                  let {test} = regKey(config.reg,pos.code);
                  if (!test) {
                    list.push(new Dependency(vscode.TreeItemCollapsibleState.None,pos.code,pos.uri,pos));
                  }

                }     
              },
            });
          }
          if (sfc.descriptor.script) {
            compilerSFC.walk(compilerSFC.compileScript(sfc.descriptor,{filename:'a.vue'}).scriptAst, {
              enter(node, parent, prop, index) {
                if (node.type === 'Identifier' && node.name === '$t') {
                 let pos = new Position(parent.arguments[0].start+1, parent.arguments[0].end-1, parent.arguments[0].value,item, new vscode.Position(parent.arguments[0].loc.start.line-2+ sfc.descriptor.script.loc.start.line,parent.arguments[0].loc.start.column+1),new vscode.Position(parent.arguments[0].loc.end.line-2+ sfc.descriptor.script.loc.start.line,parent.arguments[0].loc.end.column-1));
                  let {test} = regKey(config.reg,pos.code);
                  if (!test) {
                    list.push(new Dependency(vscode.TreeItemCollapsibleState.None,pos.code,pos.uri,pos));
                  }
                }     
              },
            });
          }
          if (sfc.descriptor.template) {
            let comppileData = compilerSFC.compileTemplate(sfc.descriptor);
            if (comppileData.code.indexOf('$t')!==-1) {
              this.getI18nPositionInHtml(comppileData.ast,item, list,sfc.descriptor);
            }
           
          }
          
        }
        if (item.endsWith('.js') || item.endsWith('.jsx')||item.endsWith('.ts') || item.endsWith('.tsx')){
          const ast = parse(fs.readFileSync(item,'utf-8'),{ sourceType: 'module',plugins:['jsx','typescript'] });
          compilerSFC.walk(ast, {
            enter(node, parent, prop, index) {
              if (node.type === 'Identifier' && node.name === '$t' && parent.arguments) {
                let pos = new Position(parent.arguments[0].start+1, parent.arguments[0].end-1, parent.arguments[0].value,item, new vscode.Position(parent.arguments[0].loc.start.line-1,parent.arguments[0].loc.start.column+1),new vscode.Position(parent.arguments[0].loc.end.line-1,parent.arguments[0].loc.end.column-1));
                
                let {test} = regKey(config.reg,pos.code);
                if (!test) {
                  list.push(new Dependency(vscode.TreeItemCollapsibleState.None,pos.code,pos.uri,pos));
                }
               
              }     
            },
          });
        }

      });
    } catch (err){
      console.log(err);
    }
    return list;
  }
  getChildren(element?: Dependency): Thenable<Dependency[]>{
   if (element){
    // 遍历项目下的所有文件 查找所有没有被替换的国际化文案
    return new Promise(resolve=> {
      resolve(this.enumFolder(element.pathroot));
    });
   }else {
    // 遍历文件夹 找到项目名称
    let folders = fs.readdirSync(vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork);
    let dependencyList: Array<Dependency> = [];
    folders.forEach((item)=> {
      if (fs.existsSync(vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork+"/"+item+'/package.json')) {

        let packages = JSON.parse(fs.readFileSync(vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork+"/"+item+'/package.json', 'utf-8'));
        dependencyList.push(new Dependency(vscode.TreeItemCollapsibleState.Collapsed, packages.name,  vscode.workspace.workspaceFolders[0].uri.path+'/' + config.rootwork+"/"+item));
      }
    });
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
    public readonly position?: Position
  ) {
    super(label, collapsibleState);
    this.label = `${label}`;
    this.position = position;
    this.pathroot =pathroot;
    this.command = {
      title: this.label,
      command: 'pacvueextension.click',
      arguments: [
        this.label,
        this.position,
        this.pathroot
      ]
    };
    
    if (this.position) {
      this.contextValue = 'dependencyItem';
    }
  }
  
  contextValue = 'dependency';

}