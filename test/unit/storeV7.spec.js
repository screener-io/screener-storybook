const expect = require('chai').expect;
const alignStories = require('../../src/storeV7').alignStories;

describe('screener-storybook/src/storeV7', function() {

  it('aligns V7 raw top level stories into array form', function() {
    const fixture = require('../fixture/storyStoreV7-stories-minimal-1.json');
    expect(fixture['example-button--primary']).to.not.be.undefined;
    const aligned = alignStories(fixture);
    expect(aligned).to.be.an('array');
    expect(aligned.length).to.equal(2);
  });

  it('retains inner structure of aligned stories', function() {
    const fixture = require('../fixture/storyStoreV7-stories-basic-1.json');
    expect(fixture['example-button--primary']).to.not.be.undefined;
    const aligned = alignStories(fixture);
    expect(aligned).to.be.an('array');
    expect(aligned.length).to.equal(8);

    const first = aligned[0];
    expect(first.kind).to.not.be.undefined;
  });
});