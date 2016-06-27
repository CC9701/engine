/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Chukong Aipu reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

'use strict';

const Utils = require('./utils');
const Path = require('fire-path');

const Source = require('vinyl-source-stream');
const Gulp = require('gulp');
const Buffer = require('vinyl-buffer');
const Uglify = require('gulp-uglify');
const Sourcemaps = require('gulp-sourcemaps');
const Size = require('gulp-size');
const EventStream = require('event-stream');
const Chalk = require('chalk');
const HandleErrors = require('../util/handleErrors');

exports.buildCocosJs = function (sourceFile, outputFile, excludes, callback) {
    var outDir = Path.dirname(outputFile);
    var outFile = Path.basename(outputFile);
    var bundler = Utils.createBundler(sourceFile);

    excludes && excludes.forEach(function (file) {
        bundler.exclude(file);
    });

    var uglifyOption = Utils.uglifyOptions(false, {
        CC_EDITOR: false,
        CC_DEV: true,
        CC_TEST: false,
        CC_JSB: false
    });

    var rawSize = Size({ gzip: false, pretty: false, showTotal: false, showFiles: false });
    var zippedSize = Size({ gzip: true, pretty: false, showTotal: false, showFiles: false });

    bundler.bundle()
        .pipe(Source(outFile))
        .pipe(Buffer())
        .pipe(Sourcemaps.init({loadMaps: true}))
        .pipe(Uglify(uglifyOption))
        .pipe(rawSize)
        .pipe(zippedSize)
        .pipe(EventStream.through(null, function () {
            var raw = rawSize.size;
            var zipped = zippedSize.size;
            var percent = ((zipped / raw) * 100).toFiexed(2);
            console.log(`Size of ${outputFile}: raw: ${Chalk.cyan(raw + 'B')} zipped: ${Chalk.cyan(zipped + 'B')}, compression ratio: ${percent}%`);
            this.emit('end');
        }))
        .pipe(Sourcemaps.write('./', {
            sourceRoot: './',
            includeContent: true,
            addComment: true
        }))
        .pipe(Gulp.dest(outDir))
        .on('end', callback);
};

exports.buildCocosJsMin = function (sourceFile, outputFile, excludes, callback) {
    var outDir = Path.dirname(outputFile);
    var outFile = Path.basename(outputFile);
    var bundler = Utils.createBundler(sourceFile);

    excludes && excludes.forEach(function (file) {
        bundler.exclude(file);
    });

    var uglifyOption = Utils.uglifyOptions(true, {
        CC_EDITOR: false,
        CC_DEV: false,
        CC_TEST: false,
        CC_JSB: false
    });

    var rawSize = Size({ gzip: false, pretty: false, showTotal: false, showFiles: false });
    var zippedSize = Size({ gzip: true, pretty: false, showTotal: false, showFiles: false });

    bundler.bundle()
        .pipe(Source(outFile))
        .pipe(Buffer())
        .pipe(Sourcemaps.init({loadMaps: true}))
        .pipe(Uglify(uglifyOption))
        .pipe(rawSize)
        .pipe(zippedSize)
        .pipe(EventStream.through(null, function () {
            var raw = rawSize.size;
            var zipped = zippedSize.size;
            var percent = ((zipped / raw) * 100).toFiexed(2);
            console.log(`Size of ${outputFile}: raw: ${Chalk.cyan(raw + 'B')} zipped: ${Chalk.cyan(zipped + 'B')}, compression ratio: ${percent}%`);
            this.emit('end');
        }))
        .pipe(Sourcemaps.write('./', {
            sourceRoot: './',
            includeContent: true,
            addComment: true
        }))
        .pipe(Gulp.dest(outDir))
        .on('end', callback);
};

exports.buildPreview = function (sourceFile, outputFile, callback) {

    var outFile = Path.basename(outputFile);
    var outDir = Path.dirname(outputFile);

    var bundler = Utils.createBundler(sourceFile);
    bundler.exclude('./bin/modular-cocos2d-cut.js')
        .bundle()
        .on('error', HandleErrors.handler)
        .pipe(HandleErrors())
        .pipe(Source(outFile))
        .pipe(Buffer())
        .pipe(Sourcemaps.init({loadMaps: true}))
        .pipe(Uglify(Utils.uglifyOptions(false, {
            CC_EDITOR: false,
            CC_DEV: true,
            CC_TEST: false,
            CC_JSB: false
        })))
        .pipe(Sourcemaps.write('./', {
            sourceRoot: '../',
            includeContent: false,
            addComment: true
        }))
        .pipe(Gulp.dest(outDir))
        .on('end', callback);
};

exports.buildJsb = function (sourceFile, outputFile, jsbSkipModules, callback) {
    var outFile = Path.basename(outputFile);
    var outDir = Path.dirname(outputFile);

    var bundler = Utils.createBundler(sourceFile);
    jsbSkipModules.forEach(function (module) {
        bundler.ignore(require.resolve(module));
    });
    bundler.bundle()
        .on('error', HandleErrors.handler)
        .pipe(HandleErrors())
        .pipe(Source(outFile))
        .pipe(Buffer())
        .pipe(Uglify(Utils.uglifyOptions(false, {
            CC_EDITOR: false,
            CC_DEV: false,
            CC_TEST: false,
            CC_JSB: true
        })))
        .pipe(Gulp.dest(outDir))
        .on('end', callback);
};

exports.buildJsbMin = function (sourceFile, outputFile, jsbSkipModules, callback) {
    var outFile = Path.basename(outputFile);
    var outDir = Path.dirname(outputFile);

    var bundler = Utils.createBundler(sourceFile);
    jsbSkipModules.forEach(function (module) {
        bundler.ignore(require.resolve(module));
    });
    bundler.bundle()
        .on('error', HandleErrors.handler)
        .pipe(HandleErrors())
        .pipe(Source(outFile))
        .pipe(Buffer())
        .pipe(Uglify(Utils.uglifyOptions(true, {
            CC_EDITOR: false,
            CC_DEV: false,
            CC_TEST: false,
            CC_JSB: true
        })))
        .pipe(Gulp.dest(outDir))
        .on('end', callback);
};