'use strict';
(function () {

  var changeIncludesForIE = function () {
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        'use strict';

        if (search instanceof RegExp) {
          throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) { start = 0; }
        return this.indexOf(search, start) !== -1;
      };
    }
  }

  window.includes = {
    changeIncludesForIE: changeIncludesForIE
  }

  window.includes.changeIncludesForIE();

})();
