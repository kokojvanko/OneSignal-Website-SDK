var sorcery = require( 'sorcery' );

var chain = sorcery.loadSync('app.js', {
  content: {
    'app.js': './dist-brunch/app.js'
  }
});
var map = chain.apply();
chain.writeSync();