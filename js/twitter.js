const CONSUMER_KEY = "CEP1Nr5zRZ1DIHRXw66NFx95l";
const CONSUMER_SECRET = "nyt0RiwbHyJRyO225er0huDeHaZllWgHvxqo5h9YuN6FA527Cn";

function Twitter() {
  this.accessToken =    null;
  this.tokenSecret =    null;
  this.userID = null;
}

Twitter.prototype.login = function(){
  var accessor = {
    consumerSecret: CONSUMER_SECRET
  };
  var message = {
    method: "POST",
    action: "https://api.twitter.com/oauth/request_token",
    parameters: {
	  oauth_version: "1.0",
	  oauth_signature_method: "HMAC-SHA1",
	  oauth_consumer_key: CONSUMER_KEY
    }
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  jQuery.post(
    message.action,
    message.parameters,
    $.proxy(function(data){       
	  this.requestToken = (data.match(/oauth_token=([^&]*)/))[1];
	  this.requestTokenSecret = (data.match(/oauth_token_secret=([^&]*)/))[1];
	  message.action = "https://api.twitter.com/oauth/authorize";
	  message.parameters["oauth_token"] = this.requestToken;
	  accessor["oauth_token_secret"] = this.requestTokenSecret;
	  OAuth.setTimestampAndNonce(message);
	  OAuth.SignatureMethod.sign(message, accessor);
	  window.open(OAuth.addToURL(message.action, message.parameters));
    }, this));
};

Twitter.prototype.init = function(pin){
  var accessor = {
	consumerSecret: CONSUMER_SECRET,
	tokenSecret: this.requestTokenSecret
  };
  var message = {
	method: "POST",
	action: "https://api.twitter.com/oauth/access_token",
	parameters: {
	  oauth_version: "1.0",
	  oauth_signature_method: "HMAC-SHA1",
	  oauth_consumer_key: CONSUMER_KEY,
	  oauth_token: this.requestToken,
	  oauth_verifier: pin
	}
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);

  jQuery.post(
	message.action,
	message.parameters,
	$.proxy(function(data){
	  this.accessToken = (data.match(/oauth_token=([^&]*)/))[1];
	  this.tokenSecret = (data.match(/oauth_token_secret=([^&]*)/))[1];
      this.userID = (data.match(/user_id=([^&]*)/))[1];
	  localStorage.setItem('accessToken', this.accessToken);
	  localStorage.setItem('tokenSecret', this.tokenSecret);
      localStorage.setItem('userID', this.userID);
	}, this));
};

Twitter.prototype.isAuthenticated = function() {
  if (this.accessToken !== null && this.tokenSecret !== null) {
    if (/^\d+$/.test(this.userID)) {
      return true;
    }
  }
  return false;
};

Twitter.prototype.get = function(api, content, callback) {
  var accessor = {
    consumerSecret: CONSUMER_SECRET,
    tokenSecret: this.tokenSecret
  };
  
  var message = {
    method: "GET",
    action: api,
    parameters: {
	  oauth_version: "1.0",
	  oauth_signature_method: "HMAC-SHA1",
	  oauth_consumer_key: CONSUMER_KEY,
	  oauth_token: this.accessToken
    }
  };

  // 多言語対応
  chrome.i18n.getAcceptLanguages(function(langs){
    if (langs.indexOf('ja') >= 0){
      message["parameters"]["lang"] = "ja";
    }
  });
  
  for(var key in content){
    message.parameters[key] = content[key];
  }
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var target = OAuth.addToURL(message.action, message.parameters);

  return jQuery.getJSON(target, callback);
};
