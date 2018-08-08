$(document).ready(function() {
	// ------- Chat Bot----------------------- //
	var mybot = '<div class="chatCont" id="chatCont">'+
								'<div class="bot_profile">'+
									'<img src="static/img/logobot.png" class="bot_p_img">'+
									'<div class="close">'+
										'<i class="fa fa-times" aria-hidden="true"></i>'+
									'</div>'+
								'</div><!--bot_profile end-->'+
								'<div id="result_div" class="resultDiv"></div>'+
								'<div class="chatForm" id="chat-div">'+
									'<div class="spinner">'+
										'<div class="bounce1"></div>'+
										'<div class="bounce2"></div>'+
										'<div class="bounce3"></div>'+
									'</div>'+
									'<input type="text" id="chat-input" autocomplete="off" placeholder="Try typing here"'+ 'class="form-control bot-txt"/>'+
								'</div>'+
							'</div><!--chatCont end-->'+

							'<div class="profile_div">'+
								'<div class="row">'+
									'<div class="col-hgt">'+
										'<img src="static/img/logobot.png" class="img-circle img-profile">'+
									'</div><!--col-hgt end-->'+
									'<div class="col-hgt">'+
										'<div class="chat-txt">'+
											'Give me questions!'+
										'</div>'+
									'</div><!--col-hgt end-->'+
								'</div><!--row end-->'+
							'</div><!--profile_div end-->';

	$("mybot").html(mybot);

	// ------------------------------------------ Toggle chatbot -----------------------------------------------
	$('.profile_div').click(function() {
		$('.profile_div').toggle();
		$('.chatCont').toggle();
		$('.bot_profile').toggle();
		$('.chatForm').toggle();
		setBotResponse("Welcome to Lambton Chatbot, my name is Jessie. How can I help you?")
		document.getElementById('chat-input').focus();
	});

	$('.close').click(function() {
		$('.profile_div').toggle();
		$('.chatCont').toggle();
		$('.bot_profile').toggle();
		$('.chatForm').toggle();

	});


	// Session to make each interaction with chat bot unique
	var session = function() {
		// Retrieve the object from storage
		if(sessionStorage.getItem('session')) {
			var retrievedSession = sessionStorage.getItem('session');
		} else {
			// Random Number Generator
			var randomNo = Math.floor((Math.random() * 1000) + 1);

			// Join random number+day+timestamp
			var session_id = randomNo.toString();
			// Put the object into storage

			sessionStorage.setItem('session', session_id);
			var retrievedSession = sessionStorage.getItem('session');
		}
		return retrievedSession;

	}

	// Call Session init
	var mysession = session();


	// --- Getting the text --- //
	$('#chat-input').on('keyup keypress', function(e) {
		var keyCode = e.keyCode || e.which;
		var text = $("#chat-input").val();
		if (keyCode === 13) {
			if(text == "" ||  $.trim(text) == '') {
			    $('#chat-input').select();
				e.preventDefault();
				return false;
			} else {
				$("#chat-input").blur();
				textboxes = $("#chat-input");
				setUserResponse(text);
				send(text);
				textboxes.focus();
				textboxes.select();
				e.preventDefault();
				return false;
			}
		}
	});


	//------------------------------------------- Send request to RASA ---------------------------------------
	function send(text) {
		  document.getElementById("chat-input").placeholder = "Type your messages here..."
    $.post("/chat",
            {
                sessionId:mysession,
                text:text,
            },
            function(jsondata, status){
                if(jsondata["status"]=="success"){
                    response=jsondata["response"];
                    if(response){
                    	setBotResponse(response);
                    }
                }
		});
	}

	//------------------------------------ Set bot response in result_div -------------------------------------
	function setBotResponse(val) {
		setTimeout(function(){
			if($.trim(val) == '') {
				val = 'I couldn\'t get that. Let\' try something else!'
				var BotResponse = '<p class="botResult">'+val+'</p><div class="clearfix"></div>';
				$(BotResponse).appendTo('#result_div');
			} else {
				val = val.replace(new RegExp('\r?\n','g'), '<br />');
				var BotResponse = '<p class="botResult">'+val+'</p><div class="clearfix"></div>';
				$(BotResponse).appendTo('#result_div');
			}
			scrollToBottomOfResults();
			hideSpinner();
		}, 500);
	}


	//------------------------------------- Set user response in result_div ------------------------------------
	function setUserResponse(val) {
		var UserResponse = '<p class="userEnteredText">'+val+'</p><div class="clearfix"></div>';
		$(UserResponse).appendTo('#result_div');
		$("#chat-input").val('');
		scrollToBottomOfResults();
		showSpinner();
		$('.suggestion').remove();
	}


	//---------------------------------- Scroll to the bottom of the results div -------------------------------
	function scrollToBottomOfResults() {
		var terminalResultsDiv = document.getElementById('result_div');
		terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
	}


	//---------------------------------------- Spinner ---------------------------------------------------
	function showSpinner() {
		$('.spinner').show();
	}
	function hideSpinner() {
		$('.spinner').hide();
	}


	});
