let JDate = require("jalali-date")
let mssql = require("mssql")
let Connection = require("../connection")
// let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const addNotification = ({event_id, notification, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`update events set notification = N'${notification}' where id = '${event_id}'`, (error) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            response.send({state: 1, log: `SUCCESSFUL_ADD_NOTIFICATION_TO_EVENT`})
        }
    })
}

const getUserShortNotification = ({user_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select * from users where id = N'${user_id}'`, (error, records) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset.length > 0)
            {
                let user = records.recordset[0]
                let user_categories_arr = JSON.parse(user.categories)

                if (user_categories_arr !== null && user_categories_arr.length > 0)
                {
                    let Jdate = new JDate()
                    let date = new Date()
                    /** @namespace Jdate.date */
                    let current_year = Jdate.date[0]
                    let current_month = Jdate.date[1]
                    let current_day = Jdate.date[2]
                    let current_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
                    let current_time = [date.getHours(), date.getMinutes()]

                    let selected_events_arr = []
                    let on_time_notifications = []

                    user_categories_arr.forEach((category_id, cat_inx) =>
                    {
                        // let request = new mssql.Request(Connection.connection)
                        request.query(
                            `select id, category_id, name, notification, is_long from events where 
                            category_id = '${category_id}' 
                            and (is_long = 'false') 
                            and (start_year >= ${current_year}) 
                            and (start_month >= ${current_month} or start_month = ${current_month === 12 ? 1 : current_month}) 
                            and (start_day >= ${current_day} or start_day = 
                            ${current_month <= 6 ?
                                current_day === 31 ?
                                    1 : current_day
                                : current_month !== 12 ?
                                    current_day === 30 ?
                                        1 : current_day
                                    : current_day === 29 ?
                                        1 : current_day
                                })`
                            , (err, event_records) =>
                            {
                                if (err) response.send({state: -7, log: "DATA_BASE_ERROR", form: err})
                                else
                                {
                                    if (event_records.recordset.length > 0 || (cat_inx === user_categories_arr.length - 1 && selected_events_arr.length !== 0))
                                    {
                                        event_records.recordset.length > 0 ? // 1: this category have event 0: categories have some events and it's the last foreach on categories
                                            event_records.recordset.forEach((event, evt_inx) =>
                                            {
                                                selected_events_arr.push(event)
                                                if (cat_inx === user_categories_arr.length - 1 && evt_inx === event_records.recordset.length - 1)
                                                {
                                                    // response.send(selected_events_arr)
                                                    selected_events_arr.forEach((selected_short_events, std_evt_inx) =>
                                                    {
                                                        if (selected_short_events.notification !== null && selected_short_events.notification.length > 5)
                                                        {
                                                            let notification_arr = JSON.parse(selected_short_events.notification)
                                                            let notification = notification_arr[0]
                                                            let notification_raw_time = notification.time.split(":")
                                                            let notification_time = [parseInt(notification_raw_time[0], 10), parseInt(notification_raw_time[1], 10)]

                                                            if (notification.date === current_date)
                                                            {
                                                                if (notification_time[0] === current_time[0])
                                                                {
                                                                    if (notification_time[1] >= current_time[1] - 10 && notification_time[1] <= current_time[1] + 10)
                                                                    {
                                                                        on_time_notifications.push({
                                                                            category_id: selected_short_events.category_id,
                                                                            event_id: selected_short_events.id,
                                                                            event_name: selected_short_events.name,
                                                                            notification_id: notification.id,
                                                                            notification_title: notification.title,
                                                                            notification_description: notification.description,
                                                                            notification_date: notification.date,
                                                                            notification_time: notification.time,
                                                                        })
                                                                        console.log("ADDED 1A")
                                                                    } else
                                                                    {
                                                                        console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                        console.log("NOT_ADDED 1A")
                                                                    }
                                                                } else if (notification_time[0] === current_time[0] + 1)
                                                                {
                                                                    if (notification_time[1] < 13 && current_time[1] > 47)
                                                                    {
                                                                        on_time_notifications.push({
                                                                            category_id: selected_short_events.category_id,
                                                                            event_id: selected_short_events.id,
                                                                            event_name: selected_short_events.name,
                                                                            notification_id: notification.id,
                                                                            notification_title: notification.title,
                                                                            notification_description: notification.description,
                                                                            notification_date: notification.date,
                                                                            notification_time: notification.time,
                                                                        })
                                                                        console.log("ADDED 2A")
                                                                    } else
                                                                    {
                                                                        console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                        console.log("NOT_ADDED 2A")
                                                                    }
                                                                } else if (notification_time[0] === current_time[0] - 1)
                                                                {
                                                                    if (notification_time[1] > 47 && current_time[1] < 13)
                                                                    {
                                                                        on_time_notifications.push({
                                                                            category_id: selected_short_events.category_id,
                                                                            event_id: selected_short_events.id,
                                                                            event_name: selected_short_events.name,
                                                                            notification_id: notification.id,
                                                                            notification_title: notification.title,
                                                                            notification_description: notification.description,
                                                                            notification_date: notification.date,
                                                                            notification_time: notification.time,
                                                                        })
                                                                        console.log("ADDED 3A")
                                                                    } else
                                                                    {
                                                                        console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                        console.log("NOT_ADDED 3A")
                                                                    }
                                                                }
                                                                if (std_evt_inx === selected_events_arr.length - 1)
                                                                {
                                                                    if (on_time_notifications.length > 0)
                                                                    {
                                                                        let ready_notifications = []
                                                                        on_time_notifications.forEach((on_time_notification_object, on_tm_inx) =>
                                                                        {
                                                                            request.query(`
                                                                            select * from log where 
                                                                            user_id = ${user_id} and 
                                                                            event_id = ${on_time_notification_object.event_id} and 
                                                                            notification_id = ${on_time_notification_object.notification_id}`,
                                                                                (err0, records1) =>
                                                                                {
                                                                                    if (err0) response.send({
                                                                                        state: -8,
                                                                                        log: "DATA_BASE_ERROR",
                                                                                        form: err0,
                                                                                    })
                                                                                    else
                                                                                    {
                                                                                        if (records1.recordset.length === 0)
                                                                                        {
                                                                                            ready_notifications.push(on_time_notification_object)
                                                                                            request.query(`
                                                                                            insert into log (user_id, event_id, notification_id, deliver_time, deliver_date)
                                                                                            values (
                                                                                            ${user_id}, 
                                                                                            ${on_time_notification_object.event_id}, 
                                                                                            ${on_time_notification_object.notification_id},
                                                                                            '${current_time[0]}:${current_time[1]}', 
                                                                                            '${current_date}')`,
                                                                                                (log_err) =>
                                                                                                {
                                                                                                    log_err ? console.log("LOG_NOTIFICATION_ERROR", log_err) : null
                                                                                                })
                                                                                            if (on_tm_inx === on_time_notifications.length - 1)
                                                                                            {
                                                                                                if (ready_notifications.length > 0)
                                                                                                {
                                                                                                    response.send({
                                                                                                        state: 1,
                                                                                                        log: `USER_${user_id}_FAVORITES_NOTIFICATIONS`,
                                                                                                        form: ready_notifications ? ready_notifications : [],
                                                                                                    })
                                                                                                } else
                                                                                                {
                                                                                                    response.send({
                                                                                                        state: 0,
                                                                                                        log: `USER_${user_id}_FAVORITES_GOT_NO_NEW_NOTIFICATIONS`,
                                                                                                        form: ready_notifications ? ready_notifications : [],
                                                                                                    })
                                                                                                }
                                                                                            }
                                                                                        } else if (on_tm_inx === on_time_notifications.length - 1)
                                                                                        {
                                                                                            if (ready_notifications.length > 0)
                                                                                            {
                                                                                                response.send({
                                                                                                    state: 1,
                                                                                                    log: `USER_${user_id}_FAVORITES_NOTIFICATIONS`,
                                                                                                    form: ready_notifications ? ready_notifications : [],
                                                                                                })
                                                                                            } else
                                                                                            {
                                                                                                response.send({
                                                                                                    state: 0,
                                                                                                    log: `USER_${user_id}_FAVORITES_GOT_NO_NEW_NOTIFICATIONS`,
                                                                                                    form: ready_notifications ? ready_notifications : [],
                                                                                                })
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })
                                                                        })
                                                                    } else response.send({
                                                                        state: 0,
                                                                        log: `USER_${user_id}_FAVORITES_GOT_NO_ON_TIME_NOTIFICATIONS`,
                                                                        form: on_time_notifications ? on_time_notifications : [],
                                                                    })
                                                                }
                                                            } else
                                                            {
                                                                console.log(notification.date, current_date, "A")
                                                                if (cat_inx === user_categories_arr.length - 1 && evt_inx === event_records.recordset.length - 1)
                                                                    response.send({
                                                                        state: 0,
                                                                        log: `USER_${user_id}_FAVORITES_GOT_NO_AVAILABLE_NOTIFICATIONS`,
                                                                        form: on_time_notifications ? on_time_notifications : [],
                                                                    })
                                                            }
                                                        } else
                                                        {
                                                            if (std_evt_inx === selected_events_arr.length - 1)
                                                            {
                                                                response.send({
                                                                    state: 0,
                                                                    log: `USER_${user_id}_FAVORITES_GOT_NO_AVAILABLE_NOTIFICATIONS`,
                                                                    form: on_time_notifications ? on_time_notifications : [],
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                            : selected_events_arr.forEach((selected_short_events, std_evt_inx) =>
                                            {
                                                if (selected_short_events.notification !== null && selected_short_events.notification.length > 5)
                                                {
                                                    let notification_arr = JSON.parse(selected_short_events.notification)
                                                    let notification = notification_arr[0]
                                                    let notification_raw_time = notification.time.split(":")
                                                    let notification_time = [parseInt(notification_raw_time[0], 10), parseInt(notification_raw_time[1], 10)]

                                                    if (notification.date === current_date)
                                                    {
                                                        if (notification_time[0] === current_time[0])
                                                        {
                                                            if (notification_time[1] >= current_time[1] - 10 && notification_time[1] <= current_time[1] + 10)
                                                            {
                                                                on_time_notifications.push({
                                                                    category_id: selected_short_events.category_id,
                                                                    event_id: selected_short_events.id,
                                                                    event_name: selected_short_events.name,
                                                                    notification_id: notification.id,
                                                                    notification_title: notification.title,
                                                                    notification_description: notification.description,
                                                                    notification_date: notification.date,
                                                                    notification_time: notification.time,
                                                                })
                                                                console.log("ADDED 1B")
                                                            } else
                                                            {
                                                                console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                console.log("NOT_ADDED 1B")
                                                            }
                                                        } else if (notification_time[0] === current_time[0] + 1)
                                                        {
                                                            if (notification_time[1] < 13 && current_time[1] > 47)
                                                            {
                                                                on_time_notifications.push({
                                                                    category_id: selected_short_events.category_id,
                                                                    event_id: selected_short_events.id,
                                                                    event_name: selected_short_events.name,
                                                                    notification_id: notification.id,
                                                                    notification_title: notification.title,
                                                                    notification_description: notification.description,
                                                                    notification_date: notification.date,
                                                                    notification_time: notification.time,
                                                                })
                                                                console.log("ADDED 2B")
                                                            } else
                                                            {
                                                                console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                console.log("NOT_ADDED 2B")
                                                            }
                                                        } else if (notification_time[0] === current_time[0] - 1)
                                                        {
                                                            if (notification_time[1] > 47 && current_time[1] < 13)
                                                            {
                                                                on_time_notifications.push({
                                                                    category_id: selected_short_events.category_id,
                                                                    event_id: selected_short_events.id,
                                                                    event_name: selected_short_events.name,
                                                                    notification_id: notification.id,
                                                                    notification_title: notification.title,
                                                                    notification_description: notification.description,
                                                                    notification_date: notification.date,
                                                                    notification_time: notification.time,
                                                                })
                                                                console.log("ADDED 3B")
                                                            } else
                                                            {
                                                                console.log(notification_time[0] + ":" + notification_time[1], current_time[0] + ":" + current_time[1])
                                                                console.log("NOT_ADDED 3B")
                                                            }
                                                        }
                                                        if (std_evt_inx === selected_events_arr.length - 1)
                                                        {
                                                            if (on_time_notifications.length > 0)
                                                            {
                                                                let ready_notifications = []
                                                                on_time_notifications.forEach((on_time_notification_object, on_tm_inx) =>
                                                                {
                                                                    request.query(`
                                                                    select * from log where 
                                                                    user_id = ${user_id} and 
                                                                    event_id = ${on_time_notification_object.event_id} and 
                                                                    notification_id = ${on_time_notification_object.notification_id}`,
                                                                        (err0, records1) =>
                                                                        {
                                                                            if (err0) response.send({
                                                                                state: -9,
                                                                                log: "DATA_BASE_ERROR",
                                                                                form: err0,
                                                                            })
                                                                            else
                                                                            {
                                                                                if (records1.recordset.length === 0)
                                                                                {
                                                                                    ready_notifications.push(on_time_notification_object)
                                                                                    request.query(`
                                                                                    insert into log (user_id, event_id, notification_id, deliver_time, deliver_date)
                                                                                    values (
                                                                                    ${user_id}, 
                                                                                    ${on_time_notification_object.event_id}, 
                                                                                    ${on_time_notification_object.notification_id}, 
                                                                                    '${current_time[0]}:${current_time[1]}', 
                                                                                    '${current_date}')`,
                                                                                        (log_err) =>
                                                                                        {
                                                                                            log_err ? console.log("LOG_NOTIFICATION_ERROR", log_err) : null
                                                                                        })
                                                                                    if (on_tm_inx === on_time_notifications.length - 1)
                                                                                    {
                                                                                        if (ready_notifications.length > 0)
                                                                                        {
                                                                                            response.send({
                                                                                                state: 1,
                                                                                                log: `USER_${user_id}_FAVORITES_NOTIFICATIONS`,
                                                                                                form: ready_notifications ? ready_notifications : [],
                                                                                            })
                                                                                        } else
                                                                                        {
                                                                                            response.send({
                                                                                                state: 0,
                                                                                                log: `USER_${user_id}_FAVORITES_GOT_NO_NEW_NOTIFICATIONS`,
                                                                                                form: ready_notifications ? ready_notifications : [],
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                } else if (on_tm_inx === on_time_notifications.length - 1)
                                                                                {
                                                                                    if (ready_notifications.length > 0)
                                                                                    {
                                                                                        response.send({
                                                                                            state: 1,
                                                                                            log: `USER_${user_id}_FAVORITES_NOTIFICATIONS`,
                                                                                            form: ready_notifications ? ready_notifications : [],
                                                                                        })
                                                                                    } else
                                                                                    {
                                                                                        response.send({
                                                                                            state: 0,
                                                                                            log: `USER_${user_id}_FAVORITES_GOT_NO_NEW_NOTIFICATIONS`,
                                                                                            form: ready_notifications ? ready_notifications : [],
                                                                                        })
                                                                                    }
                                                                                }
                                                                            }
                                                                        })
                                                                })
                                                            } else response.send({
                                                                state: 0,
                                                                log: `USER_${user_id}_FAVORITES_GOT_NO_ON_TIME_NOTIFICATIONS`,
                                                                form: on_time_notifications ? on_time_notifications : [],
                                                            })
                                                        }
                                                    } else
                                                    {
                                                        if (std_evt_inx === selected_events_arr.length - 1)
                                                            response.send({
                                                                state: 0,
                                                                log: `USER_${user_id}_FAVORITES_GOT_NO_ON_DATE_NOTIFICATIONS`,
                                                                form: on_time_notifications ? on_time_notifications : [],
                                                            })
                                                        else
                                                        {
                                                            console.log(notification.date, current_date, "B")
                                                            if (cat_inx === user_categories_arr.length - 1 && std_evt_inx === event_records.recordset.length - 1)
                                                                response.send({
                                                                    state: 0,
                                                                    log: `USER_${user_id}_FAVORITES_GOT_NO_AVAILABLE_NOTIFICATIONS`,
                                                                    form: on_time_notifications ? on_time_notifications : [],
                                                                })
                                                        }
                                                    }
                                                } else
                                                {
                                                    if (std_evt_inx === selected_events_arr.length - 1)
                                                    {
                                                        response.send({
                                                            state: 0,
                                                            log: `USER_${user_id}_FAVORITES_GOT_NO_AVAILABLE_NOTIFICATIONS`,
                                                            form: on_time_notifications ? on_time_notifications : [],
                                                        })
                                                    }
                                                }
                                            })
                                    } else
                                    {
                                        cat_inx === user_categories_arr.length - 1 ?
                                            response.send({
                                                state: 0,
                                                log: `USER_${user_id}_FAVORITES_GOT_NO_AVAILABLE_EVENTS`,
                                                form: selected_events_arr ? selected_events_arr : [],
                                            })
                                            : console.log("NO_EVENT_UNDER_THIS_CATEGORY")
                                    }
                                }
                            })
                    })
                } else response.send({
                    state: 0,
                    log: `USER_${user_id}_HAVE_NO_FAVORITES`,
                    form: user_categories_arr ? user_categories_arr : [],
                })
            } else response.send({
                state: -6,
                log: `USER_${user_id}_NOT_FOUND`,
                form: records.recordset ? records.recordset : [],
            })
        }
    })
}

const getUserLongNotification = ({user_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select * from users where id = N'${user_id}'`, (error, records) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset.length > 0)
            {
                let user = records.recordset[0]
                let user_categories_arr = JSON.parse(user.categories)

                if (user_categories_arr !== null && user_categories_arr.length > 0)
                {
                    let Jdate = new JDate()
                    let date = new Date()
                    /** @namespace Jdate.date */
                    let current_date_abel = Jdate.date[0] * 365 + (Jdate.date[1] - 1) * 30 + Jdate.date[2]

                    let selected_events = []

                    user_categories_arr.forEach((category_id, cat_inx) =>
                    {
                        // let request = new mssql.Request(Connection.connection)
                        request.query(
                            `select id, category_id, name, notification, is_long from events where
                            category_id = '${category_id}'
                            and (is_long = 'true')
                            and ((start_year * 365 + (start_month - 1) * 30 + start_day) <= ${current_date_abel} and (end_year * 365 + (end_month - 1) * 30 + end_day) >= ${current_date_abel})`
                            , (err, event_records) =>
                            {
                                if (err) response.send({
                                    state: -7,
                                    log: "DATA_BASE_ERROR",
                                    form: err,
                                })
                                else if (event_records.recordset.length > 0)
                                {
                                    event_records.recordset.forEach(p => selected_events.push(p))
                                    if (user_categories_arr.length - 1 === cat_inx)
                                        processLongEvents(selected_events, response)
                                }
                            })
                    })
                } else response.send({
                    state: 0,
                    log: `USER_${user_id}_HAVE_NO_FAVORITES`,
                    form: user_categories_arr ? user_categories_arr : [],
                })
            } else response.send({
                state: -6,
                log: `USER_${user_id}_NOT_FOUND`,
                form: records.recordset ? records.recordset : [],
            })
        }
    })
}

function processLongEvents(events, response)
{
    // let Jdate = new JDate()
    // let date = new Date()
    /** @namespace Jdate.date */
    // let current_year = Jdate.date[0]
    // let current_month = Jdate.date[1]
    // let current_day = Jdate.date[2]
    // let current_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
    // let current_time = [date.getHours(), date.getMinutes()]

    response.send({
        state: 1,
        log: `USER_EVENTS_DEVELOP`,
        form: events.length > 0 ? events : [],
    })
}


module.exports =
    {
        addNotification: addNotification,
        getUserShortNotification: getUserShortNotification,
        getUserLongNotification: getUserLongNotification,
    }