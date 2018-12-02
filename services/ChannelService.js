ChannelService = () => {}
module.exports = ChannelService

const nohm = require('nohm').Nohm
const config = require('../config/index')
const request = require('request')
const {filterLoad, isEmoji, paginationFilterList, paginationInlineKeyboard, splitLKT, pager, encrypt, decrypt} = require('../helper')
const moment = require('moment')
const persianJs = require('persianjs')
const jMoment = require('jalali-moment')
jMoment.loadPersian()

const Channel = require('../models/Channel')

ChannelService.create = (username) => {
  return new Promise((resolve, reject) => {
    let channel = new Channel()
    let channelData = {
      username: username,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    channel.p(channelData)
    channel.save((err) => {
      if(err) return reject(channel.errors)

      return resolve({data: filterLoad(channel), model: channel})
    })
  })
}

ChannelService.add = (username) => {
  return new Promise((resolve, reject) => {
    ChannelService.findByUsername(username).then(channel => {
      return reject('این کانال قبلا ثبت شده است.')
    }, err => {
      ChannelService.create(username).then(resolve, reject)
    })
  })
}

ChannelService.findById = (id) => {
  return new Promise((resolve, reject) =>
  {
    const channel = nohm.factory('Channel', id, (err) => {
      if (err) {
        return reject()
      }
      return resolve({data: filterLoad(channel), model: channel})
    })
  })
}

ChannelService.findByUsername = (username) => {
  return new Promise((resolve, reject) =>
  {
    Channel.findAndLoad({username: username}, (err, rows) => {
      if(!err && rows.length > 0) {
        return resolve({data: filterLoad(rows[0]), model: rows[0]})
      }
      return reject()
    })
  })
}

ChannelService.update = (model, newAttr) => {
  return new Promise((resolve, reject) =>
  {
    model.p(newAttr)
    model.save((err) => {
      if(err) return reject(err)

      return resolve({data: filterLoad(model), model: model})
    })
  })
}

ChannelService.manageList = (page=1, limit=10) => {
  return new Promise((resolve, reject) =>
  {
    Channel.sort({field: 'createdAt', direction: 'DESC', limit: [0, 1000000000]}, (err, ids) => {
      if(err || ids.length === 0) return reject()

      let options = {}
      const inlineKeyboard = paginationInlineKeyboard(ids.length, limit, 'admin_channel_page', page)
      if(inlineKeyboard !== null) {
        options.reply_markup = {inline_keyboard: inlineKeyboard}
      }

      ids = paginationFilterList(ids, page, limit)

      let list = []
      let count = 0
      ids.forEach(id => {
        ChannelService.findById(id).then(channel =>
        {
          list.push(channel.data)
          count++
          if(count === ids.length) {
            return resolve({message: ChannelService.filterManageList(list), options: options})
          }
        })
      })
    });
  })
}

ChannelService.getAll = () => {
  return new Promise((resolve, reject) =>
  {
    Channel.sort({field: 'createdAt', direction: 'DESC', limit: [0, 1000000000]}, (err, ids) => {
      if(err || ids.length === 0) return reject()

      let list = []
      let count = 0
      ids.forEach(id => {
        ChannelService.findById(id).then(channel =>
        {
          list.push(channel.data)
          count++
          if(count === ids.length) {
            return resolve(list)
          }
        })
      })
    })
  })
}

ChannelService.filterManageList = (list) => {
  let out = ''
  list.forEach(channel => {
    out += `/delete_channel_${channel.id} - @${channel.username}\n\n`
  })
  return out
}

ChannelService.delete = (id) => {
  return new Promise((resolve, reject) => {
    ChannelService.findById(id).then(channel => {
        channel.model.remove((err) => {
          if(err) return reject('مشکلی پیش آمده است! دوباره تلاش کنید.')
          return resolve('کانال مورد نظر حذف شد.')
        })
    }, () => {
      reject('کانالی یافت نشد.')
    })
  })
}
