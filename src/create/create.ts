import download = require("download-git-repo");
const log = require('single-line-log').stdout;
import fs = require('fs-extra');
import * as vscode from 'vscode';
class ProgressLog {
    timeSc: any;
    num: number;
    constructor() {
        this.timeSc = setInterval(() => {
            this.render();
        }, 200);
        this.num = 1;
    }
    drawLine(num) {
        const out = num % 3;
        let line = '-';
        switch (out) {
            case 0:
                line = '-';
                break;
            case 1:
                line = '\\';
                break;
            case 2:
                line = '/';
                break;
            default:
                line = '-';
        }
        return line;
    }
    render() {
        this.num++;
        log(this.drawLine(this.num) + '正在下载远程项目');
    }
    destroyTime() {
        clearInterval(this.timeSc);
    }
}

export const createProject = async function (path: String,name: string): Promise<void> {
  // const progressLog = new ProgressLog();
  vscode.window.showInformationMessage('开始远程clone项目');
  fs.ensureDirSync(path +'/'+name);
  try {
    await new Promise((resolve) => {
      download(
        "direct:http://git.jirapac.tech:7990/scm/qiankun-rule/web.git#main",
         `${path}/` + name,
        { clone: true },
        function (err) {
          if (err) {
            console.log(err);
            // console.log('\x1B[31m%s\x1B[0m', err);
            vscode.window.showErrorMessage(err);
          } else {
            resolve(true);
            vscode.window.showInformationMessage('clone项目完成 准备配置');
          }
        }
      );
    });
    
  }catch (err) {
    console.error(err);
    vscode.window.showErrorMessage(err);
  }
  // progressLog.destroyTime();
  try {
    vscode.window.showInformationMessage('正在配置相关环境');
    // await fs.remove(process.cwd() + `/${name}/.git`)
    const packageObj = fs.readJsonSync(path + '/'+name+'/package.json');
    packageObj.name = name;

    fs.writeJsonSync(path + '/'+name+'/package.json', packageObj, {
      spaces:'\t'
    });
    const developStr = fs.readFileSync(path + '/'+name+'/.env.development','utf-8');
    developStr.replace(/demo/g, name);
    fs.writeFileSync(path + '/'+name+'/.env.development',developStr,'utf-8');
    const productionStr = fs.readFileSync(path + '/'+name+'/.env.production','utf-8');
    productionStr.replace(/demo/g, name);
    fs.writeFileSync(path + '/'+name+'/.env.production',productionStr,'utf-8');
    const viteHtmlStr = fs.readFileSync(path + '/'+name+'/index.html','utf-8');
    viteHtmlStr.replace(/demo/g, name);
    fs.writeFileSync(path + '/'+name+'/index.html',viteHtmlStr,'utf-8');
    const vueHtmlStr = fs.readFileSync(path + '/'+name+'/public/index.html','utf-8');
    vueHtmlStr.replace(/demo/g, name);
    fs.writeFileSync(path + '/'+name+'/public/index.html',vueHtmlStr,'utf-8');
    vscode.window.showInformationMessage('配置相关环境完成');
  } catch (err) {
    console.log('\x1B[31m%s\x1B[0m', err);
  }
};
    

