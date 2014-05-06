var $ = require('jquery');

exports.hello = function hello() {
    var element = $('<div id="hello">hello</div>');
    return element;
};
