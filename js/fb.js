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

// Allows for empty polls. Possible for users to enter values. 
// TODO: Think how to remove exploit. Bots could easily spam or "save poll names"
function getPollOp() {
	var opts = $('input[name^=opt]');//new Array($('#polldata .opt').length);
	var rops = [];
	for (var i = 0; i < $('#polldata .opt').length; i++) {
		if(opts[i].value) {
			rops.push(opts[i].value);
		}
	}
	return rops;
}

function remOp(){
	$('#last_opt').remove();
}

function addOp(){
	$('#extra_opt').removeAttr("oninput").removeAttr("id").attr("placeholder","Enter an option here.");
	$('#extra_optl').removeAttr("id");
	/*
	.on('change keyup copy paste cut', function() {
        if (!this.value && this.is(":focus")) {remOp();}
	});
	function remOp(){
		$('#last_opt').remove();
	}
	*/
	var opti = $('#polldata .opt').length;
	if (opti < 25) {
		$('#optl').append(
			"		<li><input type=\"text\" name=\"opt\" class=\"opt\" id=\"extra_opt\" oninput=\"addOp(this)\" value=\"\" placeholder=\"Enter an extra option!\"></li>"
		);
	} else {
		$('#optl').append( 
		"<div style=\"font-size: .8em;\">Research shows that having too many options usually results in a lower particiaption rate. We recommend under 24 options. <br> \
Check out <a href=\"http://www.apa.org/monitor/jun04/toomany.aspx\"> this article <a> from the American Psychological Association for details.</div>");
	}
}

function submitPoll(){
	//$("#polldata").attr("action", "/" + newPollID).submit();
	window.location = "https://www.google.com"; 
	return false;
}

function createPoll(){
	window.location = "https://www.youtube.com"; 
	return false;
}

/*
https://www.firebase.com/docs/web/guide/saving-data.html
https://www.firebase.com/docs/web/guide/retrieving-data.html
https://www.firebase.com/docs/web/recipes.html
https://cenemus.firebaseio.com/?page=Auth
https://player.vimeo.com/video/55640600
https://www.firebase.com/docs/security/api/rule/
http://stackoverflow.com/questions/14963776/get-users-by-name-property-using-firebase
http://stackoverflow.com/questions/25859514/how-to-get-current-user-on-firebase

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