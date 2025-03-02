let canvasize=100*100*3
let bitcanva=Math.ceil(Math.log2(canvasize))

const fs = require("fs");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});


// Add this plugin to handle raw body
fastify.addContentTypeParser(
  "application/octet-stream",
  function (request, payload, done) {
    const chunks = [];
    payload.on("data", (chunk) => {
      chunks.push(chunk);
    });
    payload.on("end", () => {
      const body = Buffer.concat(chunks);
      done(null, body);
    });
  }
);

// let a=new Uint8Array(10)
// writeNBits(a,0,16,5050)
// console.log(a)
// console.log(readNBits(a,0,16))


function readNBits(uint8Array, bitOffset, n) {
  const byteOffset = Math.floor(bitOffset / 8);
  const bitStart = bitOffset % 8;
  const dataView = new DataView(uint8Array.buffer);

  let value = 0;
  for (let i = 0; i < n; i++) {
    const byteIndex = byteOffset + Math.floor((bitStart + i) / 8);
    const bitIndex = (bitStart + i) % 8;
    const bit = (dataView.getUint8(byteIndex) >> bitIndex) & 1;
    value |= bit << i;
  }

  return value;
}
function writeNBits(uint8Array, bitOffset, n, value) {
  const byteOffset = Math.floor(bitOffset / 8);
  const bitStart = bitOffset % 8;
  const dataView = new DataView(uint8Array.buffer);

  for (let i = 0; i < n; i++) {
    const byteIndex = byteOffset + Math.floor((bitStart + i) / 8);
    const bitIndex = (bitStart + i) % 8;
    const bit = (value >> i) & 1;
    const currentByte = dataView.getUint8(byteIndex);
    dataView.setUint8(
      byteIndex,
      (currentByte & ~(1 << bitIndex)) | (bit << bitIndex)
    );
  }
}



async function save(){
  fs.writeFile("canvas", canvas, function(err) {
    if(err) {
      console.log(err);
      return err
    }
    return true
  });
}

let canvas = fs.readFileSync("canvas"); //(new TextDecoder()).decode()

fastify.get("/", function (req, res) {
  console.log("==========get/==========");
  console.log("query:", req.headers["x-forwarded-for"]);
  const bufferIndexHtml = fs.readFileSync("index.html");
  res.type("text/html").send(bufferIndexHtml);
});



fastify.get("/canvas", function (req, res) {
  console.log("==========get/canvas==========");
  console.log("query:", req.headers["x-forwarded-for"]);
  res.type("application/octet-stream").send(canvas);
});

fastify.post("/canvas", function (req, res) {
  let b=new Uint8Array(req.body)
  console.log("==========post/canvas==========");
  
  console.log(b)
  console.log(bitcanva)

  let a=readNBits(b,0,bitcanva)*3
  console.log(a)
  
  console.log(b.length)
  
  canvas[a]=readNBits(b,bitcanva,8)
  canvas[a+1]=readNBits(b,bitcanva+8,8)
  canvas[a+2]=readNBits(b,bitcanva+16,8)
  save().then(a=>res.send(a))
});



fastify.post("/post", function (req, res) {
  console.log("==========post/post==========");
  console.log("query:", req.body);
  canvas = req.body;
  save().then(a=>res.send(a))
});

// Run the server and report out to the logs
fastify.listen(
  { port: 3000, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);



//

fastify.get("/wsa", function (req, res) {
  console.log("==========get/ws==========");
  console.log("query:", req.headers["x-forwarded-for"]);
  const bufferIndexHtml = fs.readFileSync("ws.html");
  res.type("text/html").send(bufferIndexHtml);
});
