const cds = require("@sap/cds");
var wkx = require('wkx');

const geo=require("./heregeocode");
const pl=require("./powerLine");
const wild=require("./wildlife");

module.exports = cds.service.impl(async function () {

    //Upon insertion, the address is geocoded into coordinates and fields such as country and region are filled.
    this.before("CREATE", 'Warehouse', async (req) => {
        if (req.data.address != undefined){
            //call geocoding !
            var g = await geo.geocode(req.data.address);
            //update the object with the additional fields
            req.data=Object.assign(req.data, g);

        }
    });
    
    //convert HANA Point into geo json
    this.after("READ", 'Warehouse', async (w) => {
        if (Array.isArray(w)){
            for (let e of w){
                if (e.geo_point != undefined){
                    const geom= wkx.Geometry.parse(e.geo_point);
                    e.geo_point={
                        type:'Point',
                        coordinates:[geom.x, geom.y]
                    }
                }
            }            
        }else{
            if (w!= null && w.geo_point != undefined){
                    const geom= wkx.Geometry.parse(w.geo_point);
                    w.geo_point={
                        type:'Point',
                        coordinates:[geom.x, geom.y]
                    }
            }            
        }
    });
  
    /* Validate Harvesting Block according to the following rules:
      - Wildlife sanctuaries are not to be disturbed during certain season
      - dont cut power lines
    */
    this.before("CREATE", 'HarvestingBlock', async (req) => {
        
        if (req.data.geom_as_wkt != undefined){
            //console.log('Polygon of the harvesting block', req.data.geom_as_wkt);
            let geom=wkx.Geometry.parse(req.data.geom_as_wkt);

            console.log('Starting harvesting Block validations.');
            let res = await Promise.all([
                wild.checkWildLifeSanctuary(req.data.geom_as_wkt, req.data.dt),
                pl.geomDistanceToPowerLine(req.data.geom_as_wkt)
            ])
            console.log('Harvesting Block Validation results ', res);
        
            //var wktbinary = new wkx.Geometry.parseGeoJSON(req.data.geom).toWkb();
            delete req.data.geom_as_wkt;
            req.data.geom = geom.toWkb();
        }else{
            console.log('skipping the validation the the harvesting block')
        }
    });
    
    //convert HANA geometry in binary into readable geo json
    
    this.after("READ", 'HarvestingBlock', async (w) => {
        if (Array.isArray(w)){
            //console.log('mass conversion of harvesting blocks ',w)
            for (let e in w){
                if (w[e].geom != undefined){
                    const g= wkx.Geometry.parse(w[e].geom).toGeoJSON();
                    //console.log('conversion ', g)
                    w[e].geom ={"type":g['type'], "coordinates":g['coordinates']}
                }
                delete w[e].geom_as_wkt;
                //delete w[e].geom;
            }            
        }else{
            //console.log('single conversion of harvesting blocks ',w)
            if (w.geom != undefined){
                const g= wkx.Geometry.parse(w.geom);
                w.geom={type:g.type, coordinates:g.coordinates}
            }            
        }
    });
    
});
