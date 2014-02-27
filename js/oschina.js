//oschina 动弹的相关API库
var OTA = {

    data: {
        //OSCHINA 应用 id
        id: '',
        //OSCHINA 应用 key
        key: '',

        //OpenAPI 授权登录页面
        authorize_url: "http://www.oschina.net/action/oauth2/authorize",
        //authorization_code 方式获取 AccessToken
        token_url: "http://www.oschina.net/action/openapi/token",

        //获取动弹列表 （最新动弹列表 我的动弹）
        tweet_list: "http://www.oschina.net/action/openapi/tweet_list",
        //获取动弹列表
        tweet_detail: "http://www.oschina.net/action/openapi/tweet_detail",
        //发布动弹
        tweet_pub: "http://www.oschina.net/action/openapi/tweet_pub",
        //删除动弹
        tweet_delete: "http://www.oschina.net/action/openapi/tweet_delete",

        //获取用户通知
        user_notice: "http://www.oschina.net/action/openapi/user_notice",
        //清除用户通知
        clear_notice: "http://www.oschina.net/action/openapi/clear_notice",

        //获取留言列表
        message_list: "http://www.oschina.net/action/openapi/message_list",
        //删除留言
        message_delete: "http://www.oschina.net/action/openapi/message_delete",

        //获取当前登录用户的账户信息
        user: "http://www.oschina.net/action/openapi/user",
        //用户详情
        user_information: "http://www.oschina.net/action/openapi/user_information",
        //个人主页详情
        my_information: "http://www.oschina.net/action/openapi/my_information",
        //获取好友列表
        friends_list: "http://www.oschina.net/action/openapi/friends_list",
        //获取动态列表
        active_list: "http://www.oschina.net/action/openapi/active_list",
        //更新好友关系（加关注、取消关注）
        update_user_relation: "http://www.oschina.net/action/openapi/update_user_relation"
    },

    init: function (settings) {
        $.extend(OTA.data, settings);
        return this;
    },

    post: function (api, settings, callback) {
        console.log(api);
        console.log(settings);
        console.log(callback);

        if (!OTA.data[api]) {
            return false;
        }
        $.post(OTA.data[api], settings, function (res) {
            console.log(res);
            callback(res);
        }, 'json');
        return;
    },

    get: function (api, settings, callback) {
        return OTA.post(api, settings, callback);
    },

    getLocationUrl: function (encode) {
        var url = window.location.origin;
        if (window.location.port) {
            url = url + ':' + window.location.port;
        }
        url = url + window.location.pathname;

        if (encode) {
            url = encodeURIComponent(url);
        }

        return url;
    },

    getAuthUrl: function () {
        var url = OTA.data.authorize_url + '?' +
            'client_id=' + OTA.data.id + '&' +
            'response_type=code' + '&' +
            'redirect_uri=' + OTA.getLocationUrl(1) + '&' +
            'state=authorize';
        return url;
    },

    auth: function () {
        var auth_one = function () {
            if (window.location.search && window.location.search.split('?').length == 2) {
                var kv = window.location.search.split('?')[1].split('&');
                console.log(kv);

                $(kv).each(function () {
                    var a = this.split('=');
                    var code = '';
                    if (a.length == 2 && a[0] == 'code') {
                        console.log('拿到回调返回的 code');
                        console.log(a);

                        code = a[1];
                    }

                    if (code.length) {
                        OTA.get("token_url", {
                            client_id: OTA.data.id,
                            client_secret: OTA.data.key,
                            grant_type: 'authorization_code',
                            redirect_uri: OTA.getLocationUrl(),
                            code: code,
                            dataType: 'json'
                        }, function (res) {
                            console.log('拿到回调返回的 token');
                            console.log(res);

                            if (res.error) {
                                alert(res.error_description);
                            } else {
                                chrome.storage.sync.set({
                                    'authorize_token': res
                                }, function () {
                                    // 通知保存完成。
                                    console.log('token 已保存');
                                    window.close();
                                });
                            }
                        });
                    }
                });
            } else {
                var au_url = OTA.getAuthUrl();

                //window.location = au_url;
                window.open(au_url);
            }
        }

        chrome.storage.sync.get('authorize_token', function (token) {
            console.log('authorize_token 已读取');
            console.log(token);
            if (token.authorize_token && token.authorize_token.access_token) {

            } else {
                auth_one();
            }
        });
    }
};



//oschina 动弹模板函数库
var OTT = {
    tweet: function (t) {
        var html = '';
        html += '<li>';
        html += '    <span class="portrait">';
        html += '        <a href="http://my.oschina.net/' + t.authorid + '" target="_blank">';
        html += '            <img src="' + t.portrait + '" align="absmiddle" alt="Vity" title="Vity" class="SmallPortrait" user="265660">';
        html += '        </a>';
        html += '    </span>';
        html += '    <span class="body" id="' + t.id + '">';
        html += '        <span class="user">';
        html += '            <a href="http://my.oschina.net/' + t.authorid + '">' + t.author + '</a>：</span>';
        html += '        <span class="log">' + t.body + '</span>';
        html += '        <span class="time">' + t.pubDate + ' (';
        html += '            <a href="http://my.oschina.net/' + t.authorid + '/tweet/' + t.id + '">0评</a>)';
        html += '        </span>';
        html += '    </span>';
        html += '    <div class="clear"></div>';
        html += '</li>';

        return html;
    },
    tweet_list: function (tl) {
        var html = '<ul class="Tweets">';
        $(tl).each(function () {
            html += OTT.tweet(this);
        });
        html += '</ul>'

        return html;
    },
    userinfo: function (ui) {
        var html = '<div class="userinfo">';
        html += ui;
        html += '</div>'

        return html;
    }
};


// oschins 数据存放
var OTD = {
    //我的用户信息
    myinfo: {}
}


//oschina 动弹的处理函数库
var OTF = {
    //显示列表
    showlist: function (id, page, a) {
        if (a) {
            $("#nav_showname").text($(a).text());
            $(".navbar-toggle").trigger('click');

            $("ul.navbar-nav li.active").removeClass("active");
            $($(a).parent()).addClass("active");
        }

        $("ul.pager").attr("data-tltype", id).attr("data-tlpage", page);

        OTA.get('tweet_list', {
            client_id: OTA.data.id,
            user: id,
            page: page
        }, function (res) {
            $("#DynaInfo").html(OTT.tweet_list(res.tweetlist));
        });
    },
    userinfo: function (id, friend) {
        id = parseInt(id);
        friend = parseInt(friend);

        if (!id || id < 1) {
            var show = function (ui) {
                $("#DynaInfo").html(OTT.userinfo(ui));
            }

            if (OTD.myinfo.length) {
                console.log('本地有用户数据');
                console.log(OTD);
                show(OTD.myinfo);
            } else {
                chrome.storage.sync.get('authorize_token', function (token) {
                    console.log('token 已读取');
                    console.log(token);

                    OTA.get('my_information', {
                        access_token: token.authorize_token.access_token,
                        dataType: 'json'
                    }, function (res) {
                        console.log('读取用户信息');
                        console.log(res);

                        OTD.myinfo = res;

                        show(res);
                    });

                });
            }
        } else {
            OTA.get('user_information', {
                client_id: OTA.data.id,
                user: id,
                friend: friend,
                dataType: 'json'
            }, function (res) {
                console.log('读取用户信息');
                console.log(res);
            });
        }
    }
};