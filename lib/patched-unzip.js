
var unzip = require('unzip');

// patched to not emit errors (and cause stream.unpipe)
// unzip.Parse.prototype._readRecord = function () {
//   var self = this;
//   this._pullStream.pull(4, function (err, data) {
//     if (err) {
//       console.error( 'node-unzip error', err );
//     }

//     if (data.length === 0) {
//       return;
//     }

//     var signature = data.readUInt32LE(0);
//     if (signature === 0x04034b50) {
//       self._readFile();
//     } else if (signature === 0x02014b50) {
//       self._readCentralDirectoryFileHeader();
//     } else if (signature === 0x06054b50) {
//       self._readEndOfCentralDirectoryRecord();
//     } else {
//       err = new Error('invalid signature: 0x' + signature.toString(16));
//       console.error( 'node-unzip error', err );
//     }
//   });
// };

module.exports = unzip;