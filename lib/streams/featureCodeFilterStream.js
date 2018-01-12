const config = require('pelias-config').generate();
var filter = require('through2-filter');
var _ = require( 'lodash' );
var importVenues = true;

if (_.has(config, 'imports.geonames.importVenues')) {
  importVenues = config.imports.geonames.importVenues;
}

var unwantedFcodes = [
  'RGNE', // economic regions. consists of multiple cities and is unwanted for geocoding
  'ADM1H', // historical
  'ADM2H', // historical
  'ADM3H', // historical
  'ADM4H', // historical
  'ADMDH', // historical
  'PCLH',  // historical
  'RGNH',  // historical
  'PPLCH', // historical
  'PPLH',  // historical
  'PPLQ',  // abandoned places
  'PPLW',  // destroyed place
  'ZN',    // large multi-state regions
  'CONT',  // contenents (currently not supported)
];

// Feature codes corresponding to venues
// http://www.geonames.org/export/codes.html
var venuesFcodes = [
  'ADMF','AGRF','AIRB','AIRF','AIRH','AIRP','AIRQ','AMTH','ANS','AQC','ARCH','ASTR',
  'ASYL','ATHF','ATM','BANK','BCN','BDG','BDGQ','BLDG','BLDO','BP','BRKS','BRKW','BSTN',
  'BTYD','BUR','BUSTN','BUSTP','CARN','CAVE','CH','CMP','CMPL','CMPLA','CMPMN',
  'CMPO','CMPQ','CMPRF','CMTY','COMC','CRRL','CSNO','CSTL','CSTM','CTHSE','CTRA','CTRCM',
  'CTRF','CTRM','CTRR','CTRS','CVNT','DAM','DAMQ','DAMSB','DARY','DCKD','DCKY','DIKE','DIP',
  'DPOF','EST','ESTO','ESTR','ESTSG','ESTT','ESTX','FCL','FNDY','FRM','FRMQ','FRMS','FRMT',
  'FT','FY','GATE','GDN','GHAT','GHSE','GOSP','GOVL','GRVE','HERM','HLT','HMSD','HSE','HSEC',
  'HSP','HSPC','HSPD','HSPL','HSTS','HTL','HUT','HUTS','INSM','ITTR','JTY','LDNG','LEPC','LIBR',
  'LNDF','LOCK','LTHSE','MALL','MAR','MFG','MFGB','MFGC','MFGCU','MFGLM','MFGM','MFGPH','MFGQ',
  'MFGSG','MKT','ML','MLM','MLO','MLSG','MLSGQ','MLSW','MLWND','MLWTR','MN','MNAU','MNC','MNCR',
  'MNCU','MNFE','MNMT','MNN','MNQ','MNQR','MOLE','MSQE','MSSN','MSSNQ','MSTY','MTRO','MUS','NOV',
  'NSY','OBPT','OBS','OBSR','OILJ','OILQ','OILR','OILT','OILW','OPRA','PAL','PGDA','PIER','PKLT',
  'PMPO','PMPW','PO','PP','PPQ','PRKGT','PRKHQ','PRN','PRNJ','PRNQ','PS','PSH','PSTB','PSTC','PSTP',
  'PYR','PYRS','QUAY','RDCR','RECG','RECR','REST','RET','RHSE','RKRY','RLG','RLGR','RNCH',
  'RSD','RSGNL','RSRT','RSTN','RSTNQ','RSTP','RSTPQ','RUIN','SCH','SCHA','SCHC','SCHL','SCHM',
  'SCHN','SCHT','SECP','SHPF','SHRN','SHSE','SLCE','SNTR','SPA','SPLY','SQR','STBL','STDM',
  'STNB','STNC','STNE','STNF','STNI','STNM','STNR','STNS','STNW','STPS','SWT','THTR','TMB',
  'TMPL','TNKD','TOWR','TRANT','TRIG','TRMO','TWO','UNIP','UNIV','USGE','VETF','WALL','WALLA',
  'WEIR','WHRF','WRCK','WTRW','ZNF','ZOO'
]

function filterRecord(data) {
  if(!importVenues) {
    unwantedFcodes = unwantedFcodes.concat(venuesFcodes);
  }
  return !_.includes(unwantedFcodes, data.feature_code);
}

function create() {
  return filter.obj(filterRecord);
}

module.exports = {
  filterRecord: filterRecord,
  create: create
};
