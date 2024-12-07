( (n, f) => {
  if ("object" == typeof exports) {
    module.exports = exports = f()
  } else if ("function" == typeof define && define.amd) {
    define([], f)
  } else {
    this[n] = f()
  }
}
)('lib', () => {
  return (libNameLocations)=>{
    
    if ("object" == typeof exports) {
      
      return libNameLocations.map((path) => require(path));
      
    } else if ("function" == typeof define && define.amd) {
      // AMD environment: Use `require` from AMD to load modules
      return new Promise((resolve, reject) => {
        require(modulePaths, (...modules) => resolve(modules), reject);
      });
      
    } else {
      this[n] = f()
    }
    
  }
});
