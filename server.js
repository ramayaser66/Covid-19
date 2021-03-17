'use strict';

// implementing libraries 
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superAgent = require('superagent');
const methodOverride = require("method-override"); 




// config

require('dotenv').config();
const app = express();
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL; 


// const client = new pg.Client(process.env.DATABASE_URL);   // on your machine


const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); 


// end-points

app.get('/', handelHome); 
app.get('/getCountryResult', habdelResults);
app.get('/allCountries', handelAllCountries);
app.post('/myRecords', addRecordsToDB); 
app.get('/myRecords', getRecordsFromDB); 
app.get('/myRecords/:id', handelDetails);
app.delete('/myRecords/:id', handelDeleteDetails);




// handlers

function handelHome(req, res){
    let url = 'https://api.covid19api.com/world/total'; 
    superAgent.get(url).then(data =>{
        // console.log(data.body); 

        res.render('pages/index',  {data : data.body}); 

    }).catch(error =>{
        console.log('an error occurred getting data for homepage ..'+ error);
    });

}


function habdelResults(req, res){
    let country = req.query.country;
    let from = req.query.from;
    let to = req.query.to;

    // console.log(country, from, to);

    let url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`;
    superAgent.get(url).then(data =>{
        
    let array = [];
    data.body.forEach(element => {
        let country = element.Country;
        let date = element.Date; 
        let cases = element.Cases; 

        var newObj = new  Covid(country, date, cases);
        array.push(newObj);
        
    });
    res.render('pages/getCountryResult', {data : array});

        
    }).catch(error =>{
        console.log('an error occurred getting data2 for homepage..'+ error);
    });
}


function handelAllCountries(req, res){
    let url = 'https://api.covid19api.com/summary';
    superAgent.get(url).then(data =>{
        // console.log(data.body.Countries); 
        let myData = data.body.Countries;
        let array = [];
        myData.forEach(element =>{
            // Total Confirmed Cases, Total Deaths Cases, Total Recovered Cases, Date,

            let country = element.Country;
            let totalconfirmed = element.TotalConfirmed;
            let totaldeaths = element.TotalDeaths;
            let totalrecovered = element.TotalRecovered;
            let date = element.Date; 

            var newObj = new Countries(country, totalconfirmed, totaldeaths, totalrecovered, date); 

            array.push(newObj); 
        });

        res.render('pages/allCountries', {data : array});

    }).catch(error =>{
        console.log('an error occurred getting all countries'+ error);
    });
}

 function addRecordsToDB(req, res){
     let data = req.body; 
    //  console.log(data.body); 
     let sql = 'INSERT INTO country (country, totalconfirmed, totaldeaths,totalrecovered, date) VALUES($1, $2, $3, $4, $5) RETURNING *;'; 
     let safeValues = [data.country, data.totalconfirmed, data.totaldeaths, data.totalrecovered, data.date]; 
     client.query(sql, safeValues).then(data =>{
         res.render('pages/myRecords'); 

     }).catch(error =>{
        console.log('an error occurred inserting into DB'+ error);
    });
}

function getRecordsFromDB(req, res){
    let data = req.body; 
    let sql = 'SELECT * FROM country;';

    client.query(sql).then(data =>{
        console.log(data.rows); 
        res.render('pages/myRecords', {data : data.rows}); 

  }).catch(error =>{
        console.log('an error occurred getting data from DB'+ error);
    });

}

function handelDetails(req, res){
    let id = req.params.id; 
    let sql = 'SELECT * FROM country WHERE id=$1';
    let value = [id];
    client.query(sql, value).then(data =>{
        res.render('pages/myDetails', {data : data}); 

    }).catch(error =>{
        console.log('an error occurred getting data from DB2'+ error);
    });
}

function handelDeleteDetails(req, res){
    let id = req.params.id; 
    let sql = 'DELETE  FROM country WHERE id=$1;';
    let value = [id];
    client.query(sql, value).then(data =>{
        res.render('pages/myRecords'); 

    }).catch(error =>{
        console.log('an error occurred getting data from DB2'+ error);
    });
}


 

// constructors 

function Covid(country, date, cases){
    this.country = country;
    this.date = date;
    this.cases = cases; 

}

function Countries(country, totalconfirmed, totaldeaths, totalrecovered, date){
    this.country = country; 
    this.totalconfirmed =  totalconfirmed;
    this.totaldeaths = totaldeaths;
    this.totalrecovered = totalrecovered;
    this.date = date? date :  'NO AVAILABLE RECORDS'; 

}


client.connect().then(()=>{
    app.listen(PORT, ()=>{
        console.log('app is listening to port.... '+ PORT); 
    });  

}).catch(error =>{
    console.log('an error occurred listening to prot...'+ prot)

});








