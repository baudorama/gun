;(function(){
	const port = process.env.PORT || 8765;
	var cluster = require('cluster');
	if(cluster.isMaster){
	  return cluster.fork() && cluster.on('exit',function(){ cluster.fork(); require('../lib/crashed') });
	}

	var fs = require('fs'), env = process.env;
	var GUN = require('gun'); // require('gun');
	var opt = {
		port: env.PORT || process.argv[2] || port,
		peers: env.PEERS && env.PEERS.split(',') || []
	};

	if(fs.existsSync((opt.home = require('os').homedir())+'/cert.pem')){
		env.HTTPS_KEY = env.HTTPS_KEY || opt.home+'/key.pem';
		env.HTTPS_CERT = env.HTTPS_CERT || opt.home+'/cert.pem';
	}
	if(env.HTTPS_KEY){
		opt.port = 443;
		opt.key = fs.readFileSync(env.HTTPS_KEY);
		opt.cert = fs.readFileSync(env.HTTPS_CERT);
		opt.server = require('https').createServer(opt, GUN.serve(__dirname));
		require('http').createServer(function(req, res){
			res.writeHead(301, {"Location": "https://"+req.headers['host']+req.url });
			res.end();
		}).listen(80);
	} else {
		opt.server = require('http').createServer(GUN.serve(__dirname));
	}

	var gun = GUN({web: opt.server.listen(opt.port), peers: opt.peers});
	console.log('Relay peer started on port ' + opt.port + ' with /gun');
	module.exports = gun;
}());
