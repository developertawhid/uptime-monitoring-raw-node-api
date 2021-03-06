//dependencies
const fs = require('fs');
const path = require('path');

const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file for writinng
    fs.open(`${lib.basedir+dir}/${file}.json`, 'wx', function(err, fileDescoriptor) {
        if(!err && fileDescoriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and then close it
            fs.writeFile(fileDescoriptor, stringData, (err2) => {
                if(!err2) {
                    fs.close(fileDescoriptor, (err3) => {
                        if(!err3) {
                            callback(false)
                        } else {
                            callback('Error closing the new file!')
                        }
                    });
                }else {
                    callback('Error writing to new file!');
                }
            })
        }else {
            callback('Coule not create new file, it may already exists!');
        }
    })
}

// read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    })
}

// update ecisting file
lib.update = (dir, file, data, callback) => {
    // file open for writing
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescoriptor) => {
        if(!err && fileDescoriptor) {
            // convert the data to string
            const stringData = JSON.stringify(data);

            // truncate the file
            fs.ftruncate(fileDescoriptor, (err1) => {
                if(!err1) {
                    // writh to the file and close it
                    fs.writeFile(fileDescoriptor, stringData, (err2) => {
                        if(!err2) {
                            // close the file
                            fs.close(fileDescoriptor, (err3) => {
                                if(!err3) {
                                    callback(false)
                                }else {
                                    callback('Error closing file!');
                                }
                            })
                        }else {
                            callback('Error writing to file!')
                        }
                    })
                }else {
                    callback('Error truncating file!');
                }
            })
        }else {
            callback(`Error updating, File may not exist`);
        }
    })
}

// delete exidting file 
lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if(!err) {
            callback(false);
        }else {
            callback(`Error deleting file`);
        }
    })
}

// list all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if(!err && fileNames && fileNames.length > 0) {
            const trimmedFillName = fileNames.map(fileName => fileName.replace(".json", ''));
            callback(false, trimmedFillName);
        }else {
            callback('Error reading directory!');
        }
    });
};

module.exports = lib;

