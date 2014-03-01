//oschina 动弹的相关API类库
var oschina_tweet_api = function (settings) {
    var _this = this;

    _this.settings = {
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
    };
    $.extend(_this.settings, settings);

    _this.post = function (api, data, callback) {
        console.log(api);
        console.log(data);
        console.log(callback);

        if (!_this.settings[api]) {
            return false;
        }

        $.ajax({
            type: 'POST',
            url: _this.settings[api],
            data: data,
            dataType: "json"
        }).done(function (res) {
            console.log('请求成功');
            console.log(res);
            callback(res);
        }).fail(function (res) {
            console.warn('请求失败');
            console.log(res);

            var error = res.responseJSON;
            var msg = '请求失败';
            if (error.error) {
                if (error.error == 400) {
                    msg = '无效请求（缺少必要参数）';
                } else if (error.error == 401) {
                    msg = error.error_description;
                    if (msg.split(':')[0] == 'Invalid access token') {
                        chrome.storage.sync.remove('authorize_token', function (res) {
                            // 通知保存完成。
                            console.log('已删除 authorize_token ，要求用户重新授权');
                            console.log(res);
                        });
                    }
                } else {
                    msg = '意料之外的错误';
                }
                callback(res);
            } else {
                msg = res.statusText;
            }

            console.warn(msg);
            alert(msg);
        });
        return;
    };
    _this.get = _this.post;

    _this.getLocationUrl = function (encode) {
        var url = window.location.origin;
        if (window.location.port) {
            url = url + ':' + window.location.port;
        }
        url = url + window.location.pathname;

        if (encode) {
            url = encodeURIComponent(url);
        }

        return url;
    };

    _this.auth = function () {
        var auth_one = function () {
            if (window.location.search && window.location.search.split('?').length == 2) {
                var kv = window.location.search.split('?')[1].split('&');
                console.log(kv);

                var code = '';
                $(kv).each(function () {
                    var a = this.split('=');
                    if (a.length == 2 && a[0] == 'code') {
                        console.log('拿到回调返回的 code');
                        console.log(a);

                        code = a[1];
                    }
                });

                if (code.length) {
                    _this.get("token_url", {
                        client_id: _this.settings.id,
                        client_secret: _this.settings.key,
                        grant_type: 'authorization_code',
                        redirect_uri: _this.getLocationUrl(),
                        code: code,
                        dataType: 'json'
                    }, function (res) {
                        console.log('拿到回调返回的 token');
                        console.log(res);

                        if (res.error) {
                            console.warn(res.error_description);
                            alert(res.error_description);
                        } else {
                            chrome.storage.sync.set({
                                'authorize_token': res
                            }, function (res2) {
                                // 通知保存完成。
                                console.log('chrome.storage.sync.set authorize_token：');
                                console.log(res2);
                                window.close();
                            });
                        }
                    });
                }
            } else {
                var url = _this.settings.authorize_url + '?' +
                    'client_id=' + _this.settings.id + '&' +
                    'response_type=code' + '&' +
                    'redirect_uri=' + _this.getLocationUrl(1) + '&' +
                    'state=authorize';

                //window.location = url;
                window.open(url);
            }
        }

        chrome.storage.sync.get('authorize_token', function (token) {
            console.log('chrome.storage.sync.get authorize_token 已读取');
            console.log(token);
            if (token.authorize_token && token.authorize_token.access_token) {

            } else {
                auth_one();
            }
        });
    };
}


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

//oschina 动弹的处理函数类库
var oschina_tweet_fun = function (oschina_tweet_api) {
    var _this = this;

    //显示列表
    _this.showlist = function (id, page, a) {
        if (a) {
            $("#nav_showname").text($(a).text());
            $(".navbar-toggle").trigger('click');

            $("ul.navbar-nav li.active").removeClass("active");
            $($(a).parent()).addClass("active");
        }

        $("ul.pager").attr("data-tltype", id).attr("data-tlpage", page);

        oschina_tweet_api.get('tweet_list', {
            client_id: oschina_tweet_api.settings.id,
            user: id,
            page: page
        }, function (res) {
            if (res.error) {
                console.warn(res.error_description);
                alert(res.error_description);
            } else {
                console.log('列表载入成功');
                $("#DynaInfo").html(OTT.tweet_list(res.tweetlist));
            }
        });
    };

    //读取并呈现用户信息
    _this.userinfo = function (id, friend) {
        id = parseInt(id);
        friend = parseInt(friend);

        var show = function (ui) {
            $("#DynaInfo").html(OTT.userinfo(ui));
        }

        if (!id || id < 1) {
            chrome.storage.sync.get('authorize_token', function (token) {
                console.log('chrome.storage.sync.get authorize_token 已读取');
                console.log(token);

                if (token && token.authorize_token) {
                    oschina_tweet_api.get('my_information', {
                        access_token: token.authorize_token.access_token,
                        dataType: 'json'
                    }, function (res) {
                        if (res.error) {
                            console.warn(res.error_description);
                            alert(res.error_description);
                        } else {
                            console.log('我的信息载入成功');
                            show(res);
                        }
                    });
                } else {
                    oschina_tweet_api.auth();
                }
            });
        } else {
            oschina_tweet_api.get('user_information', {
                client_id: oschina_tweet_api.settings.id,
                user: id,
                friend: friend,
                dataType: 'json'
            }, function (res) {
                if (res.error) {
                    console.warn(res.error_description);
                    alert(res.error_description);
                } else {
                    console.log('用户信息载入成功');
                    show(res);
                }
            });
        }
    };
};