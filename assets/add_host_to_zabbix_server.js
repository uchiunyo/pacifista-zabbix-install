//ZabbixAPIクラス
function ZabbixAPI(server) {
    this.url = server;
    this.auth = null;
}

//ZabbixAPIを叩くfunction
ZabbixAPI.prototype.call = function (method, params) {
    var data = JSON.stringify({
        "auth": this.auth,
        "method": method,
        "params": params,
        "id": 1,
        "jsonrpc": "2.0"
    });
    try {
        var req = http.request(this.url, 'POST', data, 'Content-Type=application/json-rpc');
    } catch (e) {
        throw 'http access error.'
    }
    ret = JSON.parse(req);
    if ('error' in ret) {
        throw 'Return Zabbix API Error.' + ret["error"]["message"] + ret["error"]["data"] + data
    }
    return ret["result"];
}

//Zabbixサーバにログインするfunction
ZabbixAPI.prototype.login = function (user, password) {
    var params = {
        "user": user,
        "password": password,
    };
    this.auth = this.call('user.login', params);
}

//hostgroup名からidを取得するfunction
ZabbixAPI.prototype.hostgroupNameToId = function (names) {
    var ret = [];
    var params = {
        "output": "extend",
        "filter": {
            "name": names
        }
    };
    var res = this.call('hostgroup.get', params);
    for (var i = res.length; i--;) {
        ret.push(res[i]["groupid"]);
    }
    return ret;
}

//template名からidを取得するfunction
ZabbixAPI.prototype.templateNameToId = function (names) {
    var ret = [];
    var params = {
        "output": "extend",
        "filter": {
            "host": names
        }
    }
    var res = this.call('template.get', params);
    for (var i = res.length; i--;) {
        ret.push(res[i]["templateid"]);
    }
    return ret;
}

//main
var host = runtime.getEnv("host");
var zabbixServerUri = runtime.getEnv("zabbixServer");

//初期化とログイン
var zbx = new ZabbixAPI(zabbixServerUri);
zbx.login("admin", "zabbix");
console.log("***** " + host["name"] + " is add zabbix server...");

//既にZabbixServerに登録されていたらException
var hostCheck = zbx.call('host.exists', {"host":host["name"]});
if (hostCheck) {
   throw host["name"] + " is exist";
}

var groupId = zbx.hostgroupNameToId(host["hostgroups"]);
var templateId = zbx.templateNameToId(host["templates"]);
var params = {
    "host": host["name"],
    "interfaces": host["interfaces"],
    "groups": [],
    "templates": []
}
for (var j = groupId.length; j--;) {
    params["groups"].push({
        "groupid": groupId[j]
    });
}
for (var j = templateId.length; j--;) {
    params["templates"].push({
        "templateid": templateId[j]
    });
}
var res = zbx.call('host.create', params);
if (res["hostids"].length > 0) {
    console.log("***** " + host["name"] + " is create success. hostid: " + res["hostids"][0]);
} else {
    throw host["name"] + " is create failure.";
}
