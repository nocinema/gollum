'use strict';

const expect = require('chai').expect;
const path = require('path');

// Import classes for testing
const Cinespaco = require(path.join(__dirname, '../../modules', 'cinespaco.crawler.class'));

describe.only('Cinespaço', () => {
    let Crawler;
    let result;

    before(function(done) {
        Crawler = new Cinespaco();
        const url = 'http://cinespaco.com.br/cidade/santos';
        Crawler.getScheduleByUrl(url)
            .then(function(json) {
                result = json;
                done();
            })
            .catch(done);
    });

    it('getScheduleByUrl(): Should return schedule JSON', () => {
        expect(result.city)
            .to.be.equal('Santos');

        expect(result.place)
            .to.be.equal('Miramar Shopping');

        expect(result.sessions)
            .to.not.be.null;

        result.sessions.forEach((session) => {
            expect(session.censorship).to.not.be.null;
        });
    });

    it('getScheduleByCityAndPlace(): Should return schedule JSON', (done) => {
        Crawler.getScheduleByCityAndPlace('santos', 'santos')
            .then(function(json) {
                expect(json.city)
                    .to.be.equal('Santos');

                expect(json.place)
                    .to.be.equal('Miramar Shopping');

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
