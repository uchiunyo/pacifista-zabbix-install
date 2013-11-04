//登録したいホストの情報
var hosts = [{
    name: 'web-server1',
    hostgroups: ['Templates', 'zabbix servers'],
    templates: ['Template OS Linux', 'Template App MySQL'],
    interfaces: [{
        "type": 1,
        "main": 1,
        "useip": 1,
        "ip": "127.0.0.1",
        "dns": "",
        "port": 10050
    }]
}]
/*
}, {
    name: 'web-server2',
    hostgroups: ['Templates', 'zabbix servers'],
    templates: ['Template OS Linux', 'Template App Zabbix Server'],
    interfaces: [{
        "type": 1,
        "main": 1,
        "useip": 1,
        "ip": "127.0.0.1",
        "dns": "",
        "port": 10050
    }]
}]*/
//対象のZabbixサーバ
var zabbixAPIUri = 'http://vmcent1/zabbix/api_jsonrpc.php';
var zabbixServerHost = "127.0.0.1"
var sshPort = "2222";
var sshUser = "vagrant";
var sshPassword = "vagrant";

for (var i = hosts.length; i--;) {
    var sshHost = "";
    switch(hosts[i]["interfaces"]["useip"]){
        case 0: sshHost = hosts[i]["interfaces"]["dns"]; break;
        case 1: sshHost = hosts[i]["interfaces"]["ip"]; break;
    } 
    var remote = Remote.create();
    console.log(sshHost);
    remote.connect(sshHost, sshPort, sshUser,sshPassword);
    runtime.setEnv("remote", remote);
    runtime.setEnv("zabbixServer", zabbixServerHost);
    runtime.setEnv("host", hosts[i]["name"]);
    runtime.call("./assets/install_zabbix-agent_to_linux.js");

    runtime.setEnv("host", hosts[i]);
    runtime.setEnv("zabbixServer", zabbixAPIUri);
    runtime.call("./assets/add_host_to_zabbix_server.js");
}

