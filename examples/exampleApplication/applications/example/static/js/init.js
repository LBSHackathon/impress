'use strict';

var ws;

impress.on('load', function() {

  impress.addClass(document.body, 'js');
  impress.fixCookie('SID');

  var panelLeft = impress.id('panel-left'),
      panelCenter = impress.id('panel-center'),
      panelRight = impress.id('panel-right');

  // Open RPC to absolute or relative URL, e.g. ws://127.0.0.1:80/examples/impress.rpc
  global.rpc = impress.rpc.ws('/examples/impress.rpc');

  var auth = wcl.AjaxDataSource({
    regValidation: { post: '/api/auth/regvalidation.json' },
    register:      { post: '/api/auth/register.json' },
    signOut:       { post: '/api/auth/signOut.json' },
  });

  // --- Auth Module ---

  impress.on('click', '#hmenu-Signin', function() {
    impress.togglePopup('#formLogin');
    return false;
  });

  impress.on('click', '#hmenu-Signout', function() {
    auth.signOut({}, function(err, data) {
      if (localStorage) localStorage.clear();
      window.location.reload(true);
    });
    return false;
  });

  impress.on('click', '#hmenu-Register', function() {
    impress.togglePopup('#formReg');
    return false;
  });

  impress.on('click', '#formRegDo', function(event) {
    var inputEmail = $('#formRegEmail'),
        inputPassword = $('#formRegPassword'),
        regValidation = null,
        data = { Email: inputEmail.val() };
    auth.regValidation(data, function(err, json) {
      regValidation = json;
      if (regValidation !== null) {
        data.Password = inputPassword.val();
        if (regValidation.Email) {
          inputEmail.removeClass('invalid');
          auth.register(data, function(err, data) {
            if (data.Result === 'Ok') window.location.reload(true);
          });
        } else inputEmail.addClass('invalid').focus();
      }
    });
    return false;
  });

  impress.on('click', '#formLoginSignIn', function() {
    $('#formLoginSubmit').click();
  });

  // --- LEFT MENU ---

  impress.on('click', '#menuAJAX', function() {
    var parameterName = 'paramaterValue';
    $(panelCenter).load('/examples/simple/ajaxTest.ajax?parameterName=' + parameterName);
  });

  impress.on('click', '#menuGetJSON', function() {
    var parameterName = 'paramaterValue';
    $(panelCenter).empty().html('<div class="progress"></div>');
    $.get('/examples/simple/jsonGet.json?parameterName=' + parameterName, function(res) {
      $(panelCenter).html('<pre>' + JSON.stringify(res, null, 2) + '</pre>');
    });
  });

  impress.on('click', '#menuPostJSON', function() {
    var parameterName = 'paramaterValue';
    $(panelCenter).empty().html('<div class="progress"></div>');
    $.post('/examples/simple/jsonPost.json', { parameterName: parameterName }, function(res) {
      $(panelCenter).html('<pre>' + JSON.stringify(res, null, 2) + '</pre>');
    });
  });

  impress.on('click', '#menuForkWorker', function() {
    $.get('/examples/tools/forkWorker.json', function(res) {
      $(panelCenter).html('Worker process forked, see console for output.');
    });
  });

  impress.on('click', '#menuLongWorker', function() {
    $.get('/examples/tools/longWorker.json', function(res) {
      $(panelCenter).html('Worker process forked and will terminate in 30 seconds, see console for output.');
    });
  });

  impress.on('click', '#menuTemplate', function() {
    window.location = '/examples/override';
  });

  impress.on('click', '#menuDBMI', function() {
    window.location = '/dbmi';
  });

  impress.on('click', '#menuSetup', function() {
    window.location = '/setup';
  });

  impress.on('click', '#menuFileUpload', function() {
    $(panelCenter).load('/examples/simple/upload.ajax');
  });

  impress.on('click', '#menuDownload', function() {
    $(panelCenter).html('<iframe src="/examples/simple/download.ajax" style="display:none"></iframe>');
  });

  impress.on('click', '#menuGeoIP', function() {
    $(panelCenter).empty().html('<div class="progress"></div>');
    $.get('/examples/tools/geoip.json', function(res) {
      $(panelCenter).html('<pre>' + JSON.stringify(res, null, 2) + '</pre>');
    });
  });

  impress.on('click', '#menuWS', function() {
    var url = impress.rpc.absoluteUrl('/examples/events/connect.ws');
    ws = new WebSocket(url);
    $(panelCenter).html(
      '<a class="button silver" id="btnWsClose"><span class="icon delete"></span>Close WebSocket connection</a> ' +
      '<a class="button silver" id="btnWsSend"><span class="icon handshake"></span>Send "Hello" to WebSocket</a>' +
      '<hr>Connecting...<hr>'
    );

    ws.onopen = function() {
      $(panelCenter).append('Connection opened<hr>');
    };

    ws.onclose = function() {
      $(panelCenter).append('Connection closed<hr>');
    };

    ws.onmessage = function(evt) {
      $(panelCenter).append('Message from server: ' + evt.data + '<hr>');
    };

    $('#btnWsClose').on('click', function() {
      ws.close();
      $('#btnWsClose').hide();
    });

    $('#btnWsSend').on('click', function() {
      $(panelCenter).append('Sending to server: Hello<hr>');
      ws.send('Hello');
    });
  });
  
  impress.on('click', '#menuSSE', function() {
    $(panelCenter).html(
      '<a class="button silver" id="btnSseClose"><span class="icon delete"></span>Close connection</a> ' +
      '<a class="button silver" id="btnSseSend"><span class="icon handshake"></span>Send event to server</a>' +
      '<hr>Connecting...<hr>'
    );
    sseConnect();
  });

  function sseConnect() {
    var sse = new EventSource('/examples/events/connect.sse');

    sse.addEventListener('TestEvent', function(e) {
      $(panelCenter).append('Event: ' + e.type + '; Data: ' + e.data + '<hr>');
    });

    sse.addEventListener('open', function(e) {
      $(panelCenter).append('Connection opened<hr>');
    }, false);

    sse.addEventListener('error', function(e) {
      if (e.readyState === EventSource.CLOSED) $(panelCenter).append('Connection closed by server<hr>');
      else $(panelCenter).append('SSE Error: readyState=' + sse.readyState + '<hr>');
    }, false);

    $('#btnSseClose').on('click', function() {
      sse.close();
      $(panelCenter).append('Connection closed by user<hr>');
      $('#btnSseClose').hide();
    });

    $('#btnSseSend').on('click', function() {
      $(panelCenter).append('Sending event to server, it should return back.<hr>');
      $.get('/examples/events/sendEvent.json', function(res) {
      });
    });
  }

  impress.on('click', '#menuSendMail', function() {
  });

  // begin Chat

  impress.on('click', '#menuChat', function() {
    $(panelCenter).html(
      '<div id="chatPanel" style="position:relative; height:100%;">' +
        '<div id="chatMessages" style="position:absolute; top:0; bottom:50px; left:0; right:0; overflow-y: scroll; overflow-x: hidden;"></div>' +
        '<div style="position:absolute; bottom:0; left:0; right:0">' +
          '<div style="float:left; width:100px"><input type="text" value="Anonymous" name="chatUserName" class="edit" id="chatUserName" style="width:80px" /></div>' +
          '<div style="float:right; width:130px"><a class="button silver" id="btnChatSend"><span class="icon handshake"></span>Send message</a></div>' +
          '<div style="position:absolute; left:100px; right:150px"><input type="text" value="" name="chatMessage" class="edit" id="chatMessage" style="width:100%" /></div>' +
        '</div>' +
      '</div>'
    );
    chatConnect();
  });

  function chatConnect() {
    var chat = new EventSource('/examples/chat/connect.sse'),
        chatMessages = $('#chatMessages'),
        chatMessage = $('#chatMessage'),
        chatUserName = $('#chatUserName');

    chatMessage.focus();

    function msg(s) {
      chatMessages.append('<div>' + s + '<hr></div>');
      chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }

    chat.addEventListener('chat', function(e) {
      var data = JSON.parse(e.data);
      msg(data.name + '(' + data.ip + '): ' + data.message);
    });

    chat.addEventListener('open', function(e) {
      msg('Connected to chat server');
    }, false);

    chat.addEventListener('error', function(e) {
      if (e.readyState === EventSource.CLOSED) msg('Connection closed by server');
      else msg('Error: readyState=' + chat.readyState);
    }, false);

    $('#btnChatSend').on('click', function() {
      $.post('/examples/chat/sendMessage.json', {
        name: chatUserName.val(),
        message: chatMessage.val()
      }, function(res) {});
    });
  }

  // end Chat

  impress.on('click', '#btnApplySetup', function() {
    var npmModules = $('#npmModules input'),
        npmChecked = [];
    npmModules.each(function() {
      if ($(this)[0].checked) npmChecked.push($(this).val());
    });
    $.post('/setup/apply.json', { npmChecked: npmChecked.join(',') }, function(res) {
      $(panelCenter).html('<pre>Module(s) installing... See console output.</pre>');
    });
  });

  impress.on('click', '#menuAuth', function() {
    window.location = '/examples/auth';
  });

});
