const fs = require('fs');
const archiver = require('archiver');

/**
 * Creates a zip file from an object of file contents.
 * @param {Object} fileObject - Object containing filename as key and file content as value.
 * @param {string} outputPath - The path where the zip file should be created.
 * @returns {Promise<string>} A promise that resolves with the outputPath when the zip is fully written.
 */
const createZip = (fileObject, outputPath) => {
    return new Promise((resolve, reject) => {
        // Create a file to stream archive data to
        const output = fs.createWriteStream(outputPath);
        
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the highest compression level
        });

        // Listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is closed
        output.on('close', () => {
            // CRITICAL: Do not resolve manually; let the close event handle it.
            resolve(outputPath);
        });

        // Listen for archiver errors
        archive.on('error', (err) => {
            reject(err);
        });

        // Pipe archive data to the file
        archive.pipe(output);

        // Loop through the object and append each file to the archive
        Object.keys(fileObject).forEach(filename => {
            archive.append(fileObject[filename], { name: filename });
        });

        // Call finalize exactly once after the loop finishes.
        // This tells the archiver that there are no more files to append,
        // which will subsequently fire the 'close' event on our output stream.
        archive.finalize();
    });
};

module.exports = createZip;
