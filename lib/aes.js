const CryptoJS=lib('crypto-js.min.js')

function encrypt(text,key) {
    return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(text,key) {
    return CryptoJS.AES.decrypt(text, key).toString(CryptoJS.enc.Utf8);
}

function makeKey(){
  CryptoJS.lib.WordArray.random(256 / 8).toString()
};

exports = {encrypt,decrypt,makeKey };