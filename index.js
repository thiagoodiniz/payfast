
var app = require('./config/custom-express')();

app.listen(2000, function(){
    console.log('Servidor rodando na porta 2000');
});

