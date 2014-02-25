var Template = {
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
            html += Template.tweet(this);
        });
        html += '</ul>'

        return html;
    }
};