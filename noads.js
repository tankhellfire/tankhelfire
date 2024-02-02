var scripts = document.head.getElementsByTagName("script");

for (var i = 0; i < scripts.length; i++) {
  var script = scripts[i];

  if (script.src && script.src.startsWith('https://pagead2.googlesyndication.com/')) {

    script.parentNode.removeChild(script);
  }
}
