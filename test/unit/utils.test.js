const { expect } = require('chai')
const path = require('path')
const utils = require(path.resolve(__dirname, '../../src/helpers/utils'))

describe('helpers/utils', function () {
  describe('applyMaxTextLength', function () {
    it('should truncate strings longer than MAX_FIELD_TEXT_LENGTH (255)', function () {
      const long = 'a'.repeat(300)
      const r = utils.applyMaxTextLength(long)
      expect(r).to.be.a('string')
      expect(r.length).to.equal(255)
    })

    it('should not modify short strings', function () {
      const s = 'short text'
      const r = utils.applyMaxTextLength(s)
      expect(r).to.equal(s)
    })
  })

  describe('applyMaxShortTextLength', function () {
    it('should truncate to 25 chars', function () {
      const long = 'b'.repeat(100)
      const r = utils.applyMaxShortTextLength(long)
      expect(r.length).to.equal(25)
    })
  })

  describe('applyExtremeTextLength', function () {
    it('should truncate to 2000 chars', function () {
      const long = 'c'.repeat(3000)
      const r = utils.applyExtremeTextLength(long)
      expect(r.length).to.equal(2000)
    })
  })

  describe('sanitizeFieldPlainText', function () {
    it('should strip script tags and unsafe HTML', function () {
      const dirty = '<div>ok</div><script>alert(1)</script><b>bold</b>'
      const clean = utils.sanitizeFieldPlainText(dirty)
      expect(clean).to.not.include('<script>')
      expect(clean).to.include('ok')
      expect(clean).to.include('bold')
    })
  })
})
