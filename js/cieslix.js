;
var Cieslix = function ($) {
    "use strict";

    var self = this;
    this._masonry = undefined;
    this.containerId = undefined;
    this.itemClass = undefined;
    this.currentUrl = undefined;

    this.initLayout = function (currenturl, containerId, itemClass) {
        this.containerId = containerId;
        this.itemClass = itemClass;
        this.currentUrl = currenturl;
        return this;
    }

    this._makeElement = function (item) {
        var $div = $('<div />', { class: this.itemClass.replace('.', '')});
        if (!!item.picture) {
            var $img = $('<img />', {
                src: item.picture,
                id: item.object_id ? item.object_id : item.id,
                alt: item.id
            });
            $div.prepend($img)
        }
        var $p = $('<p />', { text: item.story ? item.story : item.message });
        var $a = $('<a />', { href: item.link, text: '--- see more ---' });
        var $small = $('<small />', {
            text: new Date(item.created_time).toJSON().substring(0, 10)
        });
        $p.append($small).append('<br />');
        $div.append($p).append($a);
        this._masonryAdd($div);
    };

    this.getSource = function (fbId) {
        FB.api(
            '/' + fbId,
            function (response) {
                if (response && !response.error) {
                    console.log(response);
                }
            }
        );
        return this;
    };

    this.getFeed = function () {
        if (!!this.currentUrl) {
            FB.api(
                self.currentUrl,
                function (response) {
                    if (response && !response.error) {
                        $(response.data).each(function () {
                            self._makeElement(this);
                        });
                        if (!!response.paging && response.paging.next) {
                            self.currentUrl = response.paging.next;
                        }
                        self._scrollEvent();
                    }
                }
            );
        }
        return this;
    };

    this.masonry = function () {
        if (this._masonry === undefined) {
            this._masonry = new Masonry(this.containerId, {
                // options
                columnWidth: 200,
                itemSelector: this.itemClass
            });
        }
        this._masonry.layout();
        return this;
    };

    this._masonryAdd = function (element) {
        $(this.containerId).append(element);
        this._masonry.appended(element);
    };

    this._scrollEvent = function () {
        new ScrollToggle($(self.itemClass + ':last').position().top,
            function () {
                self.getFeed();
            },
            function () {
                /* do nothing */
            });
    }

    this.facebookLogin = function (callback) {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                console.log('Logged in.');
                callback;
            }
            else {
                FB.login(function () {
                    callback;
                }, {scope: 'publish_actions'});
            }
        });
        return this;
    };

    this.delay = function (callback, time) {
        setTimeout(callback, time);
        return this;
    }
};
