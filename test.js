// function regKey(keyArr,code) {
//   let reg = /\((.+?|\n)*\)/gi;
//   let x = `(
//     "1.The scheduler will always work on the campaign (including enabled and paused), unless it is removed from the scheduler or the scheduler is closed."
//   )`; 

//   return x.match(reg);
//  }

//  console.log(regKey(['event','ai'],'event100'));

const str = `<div>
2wqeqwe</div>`;
const res = str.match(/`(.*?)`/)[1];
console.log(res);