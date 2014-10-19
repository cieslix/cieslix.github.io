"use strict";
$(document).ready(function () {
    Cieslix.masonry();
    setTimeout(Cieslix.getFeed, 1000);
});

var Cieslix = Cieslix || {
    _masonry: undefined,
    container: '#container',
    itemClass: '.item',
    currentUrl: "/{{ site.facebook_page_id }}/feed",

    makeElement: function (item, $parent) {
        var $div = $('<div class="item"/>');
        if (!!item.picture) {
            var $img = $('<img />', {
                src: item.picture,
                id: item.object_id ? item.object_id : item.id,
                alt: item.id,
                onclick: "Cieslix.getSource(this.id)"
            });
            $div.prepend($img)
        }
        var $p = $('<p />', { text: item.story ? item.story : item.message });
        var $a = $('<a />', { href: item.link, text: '--- see more ---' });
        var $small = $('<small />', {text: new Date(item.created_time).toJSON().substring(0, 10)});
        $p.prepend('<br />').prepend($small);
        $div.append($p).append($a);
        $parent.append($div);
        Cieslix.masonryAdd($div);
    },

    getSource: function (fbId) {
        FB.api(
            '/' + fbId,
            function (response) {
                if (response && !response.error) {
                    console.log(response);
                }
            }
        );
    },

    getFeed: function () {
        if (!!Cieslix.currentUrl) {
            FB.api(
                Cieslix.currentUrl,
                function (response) {
                    if (response && !response.error) {
                        $(response.data).each(function () {
                            Cieslix.makeElement(this, $('#container'));
                        });
                        if (!!response.paging && response.paging.next) {
                            Cieslix.currentUrl = response.paging.next;
                        }
                        Cieslix.scrollEvent();
                    }
                }
            );
        }
    },

    masonry: function () {
        if (this._masonry === undefined) {
            this._masonry = new Masonry(this.container, {
                // options
                columnWidth: 200,
                itemSelector: this.itemClass
            });
        }
        this._masonry.layout();
    },

    masonryAdd: function (element) {
        this._masonry.appended(element);
    },

    scrollEvent: function () {
        new ScrollToggle($(this.itemClass + ':last').position().top, function () {
            Cieslix.getFeed();
        }, function () {
        });
    },

    facebookLogin: function () {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                console.log('Logged in.');
            }
            else {
                FB.login(function () {
                }, {scope: 'publish_actions'});
            }
        });
    }
}

