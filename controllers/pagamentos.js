const PAGAMENTO_CRIADO = "CRIADO";
const PAGAMENTO_CONFIRMADO = "CONFIRMADO";
const PAGAMENTO_CANCELADO = "CANCELADO";

module.exports = function(app){
        
    app.get('/pagamentos', function(req, res){
      console.log('Recebida requisicao de teste na porta 3000.')
      res.status(200).send([{testek: 'OK'}]);
    });
  
    // Inserir um pagamento
    app.post('/pagamentos/pagamento', function(req, res){
        var body = req.body;
        var pagamento = body['pagamento'];
        console.log(pagamento);

        req.assert("pagamento.forma_pagamento", "Forma de pagamento é obrigatório").notEmpty();
        req.assert("pagamento.valor", "Valor é obrigatorio e deve ser um decimal").isFloat();
        req.assert("pagamento.moeda", "Moeda é obrigatória e deve ter 3 caracteres").len(3,3);

        var erros = req.validationErrors();
    
        if (erros){
            console.log('Erros de validacao encontrados');
            res.status(400).send(erros);
            return;
        }
    
        console.log('processando uma requisicao de um novo pagamento');
    
        pagamento.status = PAGAMENTO_CRIADO;
        pagamento.data = new Date();
    
        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    
        pagamentoDao.salva(pagamento, function(erro, resultado){
            if(erro){
                console.log('Erro ao inserir no banco:' + erro);
                res.status(500).send(erro);
            } else {
                pagamento.id = resultado.insertId;
                console.log('pagamento criado'); 

                if(pagamento.forma_pagamento == 'cartao'){
                    var cartao = body.cartao;
                    var cartaoClient = new app.servicos.cartoesClient();
                    
                    cartaoClient.autoriza(cartao,
                        function(exception, request, response, retorno){
                          if(exception){
                            console.log(exception);
                            res.status(400).send(exception);
                            return;
                          }
                          console.log(retorno);
            
                          res.location('/pagamentos/pagamento/' +
                                pagamento.id);
            
                          var response = {
                            dados_do_pagamanto: pagamento,
                            cartao: retorno,
                            links: [
                              {
                                href:"http://localhost:3000/pagamentos/pagamento/"
                                        + pagamento.id,
                                rel:"confirmar",
                                method:"PUT"
                              },
                              {
                                href:"http://localhost:3000/pagamentos/pagamento/"
                                        + pagamento.id,
                                rel:"cancelar",
                                method:"DELETE"
                              }
                            ]
                          }
            
                          res.status(201).json(response);
                          return;
                    });
                }else{
                    res.location('/pagamentos/pagamento/' +
                    pagamento.id);

                    var response = {
                        dados_do_pagamento: pagamento,
                        links: [
                            {
                                href: `http://localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                                rel: 'CONFIRMAR',
                                method: 'PUT'
                            },
                            {
                                href: `http://localhost:3000/pagamentos/pagamento/${pagamento.id}`,
                                rel: 'CANCELAR',
                                method: 'DELETE'
                            }
                        ]
                    }    

                    res.status(201).json(response);
                }
            }
        });
    });

    // CONFIRMAR PAGAMENTO
    app.put('/pagamentos/pagamento/:id', function(req, res){
      
            var pagamento = {};
            var id = req.params.id;

            pagamento.id = id;
            pagamento.status = PAGAMENTO_CONFIRMADO;

            var connection = app.persistencia.connectionFactory();
            var pagamentoDao = new app.persistencia.PagamentoDao(connection);

            pagamentoDao.atualiza(pagamento, function(erro){
                if(erro){
                    console.log(erro);
                    res.status(500).send(erro);
                    return;
                }

                console.log('Pagamento confirmado');
                res.send(pagamento);

            });
    });

    // CANCELAR PAGAMENTO
    app.delete('/pagamentos/pagamento/:id', function(req, res){
      
        var pagamento = {};
        var id = req.params.id;
        console.log(req.params);

        pagamento.id = id;
        pagamento.status = PAGAMENTO_CANCELADO;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.atualiza(pagamento, function(erro){
            if(erro){
                console.log(erro);
                res.status(500).send(erro);
                return;
            }

            console.log('Pagamento cancelado');
            res.status(204).send(pagamento);

        });
    });

        // CONSULTAR PAGAMENTO POR ID
        app.get('/pagamentos/pagamento/:id', function(req, res){
            var id = req.params.id;
            console.log(`Consultando pagamento de id: ${id}`);
    
            var connection = app.persistencia.connectionFactory();
            var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    
            pagamentoDao.buscaPorId(id, function(erro, resultado){
                if(erro){
                    console.log(`Erro ao consultar o pagamento: ${erro}`);
                    res.status(500).send(erro);
                    return;
                }
                if(resultado.length < 1){
                    console.log(`Pagamento de id ${id} não encontrado.`);
                    res.status(404).send(resultado);
                    return;
                }
                
                console.log('Pagamento encontrado: ' + JSON.stringify(resultado));
                res.send(resultado);
    
            });
        });

        app.get('/pagamentos/lista', function(req, res){
            console.log('Buscando lista de pagamentos...');
            var connection = app.persistencia.connectionFactory();
            var pagamentoDao = new app.persistencia.PagamentoDao(connection);

            pagamentoDao.lista(function(erro, resultado){
                if(erro){
                    console.log('Erro ao buscar a lista de pagamentos');
                    console.log(erro);
                }

                console.log(`${resultado.length} itens encontrados`);
                //TESTAR LOADINGsetTimeout(()=>{
                    res.send(resultado);
                //},1000);
                

            });

        });
}
  