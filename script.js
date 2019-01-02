var socketUrl,
	endpoint,
	base_endpoint;

if (window.location.host.includes('local')) {
	// socketUrl = 'ws://localhost:3000/cable';
	// endpoint = "http://localhost:3000/api";
	socketUrl = 'wss://dev-api.divercity.io/cable';
	endpoint = "https://dev-api.divercity.io/api";

	base_endpoint = 'http://localhost:5000'
}else{
	socketUrl = 'wss://dev-api.divercity.io/cable';
	endpoint = "https://dev-api.divercity.io/api";
	base_endpoint = 'https://wilforlan.github.io/pinc-chat.github.io'
}

window.search_in_progress = false;
var setUserCredentials = function(params){
	localStorage.setItem('chat_auth_credential', JSON.stringify(params));
	localStorage.setItem('chat_auth_credential_loggedin', true);	
	return true;
}

var getUserCrendentials = function(){
	return JSON.parse(localStorage.getItem('chat_auth_credential'));
}

var setCurrentUser = function(details){
	localStorage.setItem('chat_auth_credential_currentuser', JSON.stringify(details));
	return true;
}

var getCurrentUser = function(details){
	return JSON.parse(localStorage.getItem('chat_auth_credential_currentuser'));
}

var logOut = function(){
	localStorage.setItem('chat_auth_credential_loggedin', false);
	return true;
}

var pullResponseHeaders = function(request){
	var obj = {
		'access-token': request.getResponseHeader('access-token'),
		'client': request.getResponseHeader('client'),
		'uid': request.getResponseHeader('uid')
	}

	return obj;
}

var mandateLogin = function(){
	if (!localStorage.getItem('chat_auth_credential_loggedin')) {
		window.location.replace(base_endpoint+"/login.html");
	}
}

var checkLogin = function(){
	if (localStorage.getItem('chat_auth_credential_loggedin')) {
		window.location.replace(base_endpoint+"/");
	}
}

var loginUser = function(email, password, cb){
	$.ajax({
	    type: "POST",
	    url: endpoint + "/auth/sign_in",
	    dataType: "json",
	    data: { email: email, password: password },
	    success: function(msg, textStatus, request){
	    	setUserCredentials(pullResponseHeaders(request));
	    	setCurrentUser(msg.data)
	        cb(null, msg);
	    },
	    error: function(err){
	    	cb(err, null);
	    }
	});
}

var searchUser = function(text){
	$('#loader').show();
	return $.ajax({
	    type: "GET",
	    url: endpoint + "/users?search_query=" + text,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}

var loadChat = function(){
	console.log('Loading Chat')
	return $.ajax({
	    type: "GET",
	    url: endpoint + `/users/${getCurrentUser().id}/chats`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}

var loadQuestions = function(){
	console.log('Loading Questions')
	return $.ajax({
	    type: "GET",
	    url: endpoint + `/questions?page[size]=2`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}


var initChatID = function(other_user){
	console.log('Init Chat ID')
	return $.ajax({
	    type: "POST",
	    url: endpoint + `/users/${getCurrentUser().id}/chats?other_user=${other_user}`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}

var initChatHistory = function(other_user, chat_id){
	console.log('Fetch Chat History')
	return $.ajax({
	    type: "GET",
	    url: endpoint + `/users/${getCurrentUser().id}/chats/${chat_id}?other_user=${other_user}`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}

var initAnswersHistory = function(question_id){
	console.log('Fetch Question History')
	return $.ajax({
	    type: "GET",
	    url: endpoint + `/questions/${question_id}/answers`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	});
}

var sendNewMessage = function(content, chat_id){
	console.log('Sending Message')
	return $.ajax({
	    type: "POST",
	    url: endpoint + `/messages`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	    data: {
	    	message : {
	    		content: content,
	    		chat_id: chat_id
	    	}
	    }
	});
}


var sendNewAnswer = function(text, question_id){
	console.log('Sending Message')
	return $.ajax({
	    type: "POST",
	    url: endpoint + `/answers`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	    data: {
	    	answer : {
	    		text: text,
	    		question_id: question_id
	    	}
	    }
	});
}

const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	}.bind(this);
};

var sendRtmEvent = function(type, typing_user_id, chat_id){
	console.log('Sending Event ', type)
	console.log(arguments);
	return $.ajax({
	    type: "POST",
	    url: endpoint + `/rtm/events`,
	    headers: getUserCrendentials(),
	    dataType: "json",
	    data: {
			"rtm" : {
				"event": type,
				"chat_id": chat_id,
				"typing_user_id": typing_user_id
			}
		}
	});
}



