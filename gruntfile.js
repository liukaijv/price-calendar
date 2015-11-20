//grunt file

module.exports = function (grunt) {

    grunt.initConfig({

        less: {
            develop: {
                options: {
                    paths: ["src/less"],
                    compress: true
                },
                files: {
                    "dist/css/calendar.min.css": "src/less/calendar.less"
                }
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'dist/js/cc-calendar.min.js': ['src/js/cc-calendar.js'],
                    'dist/js/cc-spinner.min.js': ['src/js/cc-spinner.js']
                }
            }
        },

        watch: {
            css: {
                files: [
                    'src/**/*.less'
                ],
                tasks: ['less']
            },
            js: {
                files: [
                    'src/**/*.js'
                ],
                tasks: ['uglify']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['less', 'uglify']);

}