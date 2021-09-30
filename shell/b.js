
var yuhStop = false;
(function () {
  alert('success');
  function sendKey(k) {
    console.log(k);
    let e = document.querySelectorAll("textarea.xterm-helper-textarea");
    e = e[e.length - 1];
    const option = {
      bubbles : true,
      cancelable : true,
      char: k,
      key : k,
      shiftKey : true,
      keyCode : k.charCodeAt()
    };
    e.dispatchEvent(new KeyboardEvent("keydown", option));
    e.dispatchEvent(new KeyboardEvent("keyup", option));
  }

  function autoTab() {
    // new tab
    document.querySelector("[spotlight-id=\"devshell-add-tab-button\"]").click()


    setTimeout(function () {
      // ls command
      setTimeout(sendKey, 1000, 'a')
      setTimeout(sendKey, 1400, 'a')
      setTimeout(sendKey, 2000, 'a')
      setTimeout(sendKey, 2300, 'a')
      setTimeout(sendKey, 3000, 'a')

      setTimeout(function () {
        // close tab
        let e = Array.from(document.querySelectorAll('mat-tab-group .mat-button-wrapper')).filter(function (e) {
          return e.innerHTML.match(/close/im);
        });
        if (e.length > 1) {
          e[e.length - 1].parentElement.click();
        }
        if (!yuhStop) {
          setTimeout(sendKey, 1000, 'a')
          setTimeout(autoTab, 50000);
        }
      }, 5000);

    }, 7000);
  };
  autoTab();

  function autoReconnect() {
    let e = document.querySelectorAll("status-message .mat-button-wrapper");
    if (e) {
      e = Array.from(e);
      e.filter(function (e) {
        return e.innerHTML.match(/connect/im);
      });
      e.map(function (_) {
        _.parentElement.click();
        console.log('reconnect');
      });  
    }
    setTimeout(autoReconnect, 1000);
  }
  autoReconnect();
})();



var yuhStop = false;
(function () {
  alert('success');
  function sendKey(k) {
    console.log(k);
    let e = document.querySelectorAll("textarea.xterm-helper-textarea");
    e = e[e.length - 1];
    const option = {
      bubbles : true,
      cancelable : true,
      char: k,
      key : k,
      shiftKey : true,
      keyCode : k.charCodeAt()
    };
    e.dispatchEvent(new KeyboardEvent("keydown", option));
    e.dispatchEvent(new KeyboardEvent("keyup", option));
  }

  setInterval(sendKey, 3000, 'a');

  function autoReconnect() {
    let e = document.querySelectorAll("status-message .mat-button-wrapper");
    if (e) {
      e = Array.from(e);
      e.filter(function (e) {
        return e.innerHTML.match(/connect/im);
      });
      e.map(function (_) {
        _.parentElement.click();
        console.log('reconnect');
      });  
    }
    setTimeout(autoReconnect, 1000);
  }
  autoReconnect();
})();