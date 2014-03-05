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

    _this.auth = function (fun) {
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
                            if (fun) {
                                fun(res);
                            }

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
            if (token && token.authorize_token && token.authorize_token.access_token) {
                if (fun) {
                    fun(token.authorize_token);
                }
            } else {
                auth_one();
            }
        });
    };

    _this.getTweetlist = function (id, page, fun, noticefun) {
        _this.get('tweet_list', {
            client_id: _this.settings.id,
            user: id,
            page: page
        }, function (res) {
            if (res.error) {
                console.warn(res.error_description);
                alert(res.error_description);
            } else {
                console.log('列表载入成功');
                if (fun) {
                    fun(res.tweetlist);
                }
                if (noticefun) {
                    noticefun(res.notice);
                }
            }
        });
    };

    _this.userInfo = function (id, fun) {
        _this.get('user_information', {
            client_id: _this.settings.id,
            //user: user_id,
            friend: id,
            dataType: 'json'
        }, function (res) {
            if (res.error) {
                console.warn(res.error_description);
                alert(res.error_description);
            } else {
                console.log('用户信息载入成功');


                if (fun) {
                    fun(res);
                }
            }
        });
    };

    _this.myInfo = function (fun) {
        _this.auth(function (token) {
            _this.get('my_information', {
                access_token: token.access_token,
                dataType: 'json'
            }, function (res) {
                if (res.error) {
                    console.warn(res.error_description);
                    alert(res.error_description);
                } else {
                    console.log('我的信息 api 读取成功');
                    console.log(res);

                    if (fun) {
                        fun(res);
                    }

                    chrome.storage.sync.set({
                        'my_information': res
                    }, function (res2) {
                        // 通知保存完成。
                        console.log('chrome.storage.sync.set my_information：');
                        console.log(res2);
                    });
                }
            });
        });
    };

    _this.myList = function (page, fun, noticefun) {
        chrome.storage.sync.get('my_information', function (info) {
            console.log('chrome.storage.sync.get my_information 已读取');
            console.log(info);

            if (info && info.my_information && info.my_information.user) {
                _this.getTweetlist(info.my_information.user, page, fun, noticefun);
            } else {
                _this.myInfo(function (info) {
                    _this.getTweetlist(info.user, page, fun, noticefun);
                });
            }
        });
    };

    _this.tweet = function (msg, img, fun) {
        _this.auth(function (token) {
            _this.post('tweet_pub', {
                access_token: token.access_token,
                msg: msg,
                img: img
            }, function (res) {
                console.log('发布动弹 api 读取成功');
                console.log(res);

                if (fun) {
                    fun(res);
                }
            });
        });
    }
}


//oschina 动弹模板函数库
var OTT = {
    tweet: function (t) {
        var url = 'http://my.oschina.net/u/' + t.authorid + '/tweet/' + t.id;

        var html = '';
        html += '<li class="user" id="' + t.id + '">';
        html += '    <span class="img" data-id="' + t.authorid + '">';
        html += '        <img src="' + t.portrait + '" align="absmiddle" alt="Vity" title="Vity" class="img-responsive" user="' + t.authorid + '">';
        html += '    </span>';
        html += '    <div class="body">';
        html += '        <span class="name">';
        html += '        ' + t.author + '：</span>';
        html += '        <span class="log">' + t.body + '</span>';
        if (t.imgSmall && t.imgBig) {
            if (/(jpg|png|gif|jpge)$/i.test(t.imgBig)) {
                html += '            <p><a target="_top" href="' + t.imgBig + '" class="fancybox"><img src="' + t.imgSmall + '"/></a></p>';
            }
        }
        html += '        <p class="time">' + t.pubDate + ' (';
        html += '            <a target="_blank" href="' + url + '" class="comment" id="comment_' + t.id + '">' + t.commentCount + '评</a>)';
        html += '        </p>';
        html += '    </div>';
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
        var url = 'http://my.oschina.net/' + ui.ident;

        var html = '';
        html += '<div class="left">';
        html += '    <img class="img-responsive" src="' + ui.portrait + '" title="' + ui.name + '"/>';
        html += '</div>';
        html += '<div class="right">';
        html += '    <span class="name"><a target="_blank" href="' + url + '" >' + ui.name + '</a></span><br/>';
        html += '    <span class="city">' + ui.province + '-' + ui.city + '</span><br/>';
        html += '    <span class="jointime">' + ui.joinTime + '</span>';
        html += '</div>';

        return html;
    }
};

//oschina 动弹的处理函数类库
var oschina_tweet_fun = function (oschina_tweet_api) {
    var _this = this;

    //显示列表
    _this.showlist = function (id, page, a, fun) {
        if (a) {
            $("#nav_showname").text($(a).text());
            $(".navbar-toggle").trigger('click');

            $("ul.navbar-nav li.active").removeClass("active");
            $($(a).parent()).addClass("active");
        }

        $("ul.pager").attr("data-tltype", id).attr("data-tlpage", page);

        var show = function (tweetlist) {
            $("div.row").hide();
            $("#DynaInfo").html(OTT.tweet_list(tweetlist)).slideDown();
            $("div.Pageer").show();

            if (fun) {
                fun();
            }
        }

        id = parseInt(id);
        if (id < -1) {
            oschina_tweet_api.myList(page, show);
        } else {
            oschina_tweet_api.getTweetlist(id, page, show);
        }
    };

    //读取并呈现用户信息
    _this.userinfo = function (id, fun) {
        id = parseInt(id);

        var show = function (info) {
            _this.showlist(info.user, 0, undefined, function () {
                $("#UserInfo").html(OTT.userinfo(info)).show();

                if (fun) {
                    fun();
                }
            });
        }

        if (isNaN(id) || id < 1) {
            oschina_tweet_api.myInfo(show);
        } else {
            oschina_tweet_api.userInfo(id, show);
        }
    };


};