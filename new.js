

navigator.serviceWorker.register('/sw.js', { scope: '/' })
let end=window.location.pathname.split('/').pop()
if(end){if(!end.includes('.')){window.location.pathname+='/index.html'}}else{window.location.pathname+='index.html'}