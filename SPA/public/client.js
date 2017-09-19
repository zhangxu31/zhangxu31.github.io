$(document).ready(function() {
	$.ajax({
		type : "POST",
		url : "getUser",
		async : false,
		dataType : "json",
		success : function(data) {
			user = data.user;
			accountNumber = data.accountNumber;
			if (user.name == "Sissi") {
				$("#nextRound").show();
			}
		}
	});

	getCurrentList();

	$(".pointBtn").click(function() {
		var point = $(this).val();
		$("#point").val(point);
	});

	$("#nextRound").click(function() {
		socket.emit("nextRound");
	})

	$("#submit").click(function() {
		var point = $("#point").val();
		if (point == "" || isNaN(point)) {
			alert("Please input a number.");
			return;
		}
		user.point = point;
		socket.emit("point", {
			user : user
		});
	});
});
var user;
var accountNumber;
var userList;
var result;

function getCurrentList() {
	$.ajax({
		type : "POST",
		url : "getCurrentList",
		async : false,
		dataType : "json",
		success : function(data) {
			userList = data.userList;
			initSeats();
			if (accountNumber == userList.length) {
				$("#nextRound").removeAttr("disabled");
			}
		}
	});
}

function initSeats(flag) {
	for (var i = 0; i < 8; i++) {
		$("#area" + i).empty();
	}
	var htmlStr = '<div class="user"><table><tr><td><img class="ballImg" src="static/img/pokeball.png" />'
			+ '<div class="ballName"></div></td><td></td></tr></table></div>';
	for (var i = 0; i < accountNumber; i++) {
		var pos = i % 8;
		$("#area" + i).append(htmlStr);
	}

	for (var j = 0; j < userList.length; j++) {
		pos = j % 8;
		if ($("#area" + pos).has('.ballImg')) {
			$("#area" + pos).empty(1000);
			if (j == userList.length - 1) {
				var content = $(getSeatInitHtml(userList[j], flag)).appendTo(
						$("#area" + pos)).hide().fadeIn(200);
				content.animate({
					height : '1%',
					opacity : '0.4'
				}, "fast");
				content.animate({
					height : '100%',
					opacity : '1'
				}, "slow");
			} else {
				$(getSeatInitHtml(userList[j], flag))
						.appendTo($("#area" + pos));
			}
		}
	}
}

function getSeatInitHtml(user, flag) {
	var src = "static/img/" + user.img;
	var eyeButton = '<button type="button" class="btn btn-sm btn-success" style="font-size: 25px; margin-top:25px"><span class="glyphicon glyphicon-eye-open"></span></button>';
	var loadingImg = '<img src="static/img/loading.gif" />';
	var pointContent = '<div class="userPoint" id="userPoint_' + user.name
			+ '">' + ((flag == 1) ? loadingImg : eyeButton) + '</div>';
	if (user.point) {
		pointContent = '<div class="userPoint" id="userPoint_' + user.name
				+ '">' + user.point + '</div>';
	}
	return '<div id="user_' + user.name
			+ '" class="user"><table><tr><td><img id="userImg_' + user.name
			+ '" class="userImg" src="' + src + '" /><div id="userName_'
			+ user.name + '" class="userName">' + user.name + '</div></td><td>'
			+ pointContent + '</td></tr></table></div>';
}

// function appendUser(user) {
// var pos = userList.length;
// if ($("#area" + pos).has('.ballImg')) {
// $("#area" + pos).empty();
// }
// $("#area" + pos).append(getSeatInitHtml(user));
// }

// create connection
var socket = io();
socket.on("connect", function() {
	console.log("Socket connected.");
});

socket.on("newJoin", function(e) {
	var data = JSON.parse(e);
	userList = data.userList;
	if (user.name == data.user.name) {
		user = data.user
	}
	// appendUser(data.user);
	initSeats();
});
socket.on("point", function(e) {
	var user = JSON.parse(e).user;
	$("#userPoint_" + user.name).empty();
	$("<div class='ready'>Ready</div>").appendTo($("#userPoint_" + user.name))
			.fadeIn(1500);
});
socket.on("roundOver", function(e) {
	var result = JSON.parse(e).result;
	userList = JSON.parse(e).userList;
	for ( var i in userList) {
		$("#userPoint_" + userList[i].name).empty();
		var css = "point";
		if (userList[i].point == result.highest) {
			css = "pointH";
		}
		if (userList[i].point == result.lowest) {
			css = "pointL";
		}
		$("<div class='" + css + "'>" + userList[i].point + "</div>").appendTo(
				$("#userPoint_" + userList[i].name)).fadeIn(1500);
	}
	var content = $("<div class='areaX'>" + result.avg.toFixed(1) + "</div>");
	content.appendTo($("#areaX"));
	content.animate({
		fontSize : '30px',
		opacity : '0.4'
	}, "slow");
	content.animate({
		fontSize : '130px',
		fontWeight : 'bold',
		opacity : '0.8'
	}, "slow");
	content.animate({
		fontSize : '120px',
		fontWeight : 'bold',
		opacity : '1'
	}, "fast");
	$("#submit").attr("disabled", "disabled");
	$("#nextRound").removeAttr("disabled");
});
socket.on("nextRound", function(e) {
	var data = JSON.parse(e);
	userList = data.userList;
	result = data.result;
	initSeats(1);
	$("#areaX").empty();
	$("#submit").removeAttr("disabled");
	$("#nextRound").attr("disabled", "disabled");
});
socket.on("full", function() {
	$("#nextRound").removeAttr("disabled");
});
socket.on('disconnect', function(e) {
	// appendLog("Connection closed");
	console.log("Connection closed.");
});

function disconnect() {
	ws.close();
}
