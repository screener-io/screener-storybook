const expect = require('chai').expect;
const { alignStories } = require('../../src/scripts/story-steps');

var storyStoreMock = {
  fromId: () => {
    return {
      name: 'mock--name',
      storyFn: () => {},
      kind: 'mock-kind'
    };
  }
};

describe('screener-storybook/src/storeV7', function() {
  it('aligns V7 raw top level stories into array form', function() {
    const fixture = require('../fixture/storyStoreV7-stories-minimal-1.json');
    expect(fixture['v']).to.not.be.undefined;
    expect(fixture['stories']).to.not.be.undefined;
    expect(fixture['stories']['example-introduction--page']).to.not.be.undefined;
    const aligned = alignStories(fixture.stories, storyStoreMock);
    expect(aligned).to.be.an('array');
    expect(aligned.length).to.equal(2);
  });

  it('retains inner structure of aligned stories (v7)', function() {
    const fixture = require('../fixture/storyStoreV7-stories-basic-1.json');
    const aligned = alignStories(fixture.stories, storyStoreMock);
    expect(aligned.length).to.equal(9);

    const first = aligned[0];
    expect(first.kind).to.not.be.undefined;
  });

  it('aligns V5 raw top level stories into array form', function() {
    const fixture = require('../fixture/storyStoreV5-stories-minimal-1.json');
    expect(fixture).to.not.be.undefined;
    expect(fixture['example-introduction--page']).to.not.be.undefined;
    const aligned = alignStories(fixture, storyStoreMock);
    expect(aligned).to.be.an('array');
    expect(aligned.length).to.equal(2);
  });

  it('retains inner structure of aligned stories (v5)', function() {
    const fixture = require('../fixture/storyStoreV5-stories-basic-1.json');
    const aligned = alignStories(fixture, storyStoreMock);
    expect(aligned.length).to.equal(9);

    const first = aligned[0];
    expect(first.kind).to.not.be.undefined;
  });
});