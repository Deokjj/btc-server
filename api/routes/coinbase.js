const express = require('express');
const router = express.Router();
const request = require('request');
require('dotenv').config();

const Client = require('coinbase').Client;
const client = new Client({'apiKey': process.env.COINBASE_API_KEY, 
                         'apiSecret': process.env.COINBASE_API_SECRET});

/* get currency rates  */
// request with Coinbase API instead of directly requesting via HTTP
// when app is deployed, direct HTTP requests are denied by Coinbase.
router.post('/currency',(req,res,next) => {
  //Base currency
  const {currency, ratesFor} = req.body;
  
  client.getExchangeRates({'currency': 'BTC'},(err, coinbaseRes) => {
    if(err) { res.status(400).json({error:err}); }
    
    //Get only the rates Requested
    const result = {};
    if(coinbaseRes && coinbaseRes.hasOwnProperty('data') && coinbaseRes['data'].hasOwnProperty('rates')){
      const rates = coinbaseRes['data']['rates'];
      ratesFor.forEach((key) => {
        result[key] = rates[key];
      });

      //Response with the rates
      res.status(201).json(result);
    }
    else{
      console.log("body was not returned properly");
      res.status(503).json({
        body : body
      });
    }
  });
});

/* get currency rates  */
// request body must look like 
// {
// 	"currency" : "BTC",
// 	"ratesFor" : ["USD","CAD"]
// }
// router.post('/currency',(req,res,next) => {
//   //Base currency
//   const {currency, ratesFor} = req.body;
// 
//   //Do a HTTP request to coinbase API to get currencies
//   request(`https://api.coinbase.com/v2/exchange-rates${(currency ? '?currency=BTC' : '')}`, { json: true }, 
//   (err, coinbaseRes, body) => {
//     if (err) { res.status(400).json({error:err}); }
// 
//     //Get only the rates requested
//     const result = {};
//     if(body && body.hasOwnProperty('data') && body['data'].hasOwnProperty('rates')){
//       const rates = body['data']['rates'];
//       ratesFor.forEach((key) => {
//         result[key] = rates[key];
//       });
// 
//       //Response with the rates
//       res.status(201).json(result);
//     }
//     else{
//       console.log("body was not returned properly");
//       res.status(503).json({
//         body : body
//       });
//     }
//   });
// 
// });

router.get('/price/:conversion',(req,res,next) => {
  console.log(req.params.conversion);
  const conversion = req.params.conversion;
  request(`https://api.coinbase.com/v2/prices/${conversion}/buy`,
      { json: true },
      (err,coinbaseRes,body) => {
    if (err) { res.status(400).json({error:err}); }
  
    res.status(200).json(body['data']['amount']);
  });
});

module.exports = router;

