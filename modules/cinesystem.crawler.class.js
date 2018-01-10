'use strict';

// Require node_modules dependencies
let path = require('path');
let cheerio = require('cheerio');

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
            super.getStaticPage(url)
                .then(function($) {
                    let movies = [];
                    let dom = '#programacao_cinema .sala-comum';
                    let cinema = {
                        cinema: 'cinesystem',
                        city: String,
                        city_normalized: String,
                        place: String,
                        place_normalized: String,
                        sessions: []
                    };

                    let city = $('.title-city').text();
                    let place = city.match(/\(([^)]+)\)/)[1];

                    city = city.replace(/ *\([^)]*\) */g, "");

                    cinema.city = city;
                    cinema.place = place;

                    cinema.city_normalized = _this.stringNormalize(city);
                    cinema.place_normalized =  _this.stringNormalize(place);

                    $(dom).each(function() {
                        let title = $(this).find('div table tbody td h2').text();
                        let type = $(this).find('.sessoes table tbody tr td').eq(0).text().trim();

                        $(this).find('.sessoes table tbody tr td strong').remove();

                        let special = $(this).find('.categoria img').attr('src') ? true : false;
                        let censorship = _this._getCensorShip($(this).find('.classificacao').attr('class'));
                        let hours = $(this).find('.sessoes table tbody tr td').eq(1).html().trim();
                        hours = hours.replace(/ /g,'').replace(/,/g, '');
                        hours = hours.match(/.{1,5}/g);

                        let movie = {
                            title: title,
                            type: type,
                            censorship: censorship,
                            special: special,
                            hours: hours
                        };

                        movies.push(movie);
                    });

                    cinema.sessions = movies;
                    return resolve(cinema);

                });
        });
    }

    _getCensorShip(str) {
        str = str.replace('classificacao ', '');

        switch (str) {
            case 'doze':
              return 12;
            break;

            case 'quatorze':
              return 14;
            break;

            case 'dezesseis':
              return 16;
            break;

          default:
              return str;
        }
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
