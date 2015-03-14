$(function(){
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  $(document.body).append($('<canvas id="comment" width=' + windowWidth + ' height=' + windowHeight + ' style="position: absolute; left: 0; top: 0; z-index: 2147483647; pointer-events: none;"></canvas>'));
  var commentCanvas = document.getElementById("comment");
  var cx = commentCanvas.getContext('2d');

  function Comment(data, x, row){
    this.data = data;
    this.x = x;
    this.row = row;
  };

  var comments = new Array(); //全コメント
  var commentSize = 30;
  var commentSpeed = 15;
  var commentColor = 'rgba(240, 240, 240, 1)';
  var commentTP = 1;
  var lastCommentIndex = 0;
  var onDisplayComments = new Array(); //表示中のコメント
  var openColumns = new Array(); 
  for(var i = 0; i < Math.floor((commentCanvas.height - commentSize) / (commentSize + 8)); i++){
    openColumns.push(true);
  }
  var numOfOpenColumns = openColumns.length;
  var hideComments = false;
  var keyword = location.href;;
  var updateRate = 100;
  var elapsed = 0;
  var twitter;
  
  function updateCanvas(){
    if(hideComments) return;
    
    commentCanvas.style.left = $(window).scrollLeft() + "px";
    commentCanvas.style.top = $(window).scrollTop() + "px";
    commentCanvas.width = $(window).width();
    commentCanvas.height = $(window).height();
    cx.clearRect(0, 0, commentCanvas.width, commentCanvas.height);
    cx.font = "bold " + commentSize + "px 'ＭＳ Ｐゴシック'";
    cx.fillStyle = commentColor;
    cx.strokeStyle = 'rgba(0, 0, 0, ' + commentTP + ')';

    for(var i = 0; i < onDisplayComments.length; i++){
      cx.lineWidth = 2;
      cx.strokeText(onDisplayComments[i].data, onDisplayComments[i].x, onDisplayComments[i].row * (commentSize + 8) + commentSize);
      cx.lineWidth = 1;
      cx.fillText(onDisplayComments[i].data, onDisplayComments[i].x, onDisplayComments[i].row * (commentSize + 8) + commentSize);
    }

    if(openColumns.length < Math.floor((commentCanvas.height - commentSize) / (commentSize + 8))){
      for(var i = openColumns.length; i < Math.floor((commentCanvas.height - commentSize) / (commentSize + 8)); i++){
        openColumns[i] = true;
        numOfOpenColumns++;
      }
    }
    else if(openColumns.length > Math.floor((commentCanvas.height - commentSize) / (commentSize + 8))){
      numOfOpenColumns = 0;
      openColumns.length = Math.floor((commentCanvas.height - commentSize) / (commentSize + 8));
      for(var i = 0; i < Math.floor((commentCanvas.height - commentSize) / (commentSize + 8)); i++){
        if(openColumns[i]){
          numOfOpenColumns++;
        }
      }
    }
  };

  function showCanvas(){
    if(hideComments) return;
    
    cx.clearRect(0, 0, commentCanvas.width, commentCanvas.height);
    cx.font = "bold " + commentSize + "px 'ＭＳ Ｐゴシック'";
    cx.strokeStyle = 'rgba(0, 0, 0, ' + commentTP + ')';
    cx.fillStyle = commentColor;

    for(var i = 0; i < onDisplayComments.length; i++){
      var comment = onDisplayComments[i];
      cx.lineWidth = 2;
      cx.font = "bold " + commentSize + "px 'ＭＳ Ｐゴシック'";
      cx.strokeText(onDisplayComments[i].data, onDisplayComments[i].x, onDisplayComments[i].row * (commentSize + 8) + commentSize);
      cx.lineWidth = 1;
      cx.fillText(onDisplayComments[i].data, onDisplayComments[i].x, onDisplayComments[i].row * (commentSize + 8) + commentSize);
      onDisplayComments[i].x -= (cx.measureText(comment.data).width + commentCanvas.width) / (50 * commentSpeed);
    }
  };

  function updateComments(){
    if(hideComments) return;
    
    for(var i = 0; i < onDisplayComments.length; i++){
      if(onDisplayComments[i].x + cx.measureText(onDisplayComments[i].data).width < 0 &&
         onDisplayComments[i].row < openColumns.length){
        openColumns[onDisplayComments[i].row] = true;
        numOfOpenColumns++;
      }
    }
    onDisplayComments = onDisplayComments.filter(function(comment){
      return (comment.x + cx.measureText(comment.data).width >= 0);
    });
    
    if(comments.length > 0 && onDisplayComments.length < 10 && numOfOpenColumns > 0){
      var rowIndex = Math.floor(Math.random() * numOfOpenColumns);
      for(var i = 0; i < openColumns.length; i++){
        if(openColumns[i]){
          if(rowIndex == 0){
            rowIndex = i;
            break;
          }
          else{
            rowIndex--;
          }
        }
      }
      var newComment = new Comment(comments[lastCommentIndex], commentCanvas.width, rowIndex);
      onDisplayComments.push(newComment);
      openColumns[newComment.row] = false;
      numOfOpenColumns--;
      lastCommentIndex = (lastCommentIndex + 1) % comments.length;
    }
    elapsed++;
    if(elapsed >= updateRate){
      var content = {q: keyword, count: "100"};
      twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(true));
      elapsed = 0;
    }
  }

  window.onresize = updateCanvas;
  window.onload = updateCanvas;
  window.onscroll = updateCanvas;

  // タブが隠れているときは処理を行わないようにする
  var showCanvasIntervalID = setInterval(showCanvas, 20);
  var updateCommentsIntervalID = setInterval(updateComments, 1000);
  $(window).focus(function() {
    if (!showCanvasIntervalID){
      showCanvasIntervalID = setInterval(showCanvas, 20);
      updateCommentsIntervalID = setInterval(updateComments, 1000);
    }
  });
  $(window).blur(function() {
    if(document.hidden){
      clearInterval(showCanvasIntervalID);
      clearInterval(updateCommentsIntervalID);
      showCanvasIntervalID = 0;
      updateCommentsIntervalID = 0;
    }
  });
 
  function getUpdater(deleteTitle){
    return function(data){
      comments.length = 0;
      for( var i = 0; i < data.statuses.length; i++ ) {
        data.statuses[i].text = data.statuses[i].text.replace(/https?:\/\/\S*/g, " ");
        data.statuses[i].text = data.statuses[i].text.replace(/#\S*/g, " ");
        data.statuses[i].text = data.statuses[i].text.replace(/&lt;/g, "<");
        data.statuses[i].text = data.statuses[i].text.replace(/&gt;/g, ">");
        if(deleteTitle){
          var title = document.title;
          var fragment = title.match(/\S+/g);
          var maxLength = 0;
          var maxIndex;
          for(var j = 0; j < fragment.length; j++){
            if(fragment[j].length > maxLength){
              maxLength = fragment[j].length;
              maxIndex = j;
            }
          }
          data.statuses[i].text = data.statuses[i].text.replace(new RegExp("<?" + "\S*" + fragment[maxIndex] + "\S*" + ">?"), " ");
        }
        comments.push(data.statuses[i].text);
      }
    }
  }

  // Twitter APIの認証時には拡張を無効にする
  if(!(/^https:\/\/api\.twitter\.com.*$/.test(location.href))){
    chrome.extension.sendRequest({ "init": true });
    chrome.runtime.onMessage.addListener(function(req, sender) {
      if(req.twitter !== undefined){
        keyword = location.href;
        var content = {q: keyword, count: "100"};
        twitter = req.twitter;
        twitter.__proto__  = Twitter.prototype;

        twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(true));
        if(comments.length == 0){
          keyword = location.href.replace(/\?[^?]*$/, "");
          if(keyword != location.href){
            content = {q: keyword, count: "100"};
            twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(true));
            if(comments.length == 0){
              setTimeout(function(){
                var title = document.title;
                var fragment = title.match(/\S+/g);
                var maxLength = 0;
                var maxIndex;
                for(var i = 0; i < fragment.length; i++){
                  if(fragment[i].length > maxLength){
                    maxLength = fragment[i].length;
                    maxIndex = i;
                  }
                }
                keyword = fragment[maxIndex];
                content = {q: keyword, count: "100"};
                twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(false));
              }, 300);
            }
          }
        }

        // ページタイトルが変化したらコメントを再取得するようにする
        var queryTarget = document.querySelector('head > title');
        var observer = new window.WebKitMutationObserver(function(mutations) {
          if(document.hidden){
            return;
          }
          var title = document.title;
          var fragment = title.match(/\S+/g);
          var maxLength = 0;
          var maxIndex;
          for(var i = 0; i < fragment.length; i++){
            if(fragment[i].length > maxLength){
              maxLength = fragment[i].length;
              maxIndex = i;
            }
          }
          content = {q: fragment[maxIndex], count: "100"};
          twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(false));
        });
        observer.observe(queryTarget, { subtree: true, characterData: true, childList: true });
      }
    });

  }

  function hexToRGBA(hex, alpha){
    var R = parseInt(hex.substr(1, 2), 16);
    var G = parseInt(hex.substr(3, 2), 16);
    var B = parseInt(hex.substr(5, 2), 16);
    return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
  }

  // popup.jsとの通信
  chrome.runtime.onMessage.addListener(function(req, sender){
    if(req.hideComment == true){
      hideComments = !hideComments;
      cx.clearRect(0, 0, commentCanvas.width, commentCanvas.height);
      if(hideComments){
        commentCanvas.width = 0;
        commentCanvas.height = 0;
      }
      else{
        commentCanvas.width = $(window).width();
        commentCanvas.height = $(window).height();
      }
    }
    else if(req.getStatus == true){
      chrome.extension.sendMessage({visibility: !hideComments, font: commentSize, color: commentColor, TP: commentTP, speed: commentSpeed});
    }
    else if(req.changeFont !== undefined){
      commentSize = Number(req.changeFont);
      updateCanvas();
    }
    else if(req.changeSpeed !== undefined){
      commentSpeed = Number(req.changeSpeed);
    }
    else if(req.changeColor !== undefined){
      commentColor = hexToRGBA(req.changeColor, commentTP);
    }
    else if(req.changeTP !== undefined){
      commentColor = commentColor.replace(/([\d\.]+)\s*\)$/, "" + req.changeTP + ")");
      commentTP = req.changeTP;
    }
    else if(req.setKeyword !== undefined){
      keyword = req.setKeyword;
      var content = {q: keyword, count: "100"};
      twitter.get("https://api.twitter.com/1.1/search/tweets.json", content, getUpdater(true));
      updateRate = req.setUpdateRate;
    }
      
  });

  chrome.runtime.sendMessage({method: "getStatus"}, function(res){
    if(res.hide !== undefined){
      commentSize = Number(res.font);
      commentSpeed = Number(res.speed);
      commentColor = hexToRGBA(res.color, res.TP);
      commentTP = res.TP;
      hideComments = (res.hide == "true");
      updateCanvas();
    }
  });

});
