var myDataRef = new Firebase('https://v8x9g5gob7f.firebaseio-demo.com/');
var myUserID = null;

var name = 'init';
var text = 'init_text';
var snapshot; 

var newData = myDataRef.push({name: name, text: text});
var postID = newData.key();

myDataRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  console.log(snapshot);
  console.log(message);
});


function onLoginClick() {
	
}

var db = new Firebase('https://cenemus.firebaseio.com/')
var opti = $('#polldata .opt').length;

function getPollOp() {
	docPollOps = $('input[name^=opt]');
	toSendPollOps = new Array($('#polldata .opt').length);
	for (i = 0; i < $('polldata .opt').length; i++) {
		toSendPollOps[i] = docPollOps[i].placeholder;
	}
	return toSendPollOps;
}


/*
https://www.firebase.com/docs/web/guide/saving-data.html
https://www.firebase.com/docs/web/guide/retrieving-data.html
https://www.firebase.com/docs/web/recipes.html
https://cenemus.firebaseio.com/?page=Auth
https://player.vimeo.com/video/55640600
https://www.firebase.com/docs/security/api/rule/

{
  "Op" : [ null, {
	"Value" : "This is the option",
	"Votes" : 0
  }, {
	"Value" : "This is another option",
	"Votes" : 3
  } ],
  "PollSettings" : {
	"Admin" : "UUID",
	"Captcha" : "True",
	"Notify" : "Text",
	"ValidationType" : "None",
	"uAddChoice" : "False"
  },
  "Que" : "Hello. Poll Question?"
}
*/