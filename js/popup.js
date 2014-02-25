$(document).ready(function () {
    OSC.init({
        //OSCHINA 应用 id
        id: 'KTWAuwxdcxxv1EL5OQcT',
        //OSCHINA 应用 key
        key: 'wA3OBjusv6hST2nNFzxshVbu3xuqcOyJ'
    });

    OSC.get('tweet_list', {
        client_id: OSC.data.id,
        user: 0,
        page: 1
    }, function (res) {
        $(".container .jumbotron .row").html(Template.tweet_list(res.tweetlist));
    });
});