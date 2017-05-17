'use strict';

let expect = require('chai').expect;
let path = require('path');

// Import classes for testing
let CinesystemCrawler = require(path.join(__dirname, '../../modules', 'cinesystem.crawler.class'));

describe('CinesystemCrawler', () => {
    let Crawler;

    let cinemaRequiredFields = ['cinema', 'city', 'place'];
    let sessionRequiredFields = ['title', 'censorship', 'special', 'hours'];

    let scheduleByUrl;
    let scheduleByCityAndPlace;

    before(function() {
        Crawler = new CinesystemCrawler();
    });

    before(function(done) {
        Crawler.getScheduleByUrl('http://www.cinesystem.com.br/florianopolis/programacao')
            .then(function(json) {
                scheduleByUrl = json;
                done();
            })
        .catch(done);
    });

    before(function(done) {
        Crawler.getScheduleByCityAndPlace('florianopolis', 'shopping center iguatemi')
            .then(function(json) {
                scheduleByCityAndPlace = json;
                done();
            })
            .catch(done);
    });

    it('getScheduleByUrl(): Should return schedule JSON', () => {
        cinemaRequiredFields.forEach((requiredField) => {
            expect(scheduleByUrl).to.have.property(requiredField);
            expect(scheduleByUrl[requiredField]).to.have.length.above(1);
        });

        sessionRequiredFields.forEach((requiredField) => {
            scheduleByUrl.sessions.forEach(function(field) {
                expect(field).to.have.property(requiredField);
                expect(field[requiredField]).to.not.be.undefined;
            });
        });
    });

    it('getScheduleByCityAndPlace(): Should return schedule JSON', () => {
        cinemaRequiredFields.forEach((requiredField) => {
            expect(scheduleByCityAndPlace).to.have.property(requiredField);
            expect(scheduleByCityAndPlace[requiredField]).to.have.length.above(1);
        });

        sessionRequiredFields.forEach((requiredField) => {
            scheduleByCityAndPlace.sessions.forEach(function(field) {
                expect(field).to.have.property(requiredField);
                expect(field[requiredField]).to.not.be.undefined;
                expect(field[requiredField]).to.not.be.null;
            });
        });
    });

    it('getCinemasURLs(): Should return a valid URLs cinemas JSON', (done) => {
        Crawler.getCinemasURLs()
            .then(function(json) {
                expect(json).to.not.be.null;
                done();
            })
            .catch(done);
    });
});
