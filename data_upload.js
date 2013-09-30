// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

var fs = require('fs')
  , filename = process.argv[2];

// Read the file and print its contents.
var fs = require('fs'), 
 mongoose = require('mongoose'),
 filename = process.argv[2]
 dbHostName = process.argv[3] || "localhost",
 dbPort = process.argv[4] || 27017,    
 dbName = port = process.argv[5] || "test";;

//connect to mongodb
mongoose.connect("mongodb://" + dbHostName + ":" + dbPort + "/" + dbName);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	  console.log('Connected to MongoDB');
});
//console.log(db);
var IRSchema = mongoose.Schema({ _id: String, title: String, source: String, date: String, urls: String, content: String });
var IRDoc = mongoose.model('IRDoc', IRSchema );

var stream = fs.createReadStream(filename, {flags: 'r', encoding: 'utf-8'});
var buf = '';
var i=1;
var j=1;

stream.on('data', function(d) {
	buf += d.toString(); // when data is read, stash it in a string buffer
	pump(); // then process the buffer
});

function pump() {
	var pos;
	while ((pos = buf.indexOf('}\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
		if (pos == 0) { // if there's more than one newline in a row, the buffer will now start with a newline
			buf = buf.slice(1); // discard it
			continue; // so that the next iteration will start with data
		}
		processLine(buf.slice(0,pos+1)); // hand off the line
		//console.log(pos+1);
		buf = buf.slice(pos+1); // and slice the processed data off the buffer
	}
}

function processLine(line) { // here's where we do something with a line
	//line=line.trim();
	if (line[line.length-1] == '\r') line=line.substr(0,line.length-1); // discard CR (0x0D)

	if (line.length > 0) { // ignore empty lines
		var obj = JSON.parse(line); // parse the JSON
		//console.log(j++);
		formatJSONObj(obj);		
	}	
}

function formatJSONObj(obj) { // here's where we do something with a line
	obj._id=i++;
	console.log("Document Uploaded, Title: " + obj.title ); // do something with the data here!
	//console.log(JSON.stringify(obj) + '\n\n'); // do something with the data here!
	
	obj.date=formatDate(obj.date, obj.source);
	sample=new IRDoc({ _id: obj._id, title: obj.title, source: obj.source, date: obj.date, urls: obj.urls, content: obj.content});
	//console.log(Object.keys(obj));
	//console.log(sample);

	sample.save( function (err, sample) {  if (err) console.log('Not able to save: ' + err); } )
	//process.exit(code=0);
}

function formatDate(dateStr, type) {
	formatDt="";
	if(type == "CNBC") {
		formatDt = dateStr.split(",")[1];
		formatDt = (formatDt != null) ? formatDt.split("|")[0]: formatDt;
	}
	else if(type == "businessinsider") {
 		formatDt=dateStr.split('T')[0];
	}
	else if(type == "Seeking Alpha") {
		formatDt=dateStr.split(',')[0];
	}		
	return formatDt;
}


//console.log("Data Uploaded Ctrl+C to shutdown");



