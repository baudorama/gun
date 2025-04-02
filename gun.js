const port = process.env.PORT || 8765;
var cluster = require("cluster");
if (cluster.isMaster) {
  return (
    cluster.fork() &&
    cluster.on("exit", function () {
      cluster.fork();
      require("../lib/crashed");
    })
  );
}

var fs = require("fs"),
  env = process.env;
var GUN = require("gun"); // require('gun');
var opt = {
  port: env.PORT || process.argv[2] || port,
  peers: (env.PEERS && env.PEERS.split(",")) || [],
};

opt.server = require("http").createServer(GUN.serve(__dirname));

var gun = GUN({ web: opt.server.listen(opt.port), peers: opt.peers });
console.log("Relay peer started on port " + opt.port + " with /gun");
