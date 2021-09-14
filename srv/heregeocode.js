const g = require('got');
var fs = require('fs');
var env = JSON.parse(fs.readFileSync('../.env.json', 'utf8'));

const here_api_key=env['here_api_key'];
const url_prefix='https://geocode.search.hereapi.com/v1/geocode?apiKey=' + here_api_key + '&q=' ;

var wkx = require('wkx');

async function geocode2(address){
    try {
        const response = await g.get(url_prefix+address).json();
        //console.log(response);
        if (response.items.length>0){
            const e = response.items[0];
            return {geo_score: e['scoring']['queryScore'],
                    geo_city: e['address']['city'],
                    geo_county: e['address']['county'],
                    geo_country_iso3: e['address']['countryCode'],
                    geo_point: new wkx.Point(e['position']['lng'],e['position']['lat']).toWkb()
                   };
        }
        return {geo_score:0};
    } catch (error) {
        console.error(error);
        return {geo_score:-1};
    }
}

module.exports['geocode']=geocode2;