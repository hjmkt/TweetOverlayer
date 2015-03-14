var backgroundPage = chrome.extension.getBackgroundPage();
var twitter = backgroundPage.getTwitter();
var hideComments = false;
var commentFont = localStorage["commentFont"];
var commentColor = localStorage["commentColor"];
var commentTP = localStorage["commentTP"];
var commentSpeed = localStorage["commentSpeed"];

function RGBAToHex(RGBA){
  var RGBAArray = RGBA.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d\.]+\s*\)$/);
  return "#" + Number(RGBAArray[1]).toString(16) + Number(RGBAArray[2]).toString(16) + Number(RGBAArray[3]).toString(16);
}

function RGBAToTP(RGBA){
  return parseFloat(RGBA.match(/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d\.]+)\s*\)$/)[1]);
}

// 多言語対応
chrome.i18n.getAcceptLanguages(function(langs){
  if (langs.indexOf('ja') < 0){
    var speedControls = $("#speedControl").children();
    for(var i = 0; i < speedControls.length; i++){
      if(speedControls.eq(i).text() == "1コメント5秒表示"){
        speedControls.eq(i).text("5s/tweet");
      }
      else if(speedControls.eq(i).text() == "1コメント10秒表示"){
        speedControls.eq(i).text("10s/tweet");
      }
      else if(speedControls.eq(i).text() == "1コメント15秒表示"){
        speedControls.eq(i).text("15s/tweet");
      }
      else if(speedControls.eq(i).text() == "1コメント20秒表示"){
        speedControls.eq(i).text("20s/tweet");
      }
      else if(speedControls.eq(i).text() == "1コメント25秒表示"){
        speedControls.eq(i).text("25s/tweet");
      }
    }

    var updateRates = $("#updateRate").children();
    for(var i = 0; i < updateRates.length; i++){
      if(updateRates.eq(i).text() == "100秒毎に更新"){
        updateRates.eq(i).text("100s/update");
      }
      else if(updateRates.eq(i).text() == "30秒毎に更新"){
        updateRates.eq(i).text("30s/update");
      }
      else if(updateRates.eq(i).text() == "10秒毎に更新"){
        updateRates.eq(i).text("10s/update");
      }
    }

    $("#keyword").attr("placeholder", "Keyword");
    $("#save").text("Save");
    $("#get").text("Get");
  }
});

$("#commentSwitch").bootstrapSwitch('state', true);
$('select[name="palette"]').simplecolorpicker({theme: 'regularfont'});
$("#save").click(function(){
  localStorage.setItem("hideComments", hideComments);
  localStorage.setItem("commentFont", commentFont);
  localStorage.setItem("commentColor", commentColor);
  localStorage.setItem("commentTP", commentTP);
  localStorage.setItem("commentSpeed", commentSpeed);
});
$("#get").click(function(){
  chrome.tabs.query({active: true, currentWindow: true}, $.proxy(function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {"setKeyword": $("#keyword").val(), "setUpdateRate": $("#updateRate").val()});
  }, this));
});


chrome.extension.onMessage.addListener(function(req, sender){
  if(req.visibility !== undefined){
    hideComments = !req.visibility;
    if(hideComments){
      $("#commentSwitch").bootstrapSwitch('state', false);
    }
    else{
      $("#commentSwitch").bootstrapSwitch('state', true);
    }
    commentFont = req.font;
    $('select[id="fontControl"]').val(req.font);
    commentSpeed = req.speed;
    $('select[id="speedControl"]').val(req.speed);
    commentColor = RGBAToHex(req.color);
    $('select[name="palette"]').simplecolorpicker('selectColor', RGBAToHex(req.color));
    commentTP = req.TP;
    $('select[id="tpControl"]').val(req.TP);
  }
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {"getStatus": true});
});

setTimeout(function(){
  $('input[name="commentSwitch"]').on('switchChange.bootstrapSwitch', function(){
    hideComments = !hideComments;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"hideComment": true});
    });
  });
  $('select[id="palette"]').on('change', function() {
    commentColor = $('select[name="palette"]').val();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"changeColor": $('select[name="palette"]').val()});
    });
  });
  $('select[id="fontControl"]').on('change', function(){
    commentFont = $('select[id="fontControl"]').val();
    chrome.tabs.query({active: true, currentWindow: true}, $.proxy(function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"changeFont": this.value});
    }, this));
  });
  $('select[id="speedControl"]').on('change', function(){
    commentSpeed = $('select[id="speedControl"]').val();
    chrome.tabs.query({active: true, currentWindow: true}, $.proxy(function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"changeSpeed": this.value});
    }, this));
  });
  $('select[id="tpControl"]').on('change', function(){
    commentTP = $('select[id="tpControl"]').val();
    chrome.tabs.query({active: true, currentWindow: true}, $.proxy(function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {"changeTP": this.value});
    }, this));
  });
}, 300);


