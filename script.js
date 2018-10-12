// JavaScript Document

//Configuration Options
var digits = 8; //Set the number of digits in the code

//Some global variables
var code = [];
var correct = 0;
var guess = [];
var guessCount = 0;
var highScore = 0;
var clicked = 0;
var timeLimit = 30;
var timeAddition = 3;

//Timer variables
var running = 0;
var time = timeLimit;
var SPrint = "";
var timePrint;
var interval;

$(document).ready(function() {
	
	//Once the page is loaded, get things ready
	initial();
	if(checkCookies() !== true){ //If cookies don't work
		alert("!!! IMPORTANT !!!\nThis page relies upon cookies, but it appears that they are not functioning as expected.\nYou could try running it in Firefox\n\nOtherwise, expect some functionality to be broken!\nPROCEED AT YOUR OWN RISK!");
	}
	
	
	
	
	$('#startbtn').click( function() { start(); }); //Start when the start button is clicked

	//If there's any action with the options
	$("#options").click(function() { 
		clicked = 1; //Set clicked to 1
	}); //(That avoids accidentally guessing twice)
	

	//When the button's clicked, run the code
	$("#go").click(function() { 
		
		if (clicked){ //(Only if the options have been clicked)
			if (timeLimit > 0){ //(Only if there's time left)
				makeGuess();
			} else {
				lose();
			}
		} else {
			alert("You need to enter a guess\n\n(You might like to change from last time...)");
		}
	});
	
	//If there's a high score:
	if(doesCookieExist("codebreakHighScore")){
	   	highScore = getCookieValue("codebreakHighScore"); //Grab it, and save it for later
	
		//Print the high score
		if (highScore == 1){
			$('#high').html(highScore + " guess"); //Singular if the count is one
		} else {
			$('#high').html(highScore + " guesses"); //Otherwise, plural
		}
	
		//And show the high score
		$('#fullHigh').css('visibility', 'visible');
		
	}
	
	//Reset the high scores if necessary
	$("#fullHigh").dblclick(function() { //When the high score is double clicked:
		
		deleteCookie("codebreakHighScore"); //Delete the cookie
		highScore = 0; //Reset the high score
		location.reload(true); //Refresh the page
		
		
	});


	
		
});

function initial(){ //Get everything set up
	clicked = 1;
	
	//Pick a random number 
	var rand = String(Math.round(Math.random()*Math.pow(10,digits)));
	console.log(rand);
	//Split it into an array
	code = rand.split("");
	
	//Make sure it's the right length, otherwise add leading zeroes
	if (code.length < digits){ //If the code's not long enough
		while(code.length < digits){ //Keep going 'till it's the right length
			code.unshift("0"); //Add a zero to the beginning
		}
	}	
	console.log(code); //Display the answer in the console (for debug)
}

function start(){ //To start the game:

	//Create the code inptus
	for(var i=0; i < digits; i++){ //For each of the inputs
		$('#digits').append('<td><select id="digit' + i + '" name="digit' + i + '" class="wrong" title="Enter a value for digit ' + (i+1) + '"></select></td>'); //Add a blank dropdown to the table
		for(var j=0; j < 10; j++){ //For each of the numbers
			$('#digit'+i).append('<option value="' + j + '">' + j + '</option>'); //Add an option to the dropdown
		}
		//Then create the feedback labels
		$('#labels').append('<td id="label' + i + '" class="feedback">&nbsp;</td>');
	}

	//Set width of the container div
	if($("#digits").width() > 400){  //If the container is smaller than the table
		$("#container").css("width", $("#digits").width()); //Set it to the size of the table
	}
	
	//Enable the options
	$('.no-click').css({'pointer-events' : 'all',
						 'cursor' : 'auto'});
	
	//Hide the START button
	$("#startbtn").css('display', 'none');
	
	//Start the timer
	countdownInit();
	
	
}

function makeGuess(){
	//Reset the click
	clicked = 0;
	
	//Add one to the guess counter
	guessCount = guessCount +1;
	
	//Print out the guess count
	if (guessCount == 1){
		$('#score').html(guessCount + " guess"); //Singular if the count is one
	} else {
		$('#score').html(guessCount + " guesses"); //Otherwise, plural
	}
		
	//Grab the user's guess
	for (var i = 0; i < digits; i++){ //Cylce through each of the digits
		guess[i] = ($('#digit'+i).val()); //Add each digit of the guess to an array
		
		if (code[i] == "*"){ //If it's already matched, ignore it!
		
		} else if (guess[i] == code[i]){ //If the guess matches the code:
			//Write that it's correct
			$('#label' +i).html("<span title='That&#39;s correct!'><img src='img/ok.png' width='25' height='25'></img></span>");
			//Disable the input
			$('#digit' +i).attr("disabled", true);
			//Change the border colour
			$('#digit' +i).attr("class", "right");
			
			//Add one to the number of correct
			correct = correct + 1;
			
			//Add the extra time
			time = time + timeAddition;
			
			//Inclue the extra time
			$('#timertext_no').html(timeAddition);
			//Show the add message
			$('#timertext').fadeIn(100).delay(500).fadeOut(100);   
			
			//Remove the digit from the code
			code[i] = "*";
	
		} else if (guess[i] < code[i]) { //Otherwise, if the guess is higher than the code:
			//Write that it's lower
			$('#label' +i).html("<span title='Pick a Higher number'><img src='img/up.png' width='25' height='25'></img></span>");
			
			//Disable the guess, and anything higher
			for (var j = 0; j <= guess[i]; j++){ //Starting at zero, going up to the guessed number:
				$('#digit' +i + " option[value='" + j + "']").attr("disabled", "true"); //Disable that option
			}			
		} else if (guess[i] > code[i]) { //If the guess is lower than the code:
			//Write that it's higher
			$('#label' +i).html("<span title='Pick a Lower number'><img src='img/down.png' width='25' height='25'></img></span>");
			
			//Disable the guess, and anything lower
			for (var j = 9; j >= guess[i]; j--){ //Starting at nine, going down to the guessed number:
				$('#digit' +i + " option[value='" + j + "']").attr("disabled", "true"); //Disable that option
			}	
		}
		
		if (correct >= digits){ //Then, if all the digits have been guessed:
			win(); //End the game
		}
	}
	
	
}

function win(){ //If the code has been guessed:
	
	//Stop the timer
	clearInterval(interval);
	
	//Make sure the time's printed right
	display();
	
	//Replace the buttons
	$('#buttons').html('<button width="111" onclick="location.reload(true);" title="Click to reload and play again">Do you want to play again?</button>');
	
	//Print out the final score
	$('#fullScore').html("<strong>You cracked the code in " + guessCount + " guesses!</strong>");
	
	//Work out High Scores
	
	if (guessCount < highScore || highScore == 0){ //If it's a new high score, or the first score:	
		setCookie("codebreakHighScore", guessCount); //Set the cookie
		//Print it out
		$('#fullHigh').html("NEW HIGH SCORE: " + guessCount + " guesses");		
	} else if (guessCount == highScore){ //If they got the same:
		//Print it out
		$('#fullHigh').html("Equal High Score: " + highScore + " guesses");	
	} else if (guessCount > highScore){ //If they didn't beat it:
		$('#fullHigh').html("Try to beat the high score: " + highScore + " guesses");	
	}
	
	//And show the high score
	$('#fullHigh').css('visibility', 'visible');
}

function lose(){
	
	//Replace the buttons
	$('#buttons').html('<button width="111" onclick="location.reload(true);" title="Click to reload and play again">Do you want to play again?</button>');
	
	//Print out the final score
	$('#fullScore').html("<strong>You got caught after " + guessCount + " guesses!</strong>");
}

/*
/ Timer Code
*/
function countdownInit(){
	//Set the time limit
	time = timeLimit;
	//alert(timeLimit);

	//Set it to running
	running = 1;

	display(); //Then pop it onto the screen

	interval = setInterval(function() { //Start a timer
		countdown(); //Go and get rid of a second
	}, 1000); //Go every second		

}

function countdown(){
	time = time-1; //Take away one from the seconds


	display(); //Pop it on the screen

	if (time < 1){ //When there's no time left:
		clearInterval(interval); //Stop the interval
		running = 0; //Set it to 'not running' again
		
		lose(); //They also lost the game!
	}


}

//Change something on the screen
function display(){

	if(time < 10){ //If there's less than 10 seconds:
		SPrint = "0" + time; //Add a leading zero, ready to print
	} else {
		SPrint = time; //Otherwise, just set the time to print
	}

	timePrint = "0:" + SPrint; //Stick the time together

	$('.timercontainer').html(timePrint); //Print it on screen
}

//When you click the button, run the code!
$(".timerbutton").click(function(){
	if (!running){ //If it's not  already running:
		countdownInit(); //Start it going
	}

});




function checkCookies() {
	var cookieTest = "";
	//Set a cookie with a known value
	setCookie("testCookie","foobar");
	
	if (doesCookieExist("testCookie")){
		//Grab the value of that cookie
		cookieTest = getCookieValue("testCookie");
		
		//Delete it, to keep things tidy
		deleteCookie("testCookie");
	}
	//If it's not as expected, something must be wrong
	if (cookieTest !== "foobar"){
		return false;
	} else { 
	 	return true;
	}
	
}

/*
/   COOKIE FUNCTIONS DO NOT TOUCH
*/
	function setCookie(cookieName,value,exdays){
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var  cookieValue=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=cookieName + "=" + cookieValue;
	}
	
	function doesCookieExist(cookieName) {
		var value=getCookie(cookieName);
		if (value!=null && value!="") {
			return true;
		} else {
			return false;
		}
	}
	
	function getCookieValue(cookieName) {
		var value=getCookie(cookieName);
		if (value!=null && value!="") {
			return value.split(",")[0];
		} else {
			return null;
		}
	}
	
	function deleteCookie(cookieName) {
		setCookie(cookieName, "", -1);	
	}
	
	function getCookie(cookieName) {
		var cookie = document.cookie;
		var c_start = cookie.indexOf(" " + cookieName + "=");
		if (c_start == -1) {
			c_start = cookie.indexOf(cookieName + "=");
		}
		
		if (c_start == -1) {
			cookie = null;
		} else {
			c_start = cookie.indexOf("=", c_start) + 1;
			var c_end = cookie.indexOf(";", c_start);
			if (c_end == -1) {
				c_end = cookie.length;
			}
			cookie = unescape(cookie.substring(c_start,c_end));
		}
		
		return cookie;
	}
