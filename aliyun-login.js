// ==UserScript==
// @name         Aliyun Login Helper
// @namespace    https://passport.aliyun.com/
// @version      0.1
// @description  aliyun automatic login helper!
// @author       Brian Chen
// @match        https://passport.aliyun.com/mini_login.htm*
// @require      https://raw.github.com/odyniec/MonkeyConfig/master/monkeyconfig.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    //configuration section
    MonkeyConfig.prototype.getConfig = function () {
        let args = Array.prototype.slice.call(arguments),
            config = {};
        for (var i = 0; i < args.length; i++) {
            config[args[i]] = cfg.get(args[i]);
        }

        return config;
    }

    var options = {
            title: 'Aliyun-Login Configuration',
            menuCommand: true,
            params: {
                username: {
                    type: 'text',
                    default: 'Input your username here'
                },
                password: {
                    type: 'password',
                    default: ''
                },
                auto_fill: {
                    type: 'checkbox',
                    default: false
                }
            }
        },
        cfg = new MonkeyConfig(options);
    // if (cfg.get('username') === options.params.token.default) {
    //     cfg.open();
    // }

    let config = cfg.getConfig("username", "password", "auto_fill");

    //injected function
    let fn = function (config) {
        console.info(Date());
        console.info("Helper started at: " + window.location);

        let count = 0;
        //timer to check if webform is ready for login
        let timerId = window.setInterval(function () {
            if (node("#fm-login-id")) {
                count === 0 && console.info("Login form detected, checking username & password...");
                if (node("#fm-login-id").value && node("#fm-login-password").value) {
                    console.info(`Username[${node("#fm-login-id").value}] detected, login...`);
                    window.clearInterval(timerId);
                    node("#login-form button.fm-submit").click();
                } else if (config.auto_fill) {
                    if (config.username) {
                        node("#fm-login-id").value = config.username;
                    }
                    if (config.password) {
                        node("#fm-login-password").value = config.password;
                    }
                } else {
                    console.info("Account is not detected, waiting...");
                }
            } else {
                console.info("Login form is not detected, waiting...");
            }
            if (count++ > 100) {
                window.clearInterval(timerId);
                console.error("Max detection count reached, quit.");
            }
        }, 500); //0.1s

        function node(selector) {
            return document.querySelector(selector);
        }

    }

    function appendScript(src, html) {
        var script = document.createElement("script");
        if (src) script.src = src;
        if (html) script.innerHTML = html;
        document.head.appendChild(script);
    }

    appendScript(null, `(${fn.toString()})(${JSON.stringify(config)})`);

})();