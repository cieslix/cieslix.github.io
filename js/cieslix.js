;
var Cieslix = function ($) {
    "use strict";

    var self = this;
    this._masonry = null;
    this.containerId = null;
    this.itemClass = null;
    this.currentUrl = null;
    this.loaderGif = null;

    this.initLayout = function (currenturl, containerId, itemClass) {
        this.containerId = containerId;
        this.itemClass = itemClass;
        this.currentUrl = currenturl;
        this.loaderGif = $('#loader-gif');
        return this;
    };

    this.instagramInit = function () {
        $.ajax({
            method: "GET",
            url: this.currentUrl,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: "jsonpcallback"
        }).done(function (r) {
            if (self.loaderGif) {
                self.loaderGif.remove();
            }
            for (var i in r.data) {
                self._makeInstElement(r.data[i]);
            }
            self.masonry();
        });
    };

    this._makeInstElement = function (item) {
        var $div = $('<div />', {class: this.itemClass.replace('.', '')});
        if (!!item.images) {
            $div.prepend($('<img />', {
                src: item.images.low_resolution.url.replace('http:', document.location.protocol),
                id: item.id,
                alt: item.caption ? item.caption.text : ''
            }));
        }

        $div.append($('<p />', {
            text: item.caption ? item.caption.text : ''
        }));
        $div.prepend($('<small />', {
            text: new Date(item.created_time * 1000).toJSON().substring(0, 10)
        }));

        if (!!item.link) {
            $div.append($('<a />', {
                href: item.link,
                text: '--- see more ---'
            }));
        }
        this._masonryAdd($div);
    };

    this._makeElement = function (item) {
        var $div = $('<div />', {class: this.itemClass.replace('.', '')});
        if (!!item.picture) {
            $div.prepend($('<img />', {
                src: item.picture,
                id: item.object_id ? item.object_id : item.id,
                alt: item.id
            }));
        }

        $div.append($('<p />', {
            text: item.story ? item.story : item.message
        })).prepend('<br />');
        $div.prepend($('<small />', {
            text: new Date(item.created_time).toJSON().substring(0, 10)
        }));

        if (!!item.link) {
            $div.append($('<a />', {
                href: item.link,
                text: '--- see more ---'
            }));
        }
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
                        if (self.loaderGif) {
                            self.loaderGif.remove();
                        }
                        $(response.data).each(function () {
                            self._makeElement(this);
                        });
                        if (!!response.paging && response.paging.next) {
                            self.currentUrl = response.paging.next;
                        }
                        self._scrollEvent();
                        self.masonry();

                    }
                }
            );
        }
        return this;
    };

    this.masonry = function () {
        if (this._masonry === null) {
            this._masonry = new Masonry(this.containerId, {
                // options
                columnWidth: this.itemClass,
                itemSelector: this.itemClass
            });
        }
        $(this.containerId).imagesLoaded(function () {
            self._masonry.layout();
        });
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
    };

    this.facebookLogin = function () {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                self.getFeed();
            }
            else {
                FB.login(function () {
                    self.getFeed();
                }, {scope: 'user_likes'});
            }
        });
        return this;
    };
}
