var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy');


var selects = [];
var simpleselect = {};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

simpleselect.query = '.displayed_wireline_text';
simpleselect.func = function (node) {
    node.createWriteStream().end('<div>----</div>');
}

selects.push(simpleselect);

//
// Basic Connect App
//
var app = connect();

var proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    autoRewrite: true,
    toProxy: true,
    target: 'https://gismaps.verizon.com/map4'
})

proxy.on('proxyReq', (proxyReq, req, res, options) => {
    if (proxyReq.path === '/map4/') {
        proxyReq.path += '?viewName=ui_fiveg&amp;token=kxkm4wMaR6BM2xU7kQ7R+ybRo5galzYFZ2b7NgQxZYEHjeE/Yv91f';
    }

    if(proxyReq.path.match('.otf')) {
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
        proxyReq.setHeader('Accept-Language', 'en-AU,en-US;q=0.9,en;q=0.8,en-IN;q=0.7');
        proxyReq.setHeader('Cache-Control', 'no-cache');
        proxyReq.setHeader('Host', 'gismaps.verizon.com');
        proxyReq.setHeader('Origin', 'https://gismaps.verizon.com');
        proxyReq.setHeader('Referer', 'https://gismaps.verizon.com/map4/static/css/main.7e57792a.css');
    }
    console.log(proxyReq.path);
})

var proxyMap = httpProxy.createProxyServer({
    changeOrigin: true,
    autoRewrite: true,
    toProxy: true,
    target: 'https://api.mapbox.com/v4/'
})

proxyMap.on('proxyReq', (proxyReq, req, res, options) => {
    proxyReq.setHeader('Accept', 'application/json');
    proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
    proxyReq.setHeader('Accept-Language', 'en-AU,en-US;q=0.9,en;q=0.8,en-IN;q=0.7');
    proxyReq.setHeader('Cache-Control', 'no-cache');
    proxyReq.setHeader('Host', 'api.mapbox.com');
    proxyReq.setHeader('Origin', 'https://gismaps.verizon.com');
    proxyReq.setHeader('Referer', 'https://gismaps.verizon.com/');
    proxyReq.path = req.url.replace('/', '');
    proxyReq.path = proxyReq.path.replace('?path=', '');

    if(!proxyReq.path.match('https://api.mapbox.com')) {
        proxyReq.path = 'https://api.mapbox.com' + req.url;
    }
    console.log(proxyReq.path);
})

//Additional true parameter can be used to ignore js and css files.
//app.use(require('../')([], selects, true));

app.use('/map', function (req, res) {
    proxyMap.web(req, res);
});

app.use(function (req, res) {
    proxy.web(req, res);
});

http.createServer(app).listen(8000);
