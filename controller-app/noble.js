var n = require('noble');
var BlendMicro = require('blendmicro');

n.on('discover', (e) => {
  console.log("found: " + e.advertisement.localName);
});

n.on('stateChange', (e) => {
  console.log("stateChange: " + e);
  const bm = new BlendMicro("CHEMION-4A:9A");
});
//n.startScanning();
//console.log("scanning");
