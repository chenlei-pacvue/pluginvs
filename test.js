function regKey(keyArr,code) {
  keyArr.join('|');
  let reg = new RegExp(`^(${keyArr.join('|')})[0-9]*[0-9]$`,'g');
  let reg1 = new RegExp(`(${keyArr.join('|')})[0-9]*[0-9]`,'g');
  let match = code.match(reg1);
  return {test:reg.test(code), macths: match};
 }
 console.log(regKey(['event','ai'],'event100'));