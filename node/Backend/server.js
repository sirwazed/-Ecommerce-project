require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');
const authorize = require('./_helpers/authorize');
const config = require('./config.json');
const Role = require('./_helpers/role');
const { Socket } = require('socket.io');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// api routes
app.use('/users', require('./users/users.controller'));
app.use('/products', require('./products/products.controller'));
app.use('/cart', require('./cart/cart.controller'));

app.get('/',(req,res)=>{
    res.send('youre on home');
})

app.post('/send-notification/:id',authorize(Role.Admin),(req,res)=>{
    const notify = {
        id: req.params.id,
        data: req.body   
    };
    socket.emit('notification', notify);
    res.send(notify);
})

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
const server = app.listen(process.env.PORT || 4000, function () {
    console.log('Server listening on port ' + port);
});

const socket = require('socket.io')(server,{
    cors: {
        origin: 'http://localhost:4200',
        credentials: true
    }
});

socket.on('connection', io => {
    console.log(`Socket: Client connected = ${socket.engine.clientsCount}`);
    io.on('disconnect', ()=>{
        console.log("disconnect: ",io.id);
    })
})