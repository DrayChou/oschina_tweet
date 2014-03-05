$(document).ready(function () {
    var OTA = new oschina_tweet_api({
        //OSCHINA 应用 id
        id: 'KTWAuwxdcxxv1EL5OQcT',
        //OSCHINA 应用 key
        key: 'wA3OBjusv6hST2nNFzxshVbu3xuqcOyJ'
    });
    var OTF = new oschina_tweet_fun(OTA);

    $(location).change(function () {
        console.log(this);
    });

    //请求授权
    OTA.auth();

    //默认呈现页面
    OTF.showlist(0, 1);
    
    $("#a_showlist_new").click(function () {
        OTF.showlist(0, 1, this);
    });

    $("#a_showlist_hot").click(function () {
        OTF.showlist(-1, 1, this);
    });

    $("#a_showlist_my").click(function () {
        OTF.showlist(-2, 1, this);
    });

    $("#a_reload").click(function () {
        var t = $("ul.pager").attr('data-tltype');
        OTF.showlist(t, 1);
    });

    $("#a_loadmore").click(function () {
        var t = $("ul.pager").attr('data-tltype');
        var p = parseInt($("ul.pager").attr('data-tlpage'));
        OTF.showlist(t, p + 1);
    });

    $("#a_show_pop").click(function () {
        $("div.row").hide();
        $("div#TweetPub").slideDown();
        $(".navbar-toggle").trigger('click');
    });

    $("#TweetPub .btn-primary").click(function () {
        var msg = $("#TweetPub textarea[name='msg']").val();
        var img = $("#TweetPub input[name='img']").val();
        OTA.tweet(msg, img, function (res) {
            if (res.error == "200") {
                $("#a_showlist_new").trigger('click');

                $("#TweetPub input").val('');
                $("#TweetPub textarea").val('');
            } else {
                alert(res.error_description);
            }
        });
    });

    $("#DynaInfo").on('click', '.user .img', function () {
        var id = $(this).attr('data-id');
        OTF.userinfo(id);
    });
});