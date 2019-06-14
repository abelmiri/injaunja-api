let jwt = require("jsonwebtoken")
let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const encode = ({payload, response, callback}) =>
{
    jwt.sign(payload, Data.sign, {algorithm: "HS512"}, (err, tkn) =>
    {
        if (!err)
        {
            response.setHeader("Authentication", tkn)
            callback()
        }
        else
        {
            console.log("tError", err)
            callback()
        }
    })
}

const decode = ({token, response, callback, error = -100}) =>
{
    jwt.verify(token, Data.sign, {algorithm: "HS512"}, (err, payload) =>
    {
        if (err)
        {
            response.send({
                state: error,
                log: "TOKEN_IS_NOT_VALID",
                form: err,
            })
        }
        else
        {
            callback(payload)
        }
    })
}

module.exports =
    {
        encode: encode,
        decode: decode,
    }