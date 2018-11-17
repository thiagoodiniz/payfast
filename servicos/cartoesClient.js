let restify = require('restify');
let clients = require('restify-clients');

function cartoesClient(){
    this._cliente = clients .createJsonClient({
        url:'http://localhost:3001',
        version: '~1.0'
      });      
}

cartoesClient.prototype.autoriza = function(cartao, callback){
    this._cliente.post('/cartoes/autoriza', cartao, callback)
}

module.exports = function(){
    return cartoesClient;
}