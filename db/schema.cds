namespace com.test.forest;


entity Warehouse {
  key ID   : Integer;
  label    :   String(111) not null;
  surface  :   Integer;
  address:  String(300) not null;
  //The fields below will be filled automatically if a valid address is provided
  geo_score:   Double;
  geo_point : hana.ST_POINT;
  geo_city:    String(200);
  geo_county:  String(200);
  geo_country_iso3:  String(3);
}

entity PowerLine {
  key ID   : Integer64;
  geom : hana.ST_GEOMETRY;
}

entity WildLifeSanctuary {
  key ID: Integer;
  label : String(255) not null;
  DT_begin : Date;
  DT_end : Date;
  geom  : hana.ST_GEOMETRY;
}

entity HarvestingBlock {
  key ID: Integer;
  dt:     Date not null;
  geom :  hana.ST_GEOMETRY null;
  valid:  String null;    
  geom_as_wkt: LargeString null; 
}


