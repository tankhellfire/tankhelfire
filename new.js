((a,b,c=a.pathname.split('/').pop())=>c.includes('.')||(a.pathname+=c?'/'+b:b))(window.location,'index.html')
clog=console.log
navigator.serviceWorker.register('/sw.js',{scope:'/'})
