'use strict';
(function () {

  var changeForEachForIE = function () {
    if ('NodeList' in window && !NodeList.prototype.forEach) {
      console.info('polyfill changeForEachForIE for IE11');
      NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
        }
      };
    }
  };

  window.forEachForIE = {
    changeForEachForIE: changeForEachForIE
  };

  window.forEachForIE.changeForEachForIE();

})();
