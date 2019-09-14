const apn = require("apn")
const path = require("path")
const mssql = require("mssql")
const Data = require("./data")
const Connection = require("./connection")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const {getUserShortNotification, getUserLongNotification} = require("./functions/notification")

////////////////////////////////////// FUNCTION_CALLS_ENDED

setInterval(() =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select id, device_token from users where is_ios = 'true'`, (error, records) =>
    {
        if (error) console.log("fetchIOSdbError", error)
        else if (records.recordset.length > 0)
        {
            records.recordset.forEach((user) =>
            {
                getUserShortNotification({user_id: user.id, is_ios: user.device_token})
                getUserLongNotification({user_id: user.id, is_ios: user.device_token})
            })
        }
    })
}, 420000) // Every 7 Minutes


const apnFunction = ({notification_title = "Title Test", notification_description = "Body Test", is_ios = "something"}) =>
{
    let apnProvider = new apn.Provider(
        {
            token: {
                key: path.join(__dirname, `/files/keys/${Data.apnKey}`),
                keyId: Data.apnKeyId,
                teamId: Data.apnTeamId,
            },
            production: false,
        })

    let notification = new apn.Notification(),
        alert = {
            body: notification_title,
            title: notification_description,
        },
        topic = "InjaUnja Topic test",
        badge = 5,
        priority = 5,
        pushType = "alert",
        payload = {"messageFrom": "InjaUnja API"}

    notification.alert = {...alert}
    notification.payload = {...payload}
    notification.topic = topic
    notification.badge = badge
    notification.priority = priority
    notification.pushType = pushType
    notification.expiry = Math.floor(Date.now() / 1000) + 21600 // 6 Hours

    apnProvider.send(notification, is_ios) // c5c83d377c0016cc88957909e45404721e26768653d9d2aeb29aad6fd63dd1ce
        .then(res =>
        {
            console.log("OnApnSuccess ->", res)
        })
        .catch(err =>
        {
            console.log("OnApnError ->", err)
        })
        .finally(() =>
        {
            apnProvider.shutdown()
            console.log("OnApnShutdown ->", notification.id)
        })

}

module.exports =
    {
        apnFunction: apnFunction,
    }