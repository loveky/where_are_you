module.exports = function(grunt) {

  grunt.initConfig({
    bowerInstall: {
      target: {
        src: ['index.html']
      }
    },
    jshint: {
      all: ["js/*.js"]
    },
    watch: {
      js: {
        files: ["js/*.js"],
        tasks: ["jshint"]
      },
      bower: {
        files: ["bower.json"],
        tasks: ["bowerInstall"]
      }
    },
    web_server: {
      options: {
        port: 9000
      },
      foo: 'bar'
    },
    copy: {
      dist: {
        files: [ 
          {src: 'index.html', dest: 'dist/index.html'}
        ]
      }
    },
    'useminPrepare': {
      options: {
        dest: 'dist'
      },
      html: 'index.html'
    },
    usemin: {
      html: ['dist/index.html']
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-bower-install');
  grunt.loadNpmTasks('grunt-web-server');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-usemin');
  // Default task
  grunt.registerTask('default', ['watch']);

  // Customized task
  grunt.registerTask('build', ['useminPrepare', 'copy', 'concat', 'cssmin', 'uglify', 'usemin']);
};
