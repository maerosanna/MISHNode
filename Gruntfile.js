module.exports = function(grunt){
  require('load-grunt-tasks')(grunt);

  //Load plugins
  [
    'grunt-express-server',
    'grunt-contrib-watch'
  ].forEach(function(task){
    grunt.loadNpmTasks(task);
  });

  //Configure plugins:
  //  + express >>  init the server on the appropriate port
  //  + watch   >>  watch changes in .js files for live updates
  grunt.initConfig({
    express: {
      options: {
        script: './bin/www'
      },

      dev: {
        options: {
          port: 3000,
          debug: false,
          node_env: 'development'
        }
      },

      prod: {
        options: {
          port: process.env.PORT,
          node_env: 'production'
        }
      }
    },
    watch: {
      express: {
        files:  [ 
          './api/**/*.js',
          './models/**/*.js',
          './public/javascript/mish/**/*.js',
          './*.js'
        ],
        tasks:  ['express:dev'],
        options: {
          spawn: false
        }
      }
    }
  });

  //Register tasks
  grunt.registerTask('production', ['express:prod', 'watch']);
  grunt.registerTask('default', ['express:dev', 'watch']);
};