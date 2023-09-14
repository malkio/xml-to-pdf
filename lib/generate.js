'use strict';

const unmarshal = require('./unmarshal');
const PDF = require('./pdf');
const fs = require('fs');
const concat = require('concat-stream');

const generate = {
    toStream(xml, opts, callback) {
        unmarshal.xmlToObject(xml, (err, data) => {
            if (err) return callback(err);

            let pdf, doc;

            try {
                pdf = new PDF(data, { opts });
                doc = pdf.render();
            } catch (e) {
                return callback(e);
            }

            callback(null, doc);
        });
    },

    toBuffer(xml, opts, callback) {
        generate.toStream(xml, opts, (err, doc) => {
            if (err) return callback(err);
            doc.pipe(concat(data => {
                if (doc.filename) data.filename = doc.filename;
                callback(null, data);
            }));
        });
    },

    toFile(xml, opts, destFile, callback) {
        generate.toStream(xml, opts, (err, doc) => {
            if (err) return callback(err);
            let stream = fs.createWriteStream(destFile);
            doc.pipe(stream);
            stream.on('finish', callback);
        });
    },
};

module.exports = generate;
