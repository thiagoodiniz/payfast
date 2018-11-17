
var fs = require('fs');

var nomeArquivo = process.argv[2];

fs.readFile(`${nomeArquivo}.jpg`, function(err, buffer){
        console.log('Arquivo lido');
        fs.writeFile(`ArquivoEscrito.jpg`, buffer, function(){
            console.log('Arquivo escrito');
        });
});