var accountList = [ {
	name : "Sissi",
	img : "sissi.png",
	onSeat : false,
	point : null
}, {
	name : "Bing",
	img : "bing.png",
	onSeat : false,
	point : null
 }, {
	name : "Hongye",
	img : "hongye.png",
	onSeat : false,
	point : null
}, {
	name : "Lee",
	img : "lee.png",
	onSeat : false,
	point : null
}, {
	name : "Hui",
	img : "hui.png",
	onSeat : false,
	point : null
}, {
	name : "Xingsheng",
	img : "xingsheng.png",
	onSeat : false,
	point : null
}, {
	name : "Zachary",
	img : "zachary.png",
	onSeat : false,
	point : null
}, {
	name : "Lingling",
	img : "lingling.png",
	onSeat : false,
	point : null
} ];
var userList = [];
var result = {
	avg : 0,
	highest : null,
	lowest : null,
	total : 0,
	count : 0
};
var io;

// get full userInfo by userName
var getUserInfo = function(userName) {
	for ( var i in accountList) {
		if (userName == accountList[i].name) {
			return accountList[i];
		}
	}
}
// check whether user is in user list
var isInList = function(userName) {
	for ( var i in userList) {
		if (userName == userList[i].name) {
			return true;
		}
	}
	return false;
}
// when login, use this do authorization
var loginCheck = function(user) {
	return true;
}

var join = function(userName) {
	var user = getUserInfo(userName);
	user.onSeat = true;
	userList.push(user);
	broadcast("newJoin", {
		user : user,
		userList : userList
	});
	if (userList.length == accountList.length) {
		broadcast("full");
	}
}

var broadcast = function(action, param) {
	io.emit(action, JSON.stringify(param));
}

var updateResult = function() {
	result.count = result.total = result.avg = 0;
	result.highest = result.lowest = null;
	for (var i = 0; i < userList.length; i++) {
		var user = userList[i];
		if (user.point) {
			user.point = user.point * 1;
			result.count++;
			result.total += user.point;
			result.highest = (result.highest < user.point) ? user.point
					: result.highest;
			result.lowest = result.lowest === null ? user.point
					: ((result.lowest > user.point) ? user.point
							: result.lowest);
		}
	}
	result.avg = result.total / result.count;
}

exports.accountList = accountList;
exports.userList = userList;

exports.setIO = function(ioIn) {
	io = ioIn;
}
exports.getUserInfo = getUserInfo;
exports.isInList = isInList;
exports.loginCheck = loginCheck;
exports.join = join;
exports.broadcast = broadcast;
exports.nextRound = function() {
	for ( var i in userList) {
		userList[i].point = null;
	}
	result.avg = result.total = result.count = 0;
	result.highest = result.lowest = null;
	broadcast("nextRound", {
		userList : userList,
		result : result
	});
};
exports.point = function(e) {
	var user = e.user;
	for ( var i in userList) {
		if (userList[i].name == user.name) {
			userList[i].point = user.point;
			break;
		}
	}
	updateResult();
	console.log(result);
	broadcast("point", {
		user : user,
	});
	if (result.count == accountList.length) {
		broadcast("roundOver", {
			result : result,
			userList : userList
		});
	}
}