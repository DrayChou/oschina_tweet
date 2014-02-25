var OSC = {

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
        $.extend(OSC.data, settings);
    },

    post: function (api, settings, callback) {
        console.log(api);
        console.log(settings);
        console.log(callback);

        if (!OSC.data[api]) {
            return false;
        }
        $.post(OSC.data[api], settings, function (res) {
            console.log(res);
            callback(res);
        }, 'json');
        return;
    },
    get: function (api, settings, callback) {
        return OSC.post(api, settings, callback);
    }
};