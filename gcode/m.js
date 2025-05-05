E=Math.pow(.4/2,2)/Math.pow(1.75/2,2)
out=''
let [x,y,z,rx,ry,rz,extrude]=[]
setup=e=>{
  [rx,ry,rz]=[x,y,z]=[220,0,5]
  extrude=0
  out=`;home before use, cal for z0 to b layer1
G92 E0
M420 S0
G90
G1 X220 Y0 Z5 F3000
M140 S45
M109 S210
M190 S45
M106 S255

G1 F1500
`
}
move=(e=E)=>{
  out+='G1'
  let d=Math.sqrt(Math.pow(x-rx,2)+Math.pow(y-ry,2)+Math.pow(z-rz,2))
  if(d*e)out+=` E${(extrude+=d*e).toFixed(3)}`
  if(x!=rx)out+=` X${rx=x}`
  if(y!=ry)out+=` Y${ry=y}`
  if(z!=rz)out+=` Z${rz=z}`
  out+='\n'
}
end=e=>console.log(out+=`
G91
G1 Z5 F3000
G90
M107`)
setup();

x=100
y=100
z=0
move(0);
((count,m)=>{
  let i
  for(i=0;i<count;i++){
    let dirM0=(i%2==0)*2-1
    x+=(m[0].x??0)*dirM0
    y+=(m[0].y??0)*dirM0
    z+=(m[0].z??0)*dirM0
    move()
    x+=m[1].x??0
    y+=m[1].y??0
    z+=m[1].z??0
    move()
  }
  let dirM0=(i%2==0)*2-1
  x+=(m[0].x??0)*dirM0
  y+=(m[0].y??0)*dirM0
  z+=(m[0].z??0)*dirM0
  move()
})(5,[{x:10},{y:2}])

end()