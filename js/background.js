var twitter = new Twitter();


chrome.extension.onRequest.addListener(function(req, sender) {
  if(req.init !== undefined){
    var accessToken = localStorage.getItem("accessToken");
    var tokenSecret = localStorage.getItem("tokenSecret");
    var userID = localStorage.getItem("userID");
    if(accessToken !== null && tokenSecret !== null && userID !== null){
      twitter.accessToken = accessToken;
      twitter.tokenSecret = tokenSecret;
      twitter.userID = userID;
      setTimeout(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {"twitter": twitter});
        });
      }, 300);
    }
    else{
      twitter.login();
    }
  }
  else if(req.verifier !== undefined){
    twitter.init(req.verifier);

    setTimeout(function(){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"twitter": twitter});
      });
    }, 300);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "getStatus" && localStorage["hideComments"] !== undefined){
    sendResponse({hide: localStorage["hideComments"], font: localStorage["commentFont"], color: localStorage["commentColor"], TP: localStorage["commentTP"], speed: localStorage["commentSpeed"]});
  }
  else{
    sendResponse({});
  }
});

function getTwitter() {
  return twitter;
}

