let mysql = require('mysql');

let pool  = mysql.createPool({
    "host"     : "167.114.153.250",
    "user"     : "agt_admin",
    "password" : "agtADMIN@tga",
    "database" : "authentication",
    "port"     : 3306
});

module.exports = pool;