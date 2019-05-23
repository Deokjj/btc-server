const express = require('express');
const router = express.Router();
const request = require('request');


/* get currency rates  */
// request body must look like 
// {
// 	"currency" : "BTC",
// 	"ratesFor" : ["USD","CAD"]
// }
router.post('/currency',(req,res,next) => {
  //Base currency
  const {currency, ratesFor} = req.body;
  
  //Do a HTTP request to coinbase API to get currencies
  request(`https://api.coinbase.com/v2/exchange-rates${(currency ? '?currency=BTC' : '')}`, { json: true }, (err, coinbaseRes, body) => {
    if (err) { res.status(400).json({error:err}); }
    
    //Get only the rates requested
    const result = {};
    const rates = body['data']['rates'];
    ratesFor.forEach((key) => {
      result[key] = rates[key];
    });
    
    //Response with the rates
    res.status(201).json(result);
  });
  
});

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

