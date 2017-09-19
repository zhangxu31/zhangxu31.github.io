var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var service = require('./public/service');
service.setIO(io);

// set static path, session ...
app.use('/static', express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/node_modules'));
app.use(cookieParser());
app.use(session({
	resave: true, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'chris'
}));
// Login check
app.use(function(req,res,next){
	if (!req.session.userName) {
		if(req.url=="/login"||req.url=="/getAccountList"){
			next();
		} else {
			res.redirect('/login');
		}
	} else if (req.session.userName) {
		next();
	}
});
// Send the accountList
app.post('/getAccountList', function (req, res) {
	res.json({accountList:service.accountList});
});
// default page is login
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});
// login page
app.get('/login',function(req,res){
	res.sendFile(__dirname + '/login.html');
});
// handle login action
app.post('/login',urlencodedParser,function(req,res){
	var userName = req.body.userName;
	console.log("User: " + userName + " login.");
	var result = service.loginCheck(userName);
	if(result===true){
		req.session.userName = userName;
		res.redirect('/main');
	} else {
		res.json({error:result});
	}
});
// handle logout action
app.get('/logout',function(req,res){
	req.session.userName = null;
	res.redirect('/login');
});
// main page
app.get('/main',function(req,res){
	var userName = req.session.userName;
	res.sendFile(__dirname + '/main.html');
	if(service.isInList(userName)){
		// user already login
	}else{
		setTimeout(function(){service.join(userName)},800);
	}
});
app.post('/getUser',function(req, res){
	res.json({user:service.getUserInfo(req.session.userName),accountNumber:service.accountList.length});
});
// get current user list
app.post('/getCurrentList', function (req, res) {
	res.json({userList:service.userList});
});

// websocket on connection
io.on('connection', function(socket) {
	var closeSocket = function(customMessage) {

	};
	socket.on('disconnect', function() {
		closeSocket();
	});
	socket.on('nextRound', function() {
		service.nextRound();
	});
	socket.on('point', function(e) {
		service.point(e);
	});

	process.on('SIGINT', function() {
		console.log("Closing things");
		closeSocket('Server has disconnected');
		process.exit();
	});
});

// start http server
http.listen(3000, function () {
    console.log('listening on *:3000');
});


 