$(document).ready(function () {
    OTA.init({
        //OSCHINA 应用 id
        id: 'KTWAuwxdcxxv1EL5OQcT',
        //OSCHINA 应用 key
        key: 'wA3OBjusv6hST2nNFzxshVbu3xuqcOyJ'
    }).auth();

    OTF.showlist(0, 1);
    OTF.userinfo();

    $("#a_showlist_new").click(function () {
        $("div.Pageer").slideDown();
        OTF.showlist(0, 1, this);
    });

    $("#a_showlist_hot").click(function () {
        $("div.Pageer").slideUp();
        OTF.showlist(-1, 1, this);
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

        var au_url = OTA.getAuthUrl();

        window.location = au_url;
        //window.open(au_url);
    });
});