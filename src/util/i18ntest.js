const en = require('../assets/en');

const keys = Object.keys(en);
let result = {};
keys.forEach(item => {
  // console.log(typeof result[String(en[item])],item);
  if (result[String(en[item]).toLowerCase()] !== undefined) {
    result[String(en[item]).toLowerCase()].push(item);
  } else {
    result[String(en[item]).toLowerCase()]=[item];
  }
  // result[String(en[item])] = result[String(en[item])] !== undefined ? result[String(en[item])].push(item) : [item];
  result[String(en[item])] === 2 ? console.log(result[String(en[item])], item):'';
});
// console.log(result);
function filterObject(obj) {
  const filteredObj = {};

  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value) && value.length > 2) {
      filteredObj[key] = value;
    }
  }

  return filteredObj;
}
console.log(filterObject(result));