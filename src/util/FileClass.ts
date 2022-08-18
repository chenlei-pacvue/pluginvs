const XLSX = require("xlsx-style");

var fs = require("fs");
// import { MessageCenter } from "utiltool-pubsub";
// let message = new MessageCenter();
// import { MessageCenter } from "utiltool-pubsub";
// let message = new MessageCenter();
class FileClass {
  repeatkey;
  regValue;
  filetype;
  filename;
  outfilePath;
  keycell;
  workbook;
  worksheet;
  fillObj;
  ExcelProp;
  xName;
  constructor(filename, outfilePath, keycell) {
    this.repeatkey = [];
    this.regValue = "&";
    this.filetype = "js";
    this.filename = filename;
    this.outfilePath = outfilePath;
    this.keycell = keycell;
    this.workbook = XLSX.readFile(filename);
    this.worksheet = null;
    this.fillObj = {}; // 记录所有的属性当前的sheet结束与开始
    this.ExcelProp = []; // [a,1,aa,100]
    this.xName = ""; // 导出的文件名称
  }
  setregValue(v) {
    this.regValue = v;
  }
  setoutPath(v) {
    this.outfilePath = v;
  }
  setkeycell(v) {
    this.keycell = v;
  }
  checkAllSheet(layoutX) {
    this.deleteFile();
    this.repeatkey = [];
    this.workbook.SheetNames.forEach(item => {
      this.worksheet = this.workbook.Sheets[item];
      this.ExcelProp = this.getExcelProp(this.worksheet["!ref"]);
      this.fillObj = this.fillColumKey(this.ExcelProp);
      let layoutXAll = layoutX || this.fillObj.layoutX;
      layoutXAll.forEach(items => {
        this.xName = this.readExcelColumKey(items + 1, item);
        // if (this.xName.indexOf(this.regValue) === -1) return;
        // this.xName = this.xName.split(this.regValue)[0];
        // console.log(items)
        this.readExcelColum(items, item);
      });
    });
    this.writeJs();
  }

  // 正则表达式的方式获取excel的col 以及 row 的关键字
  // [A,开始值Num,结束列名称,一共的行数]
  getExcelProp(beginToEnd) {
    
    let beArr = beginToEnd.split(":");
    let prop = [];
    beArr.forEach(item => {
      let regEn = /[a-zA-Z]+/;
      let regNum = /[1-9][0-9]*/;
      
      prop.push(regEn.exec(item)[0], regNum.exec(item)[0]);
    });
    return prop;
  }

  // 自动填充横坐标（列A～AAB）
  fillColumKey(ExcelProp) {
    let end = ExcelProp[2];
    let fillColum = [];
    let regEn = /[a-zA-Z]+/;
    for (let i in this.worksheet) {
      if (i.indexOf(end) !== -1) {
        fillColum.push(regEn.exec(i)[0]);
        break;
      }

      fillColum.push(regEn.exec(i)[0]);
    }
    fillColum.shift();
    return {
      layoutX: fillColum,
      layoutY: [ExcelProp[1], ExcelProp[3]]
    };
  }
  // 读取某个列的指定数据
  readExcelColumKey(key, sheetName) {
    var worksheet = this.workbook.Sheets[sheetName];
    var desiredCell = worksheet[key];
    return desiredCell ? desiredCell.v : null;
  }
  // 循环某一列的所有数据并且读取
  readExcelColum(key, sheetName) {
    let mapKey = {};
    if (key === this.keycell) {return;}
    for (let i = 2; i < Number(this.fillObj.layoutY[1]) + 1; i++) {
      let value = this.readExcelColumKey(key + i, sheetName);
      let i18key = this.readExcelColumKey(this.keycell + i, sheetName);
      if (value && i18key) {mapKey[i18key] = value;}
    }
    this.appendJson(`${key}1`, mapKey);
  }
  // 写入JSON读取添加
  appendJson(name, dataJson) {
    try {
      let data = fs.readFileSync(
        `${this.outfilePath}/${this.xName}.${this.filetype}`
      );
      let resData = JSON.parse(data);
      // console.log("读取文件成功："+JSON.parse(data))
      // console.log(JSON.stringify(Object.assign(JSON.parse(data),dataJson)))
      // 直接执行默认去重复
      let redArr = Object.keys(resData);
      for (let i in dataJson) {
        if (redArr.includes(i)) {
          // console.log(i);
          if (!this.repeatkey.includes(i)) {
            this.repeatkey.push(i);
          }
        }
      }
      this.writeJson(name, Object.assign(JSON.parse(data), dataJson));
    } catch (err) {
      console.log("读取文件失败：" + err.message);
      this.writeJson(name, dataJson);
    }
  }
  writeJson(name, dataJson) {
    try {
      fs.writeFileSync(
        `${this.outfilePath}/${this.xName}.${this.filetype}`,
        JSON.stringify(dataJson, null, 2),
        "utf8"
      );
    } catch (err) {
      if (err) {throw err;}
    }
    // console.log("done");
  }
  writeJs() {
    try {
      let files = fs.readdirSync(this.outfilePath);
      files.forEach(item => {
        
        if (item.indexOf('.')!==0){
          let data = fs.readFileSync(
            `${this.outfilePath}/${item}`,
          );
          fs.writeFileSync(
            `${this.outfilePath}/${item}`,
            'export default ' + data,
            "utf8"
          );
        }
      });
    
    } catch (err) {
      console.error(err);
      // if (err) {throw err;}
    }
  }
  deleteFile() {
    try {
      let files = fs.readdirSync(this.outfilePath);
      files.forEach(item => {
        
        if (item.indexOf('.')!==0){
          fs.rmSync(
            `${this.outfilePath}/${item}`,
          );
        }
      });
    
    } catch (err) {
      console.error(err);
      // if (err) {throw err;}
    }
  }
  checkSheet(sheetArr, layoutX, keyArr?, keyvalue?, filetype?) {
    if (filetype) {
      this.filetype = filetype;
    }
    this.deleteFile();
    let keyArrs = keyArr ? keyArr.split(",") : this.keycell.split(",");
    keyArrs.forEach(itemkey => {
      this.keycell = itemkey;
      sheetArr.forEach(item => {
        this.worksheet = this.workbook.Sheets[item];
        this.ExcelProp = this.getExcelProp(this.worksheet["!ref"]);
        this.fillObj = this.fillColumKey(this.ExcelProp);
        let layoutXAll = layoutX || this.fillObj.layoutX;
        layoutXAll.forEach(items => {
          this.xName = this.readExcelColumKey(items + 1, item);
          this.readExcelColum(items, item);
          
          
        });
        
      });
     
    });
   this.writeJs();
  }
}
export { FileClass };
// let ff = new FileClass(
//   "/Users/chenlei/Desktop/翻译.xlsx",
//   "/Users/chenlei/Desktop/tt",
//   "B"
// );
// ff.checkSheet(["翻译"], ["C", "D"]);
// ff.checkAllSheet()
