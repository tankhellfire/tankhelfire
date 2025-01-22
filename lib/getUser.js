exports=async()=>{
  let ret={}
  // Base font size
  function getBaseFontSize() {
    const testElement = document.createElement("div");
    testElement.style.fontSize = "1rem";
    document.body.appendChild(testElement);
    const fontSize = window.getComputedStyle(testElement).fontSize;
    document.body.removeChild(testElement);
    return fontSize;
  }
  try{
    ret.fontSize = getBaseFontSize();
  }catch(err){ret.fontSize=err}

  // Location based on IP (using an external API)
  try{
    ret.ipData = fetch('https://ipinfo.io/json')
      .then(response => response.json())
      .catch(error => ({ error: "Unable to retrieve location data" }));
  }catch(err){ret.ipData=err}

  try{
    ret.screen=window.screen
  }catch(err){ret.screen=err}

  try{
    ret.mediaDevices=await navigator.mediaDevices.enumerateDevices()
  }catch(err){ret.mediaDevices=err}

  function pass(inp,depth=0) {
    if (typeof inp==='undefined') {return}
    if (typeof inp==='function') {return 'func'}
    if (typeof inp==='object') {
      if(depth<0){
        if(inp==null){return}
        if(Object.keys(inp).length==0){return 'OOR'}
        return inp
      }
      let ret={}
      for (let a in inp){
        ret[a]=pass(inp[a],depth-1)
      }
      if(Object.keys(ret).length==0){return {}}
      return ret
    }
    return inp
  }

 try{
   ret.runTime=Date.now()
 }catch(err){
   ret.runTime=err
 }

  try{
    for (let a of [
      'appCodeName',
      'appName',
      'appVersion',
      'connection',
      'cookieEnabled',
      'deprecatedRunAdAuctionEnforcesKAnonymity',
      'deviceMemory',
      'geolocation',
      'hardwareConcurrency',
      'language',
      'languages',
      'maxTouchPoints',
      'mediaSession',
      'onLine',
      'pdfViewerEnabled',
      'platform',
      'product',
      'productSub',
      'userAgent',
      'userAgentData',
      'vendor',
      'vendorSub',
      'virtualKeyboard',
      'webdriver'
    ]){
      try{
        ret[a]=pass(navigator[a],10)
      }catch(err){ret[a]=err}
    }
  }catch(err){ret.navigator=err}

  try{
    ret.ipData = await ret.ipData
  }catch(err){ret.ipData=err}


  return JSON.parse(JSON.stringify(pass(ret,10)))
}