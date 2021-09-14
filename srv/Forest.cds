using { com.test.forest as my } from '../db/schema';

service ForestService  {

   entity Warehouse as SELECT from my.Warehouse ;
   entity HarvestingBlock as SELECT from my.HarvestingBlock ;

   /*
   function minDistanceToPowerLine(x:Double, y:Double) returns Double;
   function isDangerous(x:Double, y:Double) returns Integer;
   function checkWildLifeSanctuary(geom:String, dt:String ) returns String;
   */
}