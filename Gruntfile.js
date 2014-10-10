module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower_concat: {
            all: {
                dest: 'assets/js/_bower.js',
                cssDest: 'assets/css/_bower.css',
                bowerOptions: {
                  relative: false
                }
            }
        },
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> by @flyersweb */\n',
                mangle: true
            },
            build: {
                files: {
                    'build/pert-svg/<%= pkg.name %>-<%= pkg.version %>.min.js': ['assets/js/_bower.js', 'src/pert.js'],
                }
            }
            // ,
            // bootstrap: {
            //     src: [
            //       'assets/js/bootstrap/transition.js',
            //       'assets/js/bootstrap/alert.js',
            //       'assets/js/bootstrap/button.js',
            //       'assets/js/bootstrap/carousel.js',
            //       'assets/js/bootstrap/collapse.js',
            //       'assets/js/bootstrap/dropdown.js',
            //       'assets/js/bootstrap/modal.js',
            //       'assets/js/bootstrap/tooltip.js',
            //       'assets/js/bootstrap/popover.js',
            //       'assets/js/bootstrap/scrollspy.js',
            //       'assets/js/bootstrap/tab.js',
            //       'assets/js/bootstrap/affix.js'
            //     ],
            //     dest: 'assets/js/bootstrap.js'
            // }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/pert.js'],
            options: {
                asi:true,
                globals: {
                  jQuery: true,
                  console: true,
                  module: true,
                  document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('default', ['bower_concat', 'uglify:build']);
};