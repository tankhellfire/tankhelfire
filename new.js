if(typeof __dirname=='undefined')__dirname='https://tankhellfire.github.io/tankhelfire/'
((a,b,c=a.pathname.split('/').pop())=>c.includes('.')||(a.pathname+=c?'/'+b:b))(window.location,'index.html')
clog=console.log
navigator.serviceWorker.register(`${__dirname}sw.js`,{scope:__dirname})
