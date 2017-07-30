// @flow

const httpMiddleware = (req: $Request, res: $Response, next: express$NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Accept, X-Access-Token, X-Access-Gatekey, X-Key, Content-Type, Content-Length');
    next();
}

export default httpMiddleware;