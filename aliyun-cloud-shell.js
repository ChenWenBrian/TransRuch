// ==UserScript==
// @name         Aliyun Shell Helper
// @namespace    https://shell.aliyun.com/
// @version      0.5
// @description  aliyun cloud shell socks proxy in your own environment!
// @author       Brian Chen
// @match        https://shell.aliyun.com/term?*
// @require      https://raw.github.com/odyniec/MonkeyConfig/master/monkeyconfig.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    //configuration section
    MonkeyConfig.prototype.getConfig = function(){
        let args = Array.prototype.slice.call(arguments),
            config={};
        for (var i = 0; i < args.length; i++) {
            config[args[i]] = cfg.get(args[i]);
        }

        return config;
    }
    
    var options = {
        title: 'Ali-Shell Configuration',
        menuCommand: true,
        params: {
            token: {
                type: 'text',
                default: 'Input your token here'
            },
            port: {
                type: 'number',
                default: 7000
            },
            keep_alive: {
                type: 'number',
                default: 10000  //10 seconds
            },
            enable_log: {
                type: 'checkbox',
                default: false
            }
        }
    },
    cfg = new MonkeyConfig(options);
    if(cfg.get('token') === options.params.token.default){
        cfg.open();
    }

    let config = cfg.getConfig("port", "token", "keep_alive", "enable_log");

    //injected function
    let fn = function (t, config) {
        console.info(Date());
        console.info("Helper started at: " + window.location);
        let lastTime = "";

        //timer to check if shell is ready for use
        let timerId = window.setInterval(async function () {
            if (!window.t) return;
            if (isLastLineContains("shell@Alicloud:")) {
                console.info("Session detected, begin injection.");
                window.clearInterval(timerId);
                //get time from shell after xxx mil-seconds
                lastTime = await getPrintDate(800);
                initProxy();
                keepAlive(config.keep_alive); //10 seconds
                await beep(5);
                console.info("Proxy started at: " + lastTime);
            } else {
                console.info("Session is not detected, waiting...");
            }
        }, 500); //0.5s

        const delay = ms => new Promise(res => setTimeout(res, ms));

        async function beep(count, delayMils) {
            for (let i = 0; i < count; i++) {
                t.term._core._soundService.playBellSound();
                await delay(delayMils || 200);
            }
        }

        function getLastLine(offset) {
            let lineNum = t.term.buffer.active.cursorY + (offset || 0);
            t.term.selectLines(lineNum, lineNum);
            return t.term.getSelection();
        }

        function isLastLineContains(text) {
            return getLastLine().indexOf(text) > -1;
        }

        function initProxy() {
            console.debug(window.returnCitySN);
            let cmd = SH_CMD.replace("$ip", window.returnCitySN.cip);
            console.debug(cmd);
            t.input(cmd);
        }

        function keepAlive(delayMils) {
            let count = 0;
            let timerId = window.setInterval(async function () {
                count++;
                t.input("\nclear\n");
                t.input("free -h\n");
                t.input("ll ~\n");
                let curTime = await getPrintDate();
                if (curTime && curTime != lastTime && curTime.indexOf(new Date().getUTCFullYear().toString()) > -1) {
                    console.info(count + ". Session keep alived at: " + (lastTime = curTime));
                } else {
                    console.info(count + ". Session terminated at: " + lastTime);
                    await beep(10, 200);
                    await beep(30, 100);
                    window.clearInterval(timerId);
                    window.top.location.reload(true);
                }

            }, delayMils || 60000); //default 1 mins
        }

        async function getPrintDate(delayMils) {
            t.input("TZ=Asia/Shanghai date '+%Y-%m-%d  %H:%M:%S'\n");
            await delay(delayMils || 500);
            return getLastLine(-1);
        }

        const SH_CMD = `if [ ! -f 'fc' ]; then wget https://23.99.118.93/download/fc --no-check-certificate; fi \
&& chmod +x fc \
&& cat << EOF > frpc.ini
[common]
log_file = ${config.enable_log ? "client.log" : "/dev/null"}
log_level = info
login_fail_exit = false
server_addr = $ip
server_port = ${config.port}
tcp_mux = true
token = ${config.token}
tls_enable = true

[aliyun-socks5]
type = tcp
remote_port = 2080
plugin = socks5
use_encryption = true
EOF

if ! pidof fc > /dev/null ; then (./fc & ) ;fi \
&& sleep 1 \
&& /bin/rm -f frpc.ini \
&& clear \
&& history -c \
&& ps -aux \
&& ll
`;
    }

    function appendScript(src, html) {
        var script = document.createElement("script");
        if (src) script.src = src;
        if (html) script.innerHTML = html;
        document.head.appendChild(script);
    }

    appendScript("//pv.sohu.com/cityjson?ie=utf-8");
    appendScript(null, `(${fn.toString()})(window.t, ${JSON.stringify(config)})`);

})();
