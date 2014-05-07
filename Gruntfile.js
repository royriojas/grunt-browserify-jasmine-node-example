'use strict';

module.exports = function ( grunt ) {

  var expandFiles = function ( glob ) {
    return grunt.file.expand( {
      filter: 'isFile'
    }, glob );
  };

  //to allow diagnostics 
  //process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

  // Project configuration.
  grunt.initConfig( {
    // Metadata.
    pkg: grunt.file.readJSON( 'package.json' ),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    watch: {
      all: {
        files: [ 'src/**/*.*', 'test/**/*.*' ],
        tasks: [ 'default' ]
      },
    },

    jsbeautifier: {
      options: {
        mode: 'VERIFY_AND_WRITE',
        config: 'grunt-deps/beautify-config.json',
        onBeautified: function ( content, args ) {
          var replacements = [ {
            replace: /!!\s/g, // double bang with one space after
            using: '!!' // removes the extra space at the end leaving only the double bang.
          } ];

          var counts = {};
          replacements.forEach( function ( entry ) {
            var token = entry.using,
              regex = entry.replace;

            counts[ token ] = {
              count: 0,
              regex: regex
            };
            content = content.replace( regex, function () {
              counts[ token ].count++;
              return token;
            } );

          } );

          Object.keys( counts ).forEach( function ( key ) {
            //grunt.log.writeln('Replacing ' + counts[key].regex + ' with: ' + key  + ' ' + )
            var entry = counts[ key ],
              count = entry.count,
              regex = entry.regex;
            if ( count > 0 ) {
              var $ = require( 'stringformat' );
              var msg = $.format( 'Replacing {0} with {1}, {2} time(s) on file {3}', regex, key, count, args.file );
              grunt.verbose.writeln( msg );
            }
          } );

          return content;
        }
      },

      all: [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ]
    },

    jshint: {
      all: [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ],
      options: {
        jshintrc: 'grunt-deps/.jshintrc',
      }
    },
    browserify: {
      main: {
        src: [ './src/browser/App.js' ],
        dest: 'dist/app_bundle_main.js',
        options: {
          alias: [ "./src/browser/App.js:SampleApp" ],
          exclude: [ './node_modules/underscore/underscore.js', './node_modules/jquery/dist/jquery.js' ],
          transform: [ 'browserify-shim' ]
        },
      },
      src: {
        src: [ 'src/common/**/*.js', 'src/browser/**/*.js' ],
        dest: 'dist/app_bundle.js',
        options: {
          require: expandFiles(
            [ './src/common/**/*.js',
              './src/browser/**/*.js'
            ] ),
          exclude: [ './node_modules/underscore/underscore.js', './node_modules/jquery/dist/jquery.js' ],
          transform: [ 'browserify-shim' ]
        }
      },
      test: {
        src: [ 'test/spec/common/**/*.js', 'test/spec/browser/**/*.js' ],
        dest: 'dist/test_bundle.js',
        options: {
          external: [ 'src/**/*.js' ],
          exclude: [ './node_modules/underscore/underscore.js', './node_modules/jquery/dist/jquery.js' ],
          transform: [ 'browserify-shim' ]
        }
      },
    },
    jasmine: {
      src: 'dist/app_bundle.js',
      options: {
        specs: 'dist/test_bundle.js',
        vendor: [ './node_modules/jquery/dist/jquery.js', './node_modules/underscore/underscore.js' ]
      }
    },
    uglify: {
      all: {
        files: {
          'dist/app_bundle_min.js': [ 'dist/app_bundle.js' ]
        }
      },
      main: {
        files: {
          'dist/app_bundle_main_min.js': [ 'dist/app_bundle_main.js' ]
        }
      }
    }
  } );

  // **load all grunt tasks without specifying them by name**.
  //
  // This is handy because it is not longer required
  // to register a task calling grunt.loadNmpTasks('grunt-name-of-task');
  require( 'matchdep' )
    .filterDev( 'grunt-*' )
    .forEach( grunt.loadNpmTasks );

  grunt.registerTask( 'jasmine-node', function () {
    var done = this.async();
    var j = require( 'jasmine-node' );
    var jasmine = global.jasmine;

    var customReporter = new jasmine.TerminalReporter( {
      print: function () {
        // muting this reporter to 
        // just get the results from it
      }
    } );
    jasmine.getEnv().addReporter( customReporter );
    j.run( {
      onComplete: function () {
        console.log( '====!', grunt.warn );
        if ( customReporter.counts.failures === 0 ) {
          grunt.log.ok( 'All done!' );
          done();
          return;
        }

        grunt.warn( 'Tests failed!: ' + customReporter.counts.failures );
        done();
      },
      verbose: true,
      watchFolders: [],
      specFolders: [ 'test/spec/common/', 'test/spec/node' ],
      extensions: "js"
    } );

  } );
  // Default task.
  grunt.registerTask( 'default', [ 'jsbeautifier', 'jshint', 'jasmine-node', 'browserify', 'jasmine', 'uglify' ] );
};
