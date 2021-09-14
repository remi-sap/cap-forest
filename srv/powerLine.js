const cds = require("@sap/cds");
const hdbext = require("@sap/hdbext")
const dbClass = require("sap-hdbext-promisfied")

let db = null
let dbConn = null 
let sp_minDistanceToPowerLine = null 
let sp_geomDistanceToPowerLine = null 

async function minDistanceToPowerLine(x,y){
    let distance = -1.
    //only for the first call
    if (db==null){
        db = await cds.connect.to('db')
        dbConn = new dbClass(await dbClass.createConnection(db.options.credentials))
    }
    if (sp_minDistanceToPowerLine==null){
        sp_minDistanceToPowerLine= await dbConn.loadProcedurePromisified(hdbext, null, 'minDistanceToPowerLine')
    }
    try{
        const output = await dbConn.callProcedurePromisified(sp_minDistanceToPowerLine, [x, y ])
        distance = output['outputScalar']['MIN_DISTANCE_METER'];

        return distance
    } catch (error) {
            console.error(error)
            return null
    }
}

//Create an exception
function HarvestNearPowerLine() {
  this.message = 'Harvesting in this location cuts a power line.';
  this.toString = function() {
    return this.message;
  };
}
async function geomDistanceToPowerLine(geom){
    let distance = -1.0
    //only for the first call
    if (db==null){
        db = await cds.connect.to('db')
        dbConn = new dbClass(await dbClass.createConnection(db.options.credentials))
    }
    if (sp_geomDistanceToPowerLine == null){
        sp_geomDistanceToPowerLine= await dbConn.loadProcedurePromisified(hdbext, null, 'geomDistanceToPowerLine')
    }
    
    console.log('checking distance to powerLine');
    const output = await dbConn.callProcedurePromisified(sp_geomDistanceToPowerLine, [ geom ])
    distance = output['outputScalar']['MIN_DISTANCE_METER'];

    //if the distance to a power line is 10 centimeters or less:
    if (distance<=0.1){
        throw new HarvestNearPowerLine();
    }
    return distance
    
}


async function isDangerous(x,y){
    let distance = await minDistanceToPowerLine(x,y)
    if (distance == -1)
        return -1
    if(distance <200) //2 -> very close
        return 2
    if(distance <400) //1 -> nearby 
        return 1
    return 0
}

module.exports['minDistance']=minDistanceToPowerLine;
module.exports['isDangerous']=isDangerous;
module.exports['geomDistanceToPowerLine']=geomDistanceToPowerLine;