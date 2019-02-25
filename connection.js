let mssql = require("mssql")

let connection = new mssql.ConnectionPool(
    {
        user: "restful_user",
        password: "Abel0op0_o0@",
        server: "185.165.116.47",
        port: "1435",
        database: "injaunja_",
    })
connection.connect(err => err ? console.log(err) : null)

module.exports.connection = connection