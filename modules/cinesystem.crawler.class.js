'use strict';

// Require node_modules dependencies
let path = require('path');

// Require other classes, files or configs
let MainCrawler = require(path.join(__dirname, '../modules', 'main.crawler.class'));

module.exports = class CinesystemCrawler extends MainCrawler {
    getScheduleByUrl(url) {
        return new Promise((resolve, reject) => {
            this._mineSite(url)
                .then(function(schedule) {
                    return resolve(schedule);
                });
        });
    }

    getScheduleByCityAndPlace(city, place) {
        return new Promise((resolve, reject) => {
            let url = this.getUrlsFromCity('cinesystem', city, place);

            this._mineSite(url)
                .then(function(schedule) {
                    return resolve(schedule);
                });
        });
    }

    _mineSite(url) {
        let _this = this;
        return new Promise((resolve, reject) => {
            let dom = '#programacao_cinema > .row';
            super.getDynamicPageByPuppeteer(url, dom)
                .then(function($) {
                    let movies = [];
                    let cinema = {
                        cinema: 'cinesystem',
                        city: String,
                        city_normalized: String,
                        place: String,
                        place_normalized: String,
                        sessions: []
                    };

                    let text = $('.titulo-internas').text().split('(');
                    let city = text[0].trim();
                    let place = text[1].replace(')', '');

                    cinema.city = city;
                    cinema.place = place;

                    cinema.city_normalized = _this.stringNormalize(city);
                    cinema.place_normalized =  _this.stringNormalize(place);

                    cinema.sessions = $(dom).map((i, room) => {
                        let titleDOM = $(room).find('.nome-cinema').text();
                        let title = titleDOM.slice(0, titleDOM.length - 2)
                        let censorship = titleDOM.slice(-2)
                        let roomsDOM = $(room).find('.painel-salas')
                        let type = $(roomsDOM).find('.painel-salas-info span').eq(0).text()
                        let hours = $(roomsDOM).find('.list-inline .list-inline-item strong').map((i, el) => $(el).text()).get()
                        let special = $(roomsDOM).find('.painel-salas-info span').eq(1).text() ? true : false

                        return {
                            title: title,
                            type: type,
                            censorship: censorship,
                            special: special,
                            hours: hours
                        }
                    }).get()

                    return resolve(cinema)

                });
        });
    }

    getCinemasURLs() {
        return new Promise((resolve, reject) => {
            const url = 'https://www.cinesystem.com.br';
            super.getStaticPage(url)
                .then(($) => {
                    let urlsArr = [];

                    $('.dropdown-cinemas li').each((key, link) => {
                        let text = $(link).text();
                        let cinemaObj = {
                            cinema: 'cinesystem',
                            place: String,
                            place_label: String,
                            city: String,
                            city_label: String,
                            url: String
                        };

                        var city = text.split('(')[0].trim();
                        var place = text.match(/\(([^)]+)\)/)[1];

                        // labels
                        cinemaObj.city_label = city;
                        cinemaObj.place_label = place;

                        // normalized
                        cinemaObj.place = super.stringNormalize(place);
                        cinemaObj.city = super.stringNormalize(city);

                        // url
                        cinemaObj.url = url + $(link).find('a').attr('href');
                        urlsArr.push(cinemaObj);
                    });

                    super.writeUrlsFile('cinesystem', urlsArr)
                        .then(function(val) {
                            return resolve(val);
                        })
                        .catch(function(err) {
                            return reject(err);
                        });

                })
                .catch(function(err) {
                    return reject(err);
                });
        });
    }

}
