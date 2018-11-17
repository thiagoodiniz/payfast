
var fs = require('fs');
var nomeArquivo = process.argv[2];

fs.createReadStream(nomeArquivo)
    .pipe(fs.createWriteStream('arquivo-stream.jpg'))
    .on('finish', function(){
        console.log('Arquivo escrito com Stream');
    });