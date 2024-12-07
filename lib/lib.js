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
  let self=(libNameLocations)=>{
    self.a=2
    
    if (typeof require === "function") {
      // Node.js environment: Use `require` to load modules
      if(typeof libNameLocations==='string'){
        require(libNameLocations)
      }else{
        return libNameLocations.map((path) => require(path));
      }
    } else if (typeof define === "function" && define.amd) {
      // AMD environment: Use `require` from AMD to load modules
      return new Promise((resolve, reject) => {
        require(libNameLocations, (...modules) => resolve(modules), reject);
      });
    } else {
      // Browser environment: Dynamically load scripts
      const loadScript = (path) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `${path}.js`; // Assume .js extension
          script.onload = () => resolve(window[path.split("/").pop()]);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      if(typeof libNameLocations==='string'){
        loadScript(libNameLocations)
      }else{
        return Promise.all(libNameLocations.map(loadScript));
      }
    }
    
  }
  return self
});
