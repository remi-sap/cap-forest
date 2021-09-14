
const cds = require("@sap/cds");
const hdbext = require("@sap/hdbext")
const dbClass = require("sap-hdbext-promisfied")

let db = null
let dbConn = null 
let sp_checkWildLifeSanctuary = null 

//Raise an exception
class HarvestInWildLifeSanctuaryException {
    constructor(msg) {
        this.message = 'Harvesting in this location and date infringes the sanctuary "' + msg + '"';
        this.toString = function () {
            return this.message;
        };
    }
}

async function checkWildLifeSanctuary(geom, dt){
    console.log('checking wildlife sanctuary');
    //On first call, open the connection and prepare the procedure.
    if (db==null){
        db = await cds.connect.to('db');
        dbConn = new dbClass(await dbClass.createConnection(db.options.credentials))
        console.log('binding with proc "checkWildLifeSanctuary"');
        sp_checkWildLifeSanctuary= await dbConn.loadProcedurePromisified(hdbext, null, 'checkWildLifeSanctuary')
    }
    let response=null;

    
    const output = await dbConn.callProcedurePromisified(sp_checkWildLifeSanctuary, [geom, dt ])
    //console.log('db result', output)
    response = output['outputScalar']['LABEL_SANCTUARY'];
    if (response!=null){
        throw new HarvestInWildLifeSanctuaryException(response);
    }
    return response;

}

module.exports['checkWildLifeSanctuary']=checkWildLifeSanctuary;