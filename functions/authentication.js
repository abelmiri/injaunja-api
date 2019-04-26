let JDate = require("jalali-date")
let mssql = require("mssql")
let Connection = require("../connection")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const login = ({phone, response}) =>
{
    if (phone.length === 11)
    {
        let request = new mssql.Request(Connection.connection)

        request.query(`select id, username, categories, type from users where phone = N'${phone}'`, (err0, res0) =>
        {
            if (err0) response.send({state: -3, log: "DATA_BASE_ERROR", form: err0})
            else
            {
                if (res0.recordset.length < 1) response.send({state: -4, log: "LOGIN_PHONE_NUMBER_DOES_NOT_EXIST"})
                else
                {
                    let form_data = {...res0.recordset[0]}
                    response.send({
                        state: 1,
                        log: "LOGIN_SUCCEED",
                        form: {
                            id: form_data.id,
                            username: form_data.username,
                            categories: JSON.parse(form_data.categories),
                            type: form_data.type,
                        },
                    })
                }
            }
        })
    } else response.send({state: -2, log: "LOGIN_PARAMETERS_PARAMETERS_DOES_NOT_HAVE_MINIMUM_LENGTHS"})
}

const admin_login = ({phone, username, response}) =>
{
    if (phone.length === 11)
    {
        let request = new mssql.Request(Connection.connection)

        request.query(`select id, username, name, type from users where phone = N'${phone}'`, (err0, res0) =>
        {
            if (err0) response.send({state: -3, log: "DATA_BASE_ERROR", form: err0})
            else
            {
                if (res0.recordset.length < 1) response.send({state: -4, log: "LOGIN_PHONE_NUMBER_DOES_NOT_EXIST"})
                else
                {
                    if (username === res0.recordset[0].username)
                    {
                        if (res0.recordset[0].type === "Admin")
                            response.send({state: 1, log: "LOGIN_SUCCEED", form: res0.recordset[0]})
                        else response.send({state: -6, log: "LOGIN_USERNAME_IS_NOT_ADMIN", form: res0.recordset[0]})
                    } else response.send({state: -5, log: "LOGIN_USERNAME_IS_NOT_CORRECT"})
                }
            }
        })
    } else response.send({state: -2, log: "LOGIN_PARAMETERS_PARAMETERS_DOES_NOT_HAVE_MINIMUM_LENGTHS"})
}

const sign_up = ({username, phone, response}) =>
{
    if (username.length >= 4 && phone.length === 11)
    {
        let request = new mssql.Request(Connection.connection)

        let Jdate = new JDate()
        let date = new Date()

        /** @namespace Jdate.date */
        let sign_up_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
        let sign_up_time = `${date.getHours()}:${date.getMinutes()}`

        request.query(`select phone from users where phone = N'${phone}'`, (error, records) =>
        {
            if (error) response.send({state: -3, log: "DATA_BASE_ERROR", form: error})
            else
            {
                if (records && records.recordset.length > 0)
                {
                    response.send({state: -4, log: "PHONE_NUMBER_IS_ALREADY_EXIST"})
                } else
                {
                    request.query(`insert into users (username, phone, type, joined_date, joined_time) 
                    output (inserted.id) 
                    values (N'${username}', N'${phone}', N'Person', N'${sign_up_date}', N'${sign_up_time}')`,
                        (err0, record) =>
                        {
                            if (err0) response.send({state: -5, log: "DATA_BASE_ERROR", form: err0})
                            else
                            {
                                response.send({state: 1, log: "SUCCESSFUL_SIGN_UP", form: record.recordset[0]})
                            }
                        })
                }
            }
        })
    } else response.send({state: -2, log: "SIGN_UP_PARAMETERS_DOES_NOT_HAVE_MINIMUM_LENGTHS"})
}

const update = ({id, name, phone, response}) =>
{
    if (!isNaN(id))
    {
        let request = new mssql.Request(Connection.connection)

        request.query(`select phone from users where id = '${id}'`, (error, records) =>
        {
            if (error) response.send({state: -3, log: "DATA_BASE_ERROR", form: error})
            else
            {
                if (records && records.recordset.length > 0)
                {
                    if (records.recordset[0].phone === phone)
                    {
                        request.query(`update users set name = N'${name}' output (inserted.name) where id = '${id}'`, (err, rec) =>
                        {
                            if (err) response.send({state: -6, log: "DATA_BASE_ERROR", form: error})
                            else response.send({
                                state: 1,
                                log: "SUCCESSFUL_USER_NAME_UPDATE",
                                form: rec.recordset[0],
                            })
                        })
                    } else response.send({
                        state: -5,
                        log: "USER_PHONE_NOT_MATCH",
                    })
                } else response.send({state: -4, log: "USER_ID_NOT_FOUND"})
            }
        })

    } else response.send({state: -2, log: `UPDATE_USER_${id}_IS_NOT_NUMBER`})
}

const select = ({id, response}) =>
{
    if (id === null)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select id, name, joined_date, joined_time from users`, (error, records) =>
        {
            if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
            else
            {
                response.send({state: 1, log: "SUCCESSFUL_GET_ALL_USERS", form: records.recordset})
            }
        })
    } else
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select id, name, username, joined_date, joined_time from users where id = N'${id}'`, (error, records) =>
        {
            if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({state: 1, log: `SUCCESSFUL_GET_USER_${id}`, form: records.recordset[0]}) :
                    response.send({state: -3, log: `USER_${id}_NOT_FOUND`, form: null})
            }
        })
    }
}

const select_admin = ({id, response}) =>
{
    if (id === null)
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select * from users`, (error, records) =>
        {
            if (error) response.send({state: -1, log: "DATA_BASE_ERROR", form: error})
            else
            {
                response.send({state: 1, log: "SUCCESSFUL_GET_ALL_USERS", form: records.recordset})
            }
        })
    } else
    {
        let request = new mssql.Request(Connection.connection)
        request.query(`select * from users where id = N'${id}'`, (error, records) =>
        {
            if (error) response.send({state: -2, log: "DATA_BASE_ERROR", form: error})
            else
            {
                records.recordset[0] ?
                    response.send({state: 1, log: `SUCCESSFUL_GET_USER_${id}`, form: records.recordset[0]}) :
                    response.send({state: -3, log: `USER_${id}_NOT_FOUND`, form: null})
            }
        })
    }
}

const delete_user = ({user_id, admin_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select type from users where id = N'${admin_id}'`, (error, records) =>
    {
        if (error) response.send({state: -4, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset.length > 0)
            {
                records.recordset[0].type === "Admin" ?
                    request.query(`select type from users where id = N'${user_id}'`, (error0, recordss) =>
                    {
                        if (error0) response.send({state: -7, log: "DATA_BASE_ERROR", form: error0})
                        else
                        {
                            if (recordss.recordset.length > 0)
                            {
                                recordss.recordset[0].type === "Person" ?
                                    request.query(`delete from users where id = N'${user_id}'`, (error0) =>
                                    {
                                        if (error0) response.send({state: -10, log: "DATA_BASE_ERROR", form: error0})
                                        else
                                        {
                                            response.send({state: 1, log: "USER_DELETE_SUCCESSFUL"})
                                        }
                                    })
                                    :
                                    response.send({
                                        state: -9,
                                        log: "YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACTION",
                                    })
                            } else response.send({state: -8, log: "USER_NOT_EXIST"})
                        }
                    })
                    :
                    response.send({state: -6, log: "YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACTION"})
            } else response.send({state: -5, log: "ADMIN_USER_NOT_EXIST"})
        }
    })
}

module.exports =
    {
        login: login,
        admin_login: admin_login,
        sign_up: sign_up,
        update: update,
        delete_user: delete_user,
        select: select,
        select_admin: select_admin,
    }