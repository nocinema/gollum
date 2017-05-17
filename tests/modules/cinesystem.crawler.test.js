'use strict';

let expect = require('chai').expect;
let path = require('path');

// Import classes for testing
let CinesystemCrawler = require(path.join(__dirname, '../../modules', 'cinesystem.crawler.class'));

describe('CinesystemCrawler', () => {
    let Crawler;
    let result;

    before(function(done) {
        Crawler = new CinesystemCrawler();
        const url = 'http://www.cinesystem.com.br/florianopolis/programacao';
        Crawler.getScheduleByUrl(url)
            .then(function(json) {
                result = json;

                done();
            })
            .catch(done);
    });

    it.only('getScheduleByUrl(): Should return schedule JSON', () => {
        expect(result.city)
            .to.be.equal('Florianópolis');

        expect(result.place)
            .to.be.equal('Shopping Center Iguatemi');

        expect(result.sessions)
            .to.not.be.null;
            
        result.sessions.forEach((session) => {
            expect(session.censorship).to.not.be.null;
        });
    });

    it('getScheduleByCityAndPlace(): Should return schedule JSON', (done) => {
        Crawler.getScheduleByCityAndPlace('florianopolis', 'shopping center iguatemi')
            .then(function(json) {
                expect(json.city)
                    .to.be.equal('Florianópolis');

                expect(json.place)
                    .to.be.equal('Shopping Center Iguatemi');

                expect(json.sessions)
                    .to.not.be.null;

                done();
            })
            .catch(done);
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
