let mssql = require("mssql")
let Connection = require("../connection")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const add_category = ({user_id, category_id, response}) =>
{
    let user = parseInt(user_id)
    let cat = parseInt(category_id)

    let request = new mssql.Request(Connection.connection)

    request.query(`select categories from users where id = N'${user}'`, (err0, rec0) =>
    {
        if (err0) response.send({state: -5, log: "DATA_BASE_ERROR", form: err0})
        else
        {
            if (rec0.recordset.length > 0)
            {
                if (rec0.recordset[0].categories === null)
                {
                    let tempCat = [cat]
                    request.query(`update users set categories = N'${JSON.stringify(tempCat)}' where id = N'${user}'`, (err1) =>
                    {
                        if (err1)
                        {
                            response.send({
                                state: -8,
                                log: "DATABASE_ERROR",
                                form: err1
                            })
                        } else
                        {
                            request.query(`update categories set subscribes = subscribes + 1 where id = ${cat}`, (err2) =>
                                {
                                    err2 ?
                                        response.send({
                                            state: -9,
                                            log: "DATABASE_ERROR",
                                            form: err2
                                        }) :
                                        response.send({
                                            state: 1,
                                            log: "CATEGORY_ADDED_SUCCESSFUL",
                                            form: tempCat
                                        })
                                }
                            )
                        }
                    })
                } else
                {
                    let categories = JSON.parse(rec0.recordset[0].categories)
                    if (categories.indexOf(cat) >= 0)
                    {
                        response.send({state: -9, log: "CATEGORY_ALREADY_EXIST"})
                    } else
                    {
                        categories.push(cat)
                        request.query(`update users set categories = N'${JSON.stringify(categories)}' where id = N'${user}'`, (err1) =>
                        {
                            if (err1)
                            {
                                response.send({
                                    state: -10,
                                    log: "DATABASE_ERROR",
                                    form: err1
                                })
                            } else
                            {
                                request.query(`update categories set subscribes = subscribes + 1 where id = ${cat}`, (err2) =>
                                    {
                                        err2 ?
                                            response.send({
                                                state: -9,
                                                log: "DATABASE_ERROR",
                                                form: err2
                                            }) :
                                            response.send({
                                                state: 1,
                                                log: "CATEGORY_ADDED_SUCCESSFUL",
                                                form: categories
                                            })
                                    }
                                )
                            }
                        })
                    }
                }
            } else
            {
                response.send({state: -6, log: "USER_NOT_FOUND", form: null})
            }
        }
    })
}

const delete_category = ({user_id, category_id, response}) =>
{
    let user = parseInt(user_id)
    let cat = parseInt(category_id)

    let request = new mssql.Request(Connection.connection)

    request.query(`select categories from users where id = N'${user}'`, (err0, rec0) =>
    {
        if (err0) response.send({state: -5, log: "DATA_BASE_ERROR", form: err0})
        else
        {
            if (rec0.recordset.length > 0)
            {
                if (rec0.recordset[0].categories === null)
                {
                    response.send({
                        state: -6,
                        log: "USER_CATEGORY_LIST_IS_EMPTY",
                    })
                } else
                {
                    let categories = JSON.parse(rec0.recordset[0].categories)
                    if (categories.indexOf(cat) < 0)
                    {
                        response.send({state: -7, log: "USER_CATEGORY_NOT_EXIST"})
                    } else
                    {
                        let new_cats = categories.filter(arr => arr !== cat)
                        request.query(`update users set categories = N'${JSON.stringify(new_cats)}' where id = N'${user}'`, (err1) =>
                        {
                            err1 ?
                                response.send({
                                    state: -10,
                                    log: "DATABASE_ERROR",
                                    form: err1
                                }) :
                                request.query(`update categories set subscribes = subscribes - 1 where id = ${cat}`, (err2) =>
                                    {
                                        err2 ?
                                            response.send({
                                                state: -11,
                                                log: "DATABASE_ERROR",
                                                form: err2
                                            }) :
                                            response.send({
                                                state: 1,
                                                log: "CATEGORY_DELETED_SUCCESSFUL",
                                                form: new_cats
                                            })
                                    }
                                )
                        })
                    }
                }
            } else response.send({state: -6, log: "USER_NOT_FOUND", form: null})
        }
    })
}

const get_favorite = ({username, phone, response}) =>
{
    let request = new mssql.Request(Connection.connection)

    if (phone.length === 11)
    {
        request.query(`select categories, username from users where phone = N'${phone}'`, (err0, rec0) =>
        {
            if (err0) response.send({state: -3, log: "DATA_BASE_ERROR", form: err0})
            else
            {
                if (rec0.recordset.length > 0)
                {
                    if (rec0.recordset[0].username === username)
                    {
                        response.send({
                            state: 1,
                            log: "GET_USER_FAVORITES_SUCCESS",
                            form: JSON.parse(rec0.recordset[0].categories)
                        })
                    } else response.send({state: -5, log: "USER_USERNAME_IS_NOT_CORRECT"})
                } else
                {
                    response.send({state: -4, log: "USER_NOT_FOUND", form: null})
                }
            }
        })
    } else response.send({state: -2, log: "USER_PHONE_IS_NOT_CORRECT"})
}

module.exports =
    {
        add_category: add_category,
        delete_category: delete_category,
        get_favorite: get_favorite,
    }