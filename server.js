var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mongoose = require('mongoose'),
    port = process.argv[2] || 8080,
    dbHostName = process.argv[3] || "localhost",
	dbPort = process.argv[4] || 27017,
    dbName = port = process.argv[4] || "test";

mongoose.connect("mongodb://" + dbHostName + ":" + dbPort + "/" + dbName);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('mongodb connected')
});

var IRSchema = mongoose.Schema({ _id: String, title: String, source: String, date: String, urls: String, content: String });
var IRDoc = mongoose.model('IRDoc', IRSchema );

http.createServer(function(request, response) {

	var uri = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), uri);

	var contentTypesByExtension = {
	'.html': "text/html",
	'.css':  "text/css",
	'.js':   "text/javascript"
	};
  
	console.log(request.url);
	console.log(url.parse(request.url));
	console.log( url.parse(request.url).query );
	subUrl = url.parse(request.url).query;
	
	if(subUrl != null && subUrl.indexOf("operId=") > -1) {
		query = {};
		skip=0;
		limit=10;
		params = subUrl.split("&");
		for(var i=0; i < params.length; i++) {
			param = params[i].split("=");
			console.log(param[0] +":" + param[1] + ": is empty");
			if(param[1] == "") {
				//console.log(param[0] + "is empty");
				continue;
			}
			if(param[0] == "skip") {
				skip=param[1];
			}
			else if(param[0] == "limit") {
				limit=param[1];
			}
			else if(param[0] != "operId") {
				if(param[0].split("_").length > 1) {
					param[0] = param[0].split("_")[0];
					regex_param = new RegExp(param[1], "i")
					query[param[0]] = regex_param;
				}
				else
					query[param[0]] = param[1];
			}
		}
		console.log(query)
		find('irdocs', query, skip, limit, response);
	}
	else {
		path.exists(filename, function(exists) {
			if(!exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}

			if (fs.statSync(filename).isDirectory()) filename += '/index.html';

			fs.readFile(filename, "binary", function(err, file) {
				if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				return;
			}

			var headers = {};
			var contentType = contentTypesByExtension[path.extname(filename)];
			if (contentType) headers["Content-Type"] = contentType;
			response.writeHead(200, headers);
			response.write(file, "binary");
			response.end();
		});
	});
	}
}).listen(parseInt(port, 10));

//find all documents
function find(collectionName, query, skip, limit, response) {
	console.log("In findAll");
	//defaults = {"skip" : 0, "limit" : 10};
	IRDoc.find(query).skip(skip).limit(limit).exec( function (err, items) {
		if (err) throw err;
		response.writeHead(200, {"Content-Type": "text/json"});
		//console.log(JSON.stringify(items));
		response.write(JSON.stringify(items), "binary");
		response.end();
	})
};



console.log("Web server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");



