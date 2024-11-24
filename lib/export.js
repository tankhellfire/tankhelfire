((n,f) => {if("object"==typeof exports){module.exports=exports=f()}else{if("function"==typeof define&&define.amd){define([], f)}else{this[n] = f()}}})(
'getuser',() => {
  let exports={}
  
  exports.a=3
  
  return exports
});