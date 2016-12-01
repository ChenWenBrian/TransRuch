// ==UserScript==
// @name        TransRush-Auto-Expand
// @namespace   TransRuch
// @description Written by Brian Chen
// @include     http://member.transrush.com/Member/MyParcel.aspx
// @version     1
// @grant       none
// ==/UserScript==


function waitToLoad(selector, timeout, callback) {
  var t = 0;
  var tid = setInterval(function () {
    console.info(t + ':' + selector);
    var target = $(selector);
    if (target.length || timeout < t) {
      clearInterval(tid);
      callback(target);
    }
    t += 200;
  }, 200);
}

function expandByTab(curTab) {
  var divId = curTab.attr('flag'),
      opBtn = $('#' + divId + '>ul.list-head>li:last'),
      icon = '<span title="展开或收拢" class="ui-icon ui-icon-circle-down" style="cursor: pointer;color: #019fe8"></span>';
  //waitToLoad('#' + divId + '>ul.list-head>li:last', 5000);
  if ($('span', opBtn).length) return;
  $(icon).appendTo(opBtn).click(function () {
    var iconCss = $(this).hasClass('ui-icon-circle-down')
                ? 'ui-icon-circle-down' 
                : 'ui-icon-circle-up';
    waitToLoad('#' + divId + '>div.list>div.item', 30000, function(list){
      list.each(function () {
        var expandIcon = $('ul.item-head>li:last>span.' + iconCss, this);
        expandIcon.click();
      });
    });
  }).click();
}

var selector = '#parcelTabs>ul.tabs>li.ui-tabs-active';
waitToLoad(selector, 30000, function(tab){
  expandByTab(tab);
  $('#parcelTabs>ul.tabs>li.ui-tabs').click(function(){
    expandByTab($(this));
  });
});
