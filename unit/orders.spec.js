const { getOrders, getOrdersById, postOrders, putOrders, deleteOrders } = require('../controllers/orders')
const { postProduct } = require('../controllers/products')
const mongoose = require('mongoose')
    //const Users = require('../models/modelUsers');
const { MongoMemoryServer } = require('mongodb-memory-server');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;
let port;

beforeEach(async() => {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
    mongoServer = new MongoMemoryServer();
    port = await mongoServer.getPort();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, (err) => {
        if (err) console.error(err);
    });
});


const requestOfPostProduct = {
    headers: '',
    body: {
        name: 'cafe con leche',
        price: '3',
        type: 'desayuno',
    }
};
const requestOfPostOrders = {
    headers: {
        authorization: '',
        user: {
            _id: '5d4916541d4f9a3b2dcac66d',
            email: 'admin@localhost',
            password: 'changeme',
            roles: { admin: true }
        }
    },
    body: {
        userId: '5d4916541d4f9a3b2dcac66d',
        client: 'Maria',
        products: [{ qty: 5 }]
    }
}
const requestEmptyPostOrders = {
    headers: {
        authorization: '',

    },
    body: {
        userId: '5d4916541d4f9a3b2dcac66d',
        products: []
    }
}


describe('POST/ orders', () => {
    const resp = {
        send: jest.fn(json => json),
    };

    const next = jest.fn(json => json);

    it('Debería crear una nueva orden', async() => {
        const createdProduct = await postProduct(requestOfPostProduct, resp, next);
        requestOfPostOrders.body.products[0].product = createdProduct._id;
        await postOrders(requestOfPostOrders, resp, next);
        expect(resp.send.mock.results[1].value).toHaveProperty('_id');
        expect(resp.send.mock.results[1].value).toHaveProperty('status', 'pending');
        expect(resp.send.mock.results[1].value).toHaveProperty('userId', '5d4916541d4f9a3b2dcac66d');
    });
    it('Debería retornar 400 si no se ingresan datos', async() => {
        await postOrders(requestEmptyPostOrders, resp, next);
        expect(next.mock.calls[0][0]).toBe(400);
    });
});

describe('GET/orders', () => {
    beforeEach(async() => {
        const resp1 = {
            send: jest.fn(json => json),
        };
        const next = jest.fn(json => json);
        const createdProduct = await postProduct(requestOfPostProduct, resp1, next);
        requestOfPostOrders.body.products[0].product = createdProduct._id;
        const resp2 = {
            send: jest.fn(json => json),
        };
        await postOrders(requestOfPostOrders, resp2, next);
        //console.log(order)
    })


    it('Debería obtener un array con las ordenes', async() => {
        const requestOfGetOrders = {
            headers: {
                authorization: '',
            },
            query: {
                limit: 10,
                page: 1
            },
            protocol: 'http',
            get: jest.fn(res => `localhost:${port}`),
            path: '/orders',
        }

        const resp = {
            send: jest.fn(json => json),
            set: jest.fn(json => json)
        };
        const next = jest.fn(json => json);
        await getOrders(requestOfGetOrders, resp, next);
        expect(resp.send.mock.calls.length).toBe(1)
    })
})

describe('GET/orders/:orderid', () => {
    let mockId = ''
    beforeEach(async() => {
        const resp1 = {
            send: jest.fn(json => json),
        };
        const next = jest.fn(json => json);
        const createdProduct = await postProduct(requestOfPostProduct, resp1, next);
        requestOfPostOrders.body.products[0].product = createdProduct._id;
        const resp2 = {
            send: jest.fn(json => json),
        };
        await postOrders(requestOfPostOrders, resp2, next);
        mockId = resp2.send.mock.calls[0][0]
    })


    it('Debería retornar la orden llamada por su Uid', async() => {
        const objOrden = {
            userId: '5d4916541d4f9a3b2dcac66d',
            client: 'Maria',
        }
        const requestOfGetOrderByUid = {
            headers: {
                authorization: ''
            },
            params: {
                orderid: mockId._id.toString(),
            }
        }

        const resp = {
            send: jest.fn(json => json),
        };
        const next = jest.fn(json => json);
        await getOrdersById(requestOfGetOrderByUid, resp, next);
        expect(resp.send.mock.results[0].value).toMatchObject(objOrden);
    })
});


describe('DELETE/orders:orderid', () => {
    let mockId = ''
    beforeEach(async() => {
        const resp1 = {
            send: jest.fn(json => json),
        };
        const next = jest.fn(json => json);
        const createdProduct = await postProduct(requestOfPostProduct, resp1, next);
        requestOfPostOrders.body.products[0].product = createdProduct._id;
        const resp2 = {
            send: jest.fn(json => json),
        };
        await postOrders(requestOfPostOrders, resp2, next);
        mockId = resp2.send.mock.calls[0][0]
    })

    it('Debería eliminar una orden con su respectivo id', async() => {

        const requestOfDelete = {
            headers: {
                authorization: ''
            },
            params: {
                orderid: mockId._id.toString(),
            }
        }

        const resp = {
            send: jest.fn(json => json)
        };


        const next = jest.fn(json => json);


        await deleteOrders(requestOfDelete, resp, next)
        expect(resp.send.mock.calls[0][0]).toEqual({ message: 'Se borro satisfactoriamente!' });

    })
    it('Debería retornar 404 cuando no existe el id requerido', async() => {
        const requestOfDelete = {
            headers: {
                authorization: ''
            },
            params: {
                orderid: 'failabc',
            }
        }
        const resp = {
            send: jest.fn(json => json)
        };
        const next = jest.fn(json => json)

        await deleteOrders(requestOfDelete, resp, next)
        expect(next.mock.calls[0][0]).toBe(404);
    })
})
const requestOfPostOrdersPut = {
    headers: {
        authorization: '',
        user: {
            _id: '5d4916541d4f9a3b2dcac66d',
            email: 'admin@localhost',
            password: 'changeme',
            roles: { admin: true }
        }
    },
    body: {
        userId: '5d4916541d4f9a3b2dcac66d',
        client: 'Mayte',
        products: [{ qty: 3 }]
    }

}

const requestOfPostProductOfPut = {
    headers: '',
    body: {
        name: 'productToOrder',
        price: '5',
        type: 'breakfast',
    },
};


describe('PUT/ orders:orderid', () => {
    let mockId = '';
    let createdProduct;

    beforeEach(async() => {
        const resp1 = {
            send: jest.fn(json => json),
        };
        const next = jest.fn(json => json);
        createdProduct = await postProduct(requestOfPostProduct, resp1, next);
        requestOfPostOrders.body.products[0].product = createdProduct._id;
        const resp2 = {
            send: jest.fn(json => json),
        };
        await postOrders(requestOfPostOrders, resp2, next);
        mockId = resp2.send.mock.calls[0][0]
    })

    it('Debería editar una orden con su respectivo id', async() => {
        const requestOfPutOrders = {
            headers: {
                authorization: '',
                user: {
                    _id: '5d4916541d4f9a3b2dcac66d',
                    email: 'admin@localhost',
                    roles: { admin: true }
                }
            },
            body: {
                status: 'delivered',
                userId: '5d4916541d4f9a3b2dcac66d',
                client: 'Juana',
                products: [{ product: createdProduct._id, qty: 1 }]
            },
            params: {
                orderid: mockId,
            }
        };

        const resp = {
            send: jest.fn(json => json)
        };

        const next = jest.fn(json => json);

        await putOrders(requestOfPutOrders, resp, next);
        expect(resp.send.mock.calls[0][0]).toHaveProperty('status', 'delivered');
        expect(resp.send.mock.calls[0][0]).toHaveProperty('client', 'Juana');
        expect(resp.send.mock.calls[0][0]).toHaveProperty('dateProcessed');
    })
    it('Debería retornar 400 si no se ingresan datos', async() => {
        const requestEmptyPutOrders = {
            headers: {
                authorization: '',

            },
            body: {},
            params: {
                orderid: mockId,
            }
        }
        const resp = {
            send: jest.fn(json => json)
        };

        const next = jest.fn(json => json);
        await putOrders(requestEmptyPutOrders, resp, next);
        expect(next.mock.calls[0][0]).toBe(400);
    });
    it('Debería retornar 404 si el id es incorrecto', async() => {
        const requestBadId = {
            headers: {
                authorization: '',

            },
            body: {
                status: 'preparing'
            },
            params: {
                orderid: 'asdfghjklñ',
            }
        }
        const resp = {
            send: jest.fn(json => json)
        };

        const next = jest.fn(json => json);
        await putOrders(requestBadId, resp, next);
        expect(next.mock.calls[0][0]).toBe(404);
    });
    it('Debería retornar 404 si la orden es cancelada', async() => {
        const requestCanceled = {
            headers: {
                authorization: '',

            },
            body: {
                status: 'canceled'
            },
            params: {
                orderid: mockId,
            }
        }
        const resp = {
            send: jest.fn(json => json)
        };

        const next = jest.fn(json => json);
        await putOrders(requestCanceled, resp, next);
        expect(next.mock.calls[0][0]).toBe(404);
    });
    it('Debería retornar 400 si se ingresa un estado no válido', async() => {
        const requestBadStatus = {
            headers: {
                authorization: '',

            },
            body: {
                status: 'oh Yeah!'
            },
            params: {
                orderid: mockId,
            }
        }
        const resp = {
            send: jest.fn(json => json)
        };

        const next = jest.fn(json => json);
        await putOrders(requestBadStatus, resp, next);
        expect(next.mock.calls[0][0]).toBe(400);
    });
})




/*

    const next = jest.fn(json => json);

    it('Debería traer una nueva orden', async() => {
        const createdProduct = await postProduct(requestOfPostProduct, resp, next);

        requestOfPostOrders.body.products[0].product = createdProduct._id;
        requestOfPostOrders2.body.products[0].product = createdProduct._id;
        const createOrder1 = await postOrders(requestOfPostOrders, resp, next);
        const createOrder2 = await postOrders(requestOfPostOrders2, resp, next);

        let responseOfGetOrder = [];
        responseOfGetOrder.push(createOrder1, createOrder2)
        const functTest = await getOrders(requestOfGetOrders, resp, next)
        resp.send.mockReturnValue(functTest)
        expect(resp.send()).toEqual(responseOfGetOrder);
    });
}); */


/* 
describe('POST/orders', () => {
    let mockUid = '';
    beforeAll(async() => {
       
        mockUid = resp.send.mock.calls[0][0]._id
    })
    console.log(mockUid)

    it('Debería crear una nueva orden', async() => {
        /*   const obj = {
              client: 'Maria',
              status: 'pending',
              userId: 'abc',
          };

          const requestOfPostOrders = {
              headers: {
                  authorization: '',
              },
              body: {
                  userId: 'abc',
                  client: 'Maria',
                  products: [{ product: mockUid, qty: 5 }]
              }
          }

          const resp = {
              send: jest.fn(json => json)
          };

          const next = jest.fn(code => code);

          await postOrders(requestOfPostOrders, resp, next);
          expect(resp.send.mock.calls[0][0]).toMatchObject(obj);
    })
    ;
}); */