
var fs = require('fs');

module.exports = function(app){

    app.post('/upload/imagem', function(req, res){
       
        console.log('Lendo o arquivo');
        var diretorio = 'files';
        var nomeArquivo = req.headers.filename;

            req.pipe(fs.createWriteStream(`${diretorio}/${nomeArquivo}`))
               .on('finish', function(){
                console.log('Arquivo salvo');
                res.status(201).send('OK');
            });
    });

}