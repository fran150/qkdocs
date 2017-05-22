var merge = require('merge');
var http = require('http');
const chalk = require('chalk');
var rc = require('./qkdocsrc');


function request(httpConfig, data, callback) {
    // Service response
    var response = "";
    var status;
    var method = httpConfig.method;

    // Make an HTTP Request to the package service
    var req = http.request(httpConfig, (res) => {
        res.setEncoding('utf8');

        // On data received append to response
        res.on('data', (chunk) => {
            response += chunk;
        });

        // On request end invoke callback
        res.on('end', () => {
            var data = JSON.parse(response);

            if (res.statusCode < 200 || res.statusCode >= 300) {
                callback(true, response);
            } else {
                callback(false, response);
            }
        });
    });

    req.on('error', (e) => {
        callback(e);
    });

    if (method == "POST" || method == "PUT") {
        req.write(data);
    }

    // End the HTTP Request
    req.end();
}

module.exports = {
    getDoc: function(name, callback) {
        rc.read(function(config) {
            // Get default host config
            var httpConfig = config.http;

            // Merge with default options
            httpConfig = merge(httpConfig, config.docs);

            httpConfig.method = 'GET';
            httpConfig.headers = {
                'Content-Type': 'application/json'
            }
            httpConfig.path += "?name=" + name;

            request(httpConfig, '', callback);
        })
    },

    updateDoc: function(id, doc, callback) {
        rc.read(function(config) {
            // Get default host config
            var httpConfig = config.http;

            // Merge with default options
            httpConfig = merge(httpConfig, config.docs);

            httpConfig.method = 'PUT';
            httpConfig.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(doc)
            }
            httpConfig.path += "/" + id;

            request(httpConfig, doc, callback);
        })
    },

    // Get the specified package config from service
    saveDoc: function(doc, callback) {
        rc.read(function(config) {
            // Get default host config
            var httpConfig = config.http;

            // Merge with default options
            httpConfig = merge(httpConfig, config.docs);

            httpConfig.method = 'POST';
            httpConfig.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(doc)
            }

            request(httpConfig, doc, callback);
        });
    }
}
