'use strict';

const Model = require('../../../apps/common/models/file-upload');
const config = require('../../../config');

describe('File Upload Model', () => {

  beforeEach(function() {
    config.upload.hostname = 'http://test.example.com/file/upload';
    this.stub(Model.prototype, 'request').yieldsAsync(null, {
      api: 'response',
      url: '/file/12341212132123?foo=bar'
    });

    this.stub(Model.prototype, 'auth').returns(new Promise((resolve) => {
      resolve({bearer: 'myaccesstoken'});
    }));
  });

  describe('save', () => {
    it('returns a promise', () => {
      const model = new Model();
      const response = model.save();
      expect(response).to.be.an.instanceOf(Promise);
    });

    it('makes a call to file upload api', () => {
      const model = new Model();
      const response = model.save();
      return response.then(() => {
        expect(model.request).to.have.been.calledOnce;
        expect(model.request).to.have.been.calledWith(sinon.match({
          method: 'POST',
          host: 'test.example.com',
          path: '/file/upload',
          protocol: 'http:'
        }));
      });
    });

    it('resolves with response from api endpoint', () => {
      const model = new Model();
      const response = model.save();
      return expect(response).to.eventually.deep.equal({
        api: 'response',
        url: '/vault/12341212132123?foo=bar&token=myaccesstoken'
      });
    });

    it('rejects if api call fails', () => {
      const model = new Model();
      const err = new Error('test error');
      model.request.yieldsAsync(err);
      const response = model.save();
      return expect(response).to.be.rejectedWith(err);
    });

    it('adds a formData property to api request with details of uploaded file', () => {
      const uploadedFile = new Model({
        data: 'foo',
        name: 'myfile.png',
        mimetype: 'image/png'
      });
      const response = uploadedFile.save();
      return response.then(() => {
        expect(uploadedFile.request).to.have.been.calledWith(sinon.match({
          formData: {
            document: {
              value: 'foo',
              options: {
                filename: 'myfile.png',
                contentType: 'image/png'
              }
            }
          }
        }));
      });
    });

  });

});
