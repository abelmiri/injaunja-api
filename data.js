let domain_url = "http://injaunja.com/"
// let restful_url = "http://restful.injaunja.com/"
let restful_url = "http://185.211.58.174:1435/"
// let media_url = "http://restful.injaunja.com/files/media/"
let media_url = "http://185.211.58.174:1435/files/media/"
// let vector_url = "http://restful.injaunja.com/files/svg/"
let vector_url = "http://185.211.58.174:1435/files/svg/"
let media_location = "files/media/"
let vector_location = "files/svg/"
let keys_location = "files/keys/"
let auth = "QEFiZWxtaXJpIEBIb3NleW5tb3VzYXZp"
let android_token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhcHBfdHlwZSI6ImFuZHJvaWQifQ.QtdKhREsF7nVYvuWdmXKl7OVI98HKrcOGCK_RLWM9wKs0loypUJrNPbKXyubf0CQ5Jq66gLBden19UL4vfOPKg"
let ios_token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhcHBfdHlwZSI6ImlvcyJ9.MgdLvXQDCQNMxj86_4VUKqptkVaW2CFBU9BfSWTZkr6yq6gTE5rh6sA1RLXQN7ApwuRChpnEDqFMXpGlc5oVSw"
let sign = "0x410x620x650x6c"
let port = 1435
let apnKey = "AuthKey_M5CQZ8F5D5.p8"
let apnKeyId = "M5CQZ8F5D5"
let apnTeamId = "V9Q9C32UDJ"
let apnKeyLocation = restful_url + keys_location + apnKey

module.exports = {
    domain_url: domain_url,
    restful_url: restful_url,
    media_url: media_url,
    vector_url: vector_url,
    media_location: media_location,
    vector_location: vector_location,
    auth: auth,
    android_token: android_token,
    ios_token: ios_token,
    sign: sign,
    port: port,
    apnKey: apnKey,
    apnKeyId: apnKeyId,
    apnTeamId: apnTeamId,
    apnKeyLocation: apnKeyLocation,
}