import * as vscode from 'vscode';
import {outInput} from './utils.ts';
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require("child_process");

const initPro = (param)=>{

  const config  = JSON.parse(fs.readFileSync(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'metro.config.json'), 'utf-8'));
  const subtree = config.subtree;

  if (subtree) {
    if (param === 'delete') {
      for (let i in subtree) {
        try {
          fs.readdirSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`));
        } catch (err) {
          continue;
        }
        try {
          execSync(`rm -r ${path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`)}`);
          // global.channel.appendLine(`packages/${i} 删除完成`);
          outInput('Info', `packages/${i} 删除完成`);
        } catch (error) {
          execSync(`rmdir /Q /S ${path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`)}`);
          outInput('Info', `packages/${i} 删除完成`);
        }
      }
      // return;
      
      vscode.window.showInformationMessage('删除完成');
    
    }
   
    for (let i in subtree) {
      try {
        fs.statSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`));
      } catch (err) {
        fs.mkdirSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`));
      }
      let pp = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`);
      let fileList = fs.readdirSync(path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `packages/${i}`));
      if (fileList.length === 0) {
        switch (param) {
          // case 'CN':
          //   execSync(`git clone -b ${subtree[i].branch} ${subtree[i].CNgit} ${`./packages/${i}`} --depth=1`);
          //   break;
          // case 'SSH':
          //   execSync(`git clone -b ${subtree[i].branch} ${subtree[i].SSH} ${`./packages/${i}`} --depth=1`);
          //   break;
          // case 'SERVE':
          //   execSync(`git clone -b ${subtree[i].branch} ${subtree[i].git.substring(0, 8) + process.argv[3] + '@' + subtree[i].git.substring(8)} ${`./packages/${i}`} --depth=1`);
          //   break;
          default:
            // const output = execSync(`git clone -b ${subtree[i].branch} ${subtree[i].git} ${`${pp}`} --depth=1`,{ encoding: 'utf-8' });
            console.log(subtree[i].branch, subtree[i].git);
            outInput('Info', `准备执行分支${subtree[i].branch},仓库地址${subtree[i].git}`);
            const gitClone = spawn('git', ['clone','-b', subtree[i].branch, subtree[i].git, pp, '--depth=1']);
            
            gitClone.stdout.on('data', (data) => {
              // global.channel.append(data.toString());
              outInput('Info', data.toString());
          });

          gitClone.stderr.on('data', (data) => {
            
            outInput('Info', data.toString());
          });
           
            break;
        }
      }
      let gitignore = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, `.gitignore`);
      let content = fs.readFileSync(gitignore).toString();
      if (content.indexOf(`packages/${i}`) === -1) {
        fs.appendFileSync(gitignore, `\r\npackages/${i}`);
      }
    }
    outInput('Info', '初始化完成');
    vscode.window.showInformationMessage('初始化项目完成');
  }

};
export  {initPro};


