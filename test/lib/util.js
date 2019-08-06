const test = require('tape')
const sinon = require('sinon')
const fs = require('fs')
const util = require('../../lib/util')

test('findInvalidOptions test with invalid options', function (t) {
	util.findInvalidOptions({}, function(e, v) {
		t.equal(v.length, 2); 
		t.end()
	})
})

test('findInvalidOptions test with invalid source', function (t) {
	util.findInvalidOptions({subtitle: "subs"}, function(e, v) {
		t.equal(v[0].message, "source is a required argument")
		t.end()
	})
})

test('findInvalidOptions test', function (t) {
	sinon.stub(fs, 'access').yields(null)
	util.findInvalidOptions({subtitle: "subs", source:"so"}, (e, v) => {
		t.equal(v.length, 0)
		fs.access.restore()
		t.end()
	})
})
