const nohm = require('nohm').Nohm;

module.exports = nohm.model('Channel', {
  idGenerator: 'increment',
  properties: {
    username: {
      type: 'string',
      index: true,
    },
    createdAt: {
      type: 'string',
    }
  },
});
