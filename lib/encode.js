function encode(val,ran){
  let out=0n
  let a=typeof ran==="number"?ran:undefined
  for(let i in val) {
    out*=BigInt(a??ran[i]??10)
    out+=BigInt(val[i]??0)
  }
  return out
}
function decode(val,ran){
  val=BigInt(val)
  let out=[]
  if(typeof ran==="number"){
    ran=BigInt(ran)
    do{
      out.push(val%ran)
      val/=ran
    }while(val!=0)
  }else{
    for(let a of ran.reverse()){
      console.log(a)
      a=BigInt(a)
      out.push(val%a)
      val/=a
    }
  }
  return out.reverse()
}

function rdecode(val,ran){//encoding works like a stack, operations are reversed. decode handles this automatically, but rdecode doesn’t (thus is faster).
  val=BigInt(val)
  let out=[]
  if(typeof ran==="number"){
    ran=BigInt(ran)
    do{
      out.push(val%ran)
      val/=ran
    }while(val!=0)
  }else{
    for(let a of ran.reverse()){
      console.log(a)
      a=BigInt(a)
      out.push(val%a)
      val/=a
    }
  }
  return out.reverse()
}

function convert(text,from,to){
  return to.to(from.from(text))
}

class Charset {
  constructor(text,fallback=text[0]) {
    this.setText(text).setFallback(fallback)
  }
  toString(){
    return this._text
  }
  to(num){
    return decode(BigInt(num),this.length).map(l=>this._text[l]).join('')
  }
  from(text){
    return encode(Array.from(text.toString()).map(l=>{
      let a=this._text.indexOf(l)
      if(a==-1)return this._fallback
      return a
    }),this.length)
  }

  setText(withText){
    this._text=withText.toString()
    return this
  }
  setFallback(withFallback){
    this._fallback=this._text.indexOf(withFallback)
    return this
  }

  get text(){
    return this._text
  }
  get fallback(){
    return this._text[this._fallback]
  }
  get length(){
    return this._text.length
  }
}

class Cipher{
  constructor(text,withCharset) {
    if(withCharset.constructor===Charset)return this.setCharset(withCharset).setText(text)
    console.error(`${withCharset} not of class charset`)
  }
  
  setText(withText){
    this._text=withText.toString()
    if(!this._charset)return this
    this._num=this._charset.from(this._text)
    return this
  }
  setCharset(withCharset){
    if(withCharset.constructor!==Charset)console.error(`${withCharset} not of class charset`)
    this._charset=withCharset
    if(this._num)this._text=this._charset.to(this._num)
    this._text
    return this
  }
  setNum(withNum){
    this._num=BigInt(withNum)
    if(!this._charset)return this
    this._text=this._charset.to(this._num)
    return this
  }
  
  toString(){
    return this.text
  }
  get text(){
    return this._text
  }
  get charset(){
    return this._charset
  }
  get num(){
    return this._num
  }
}

let alph=new Charset(' abcdefghijklmnopqrstuvwxyz',' ')
let b95=new Charset(' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',' ')
let chant=new Charset(Array.from(new Set(alph.text+alph.text.toUpperCase()+`&?!.,'"`)).join(''))

if(new Cipher('hello',alph).setCharset(b95).setCharset(alph).text!=='hello')console.error('convert unit text failed')

exports={b95,alph,chant,Cipher,Charset,convert,rdecode,decode,encode}