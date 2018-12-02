const TelegramBot = require('node-telegram-bot-api')
const nohm = require('nohm').Nohm
const redisClient = require('redis').createClient()
const uuidV1 = require('uuid/v1')

const express = require("express")
const app = express()

const config = require('./config/index')
const {sendPostMessage, editPostMessage, logError} = require('./helper')

const StartService    = require('./services/StartService')
const UserService     = require('./services/UserService')
const PostService     = require('./services/PostService')
//const CommentService  = require('./services/CommentService')
//const OrderService    = require('./services/OrderService')
const LikeService     = require('./services/LikeService')
const ChannelService  = require('./services/ChannelService')
//const PaymentService  = require('./services/PaymentService')


redisClient.on('connect', () => {
  redisClient.select(5); // liker db
  nohm.setClient(redisClient);

  const bot = new TelegramBot(config.telegram.token, {polling: true})

  /**
   *****************************************************************************************
   * EXPRESS API
   */
  /*app.set('port', process.env.PORT || 5008)
  app.get('/zarinpal-verify/:trackingCode', function(req, res) {
    PaymentService.zarinpalVerify(req.params.trackingCode, req.query.Authority, req.query.Status).then((result) => {
      bot.sendMessage(result.tgId, result.message, result.options).then().catch(e => logError(e, user, 'zarinpal_verify'))
      res.redirect(result.url)
    }, (error) => {
      if(error.tgId !== null) bot.sendMessage(error.tgId, error.message).then().catch(e => logError(e, user, 'zarinpal_verify_error'))
      res.redirect(error.url)
    })
  })
  app.listen(app.get('port'), () => console.log(`App is Running on Port ${app.get('port')}.`))*/

  /**
   *****************************************************************************************
   * MESSAGE API BOT
   */
  bot.on('message', msg => {
    const from = msg.from
    const text = (msg.text !== undefined) ? msg.text : null
    const chatId = msg.chat.id

console.log(msg);

    UserService.findAndCreate(from).then(user =>
    {
      const isAdmin = (config.telegram.adminTgIds.indexOf(user.data.tgId) > -1)
      /**
       * start command
       */
      if(isAdmin) {
        if(text === '/start' || text === config.message.cancel_keyboard) {
          StartService.start(user).then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'start'))
          })
        }
        /**
         * create new channel
         */
        else if(text === config.message.add_new_channel) {
          UserService.update(user.model, {state: 'add_new_channel'})
          bot.sendMessage(chatId, 'یوزرنیم کانال را بدون @ وارد کنید.').then().catch(e => logError(e, user, 'start'))
        }
        /**
         * manage channels
         */
        else if(text === config.message.manage_channels) {
          ChannelService.manageList().then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'admin_user_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, 'کانالی یافت نشد.').then()
          })
        }
        /**
         * start insert comment
         */
        /*else if(text !== null && (match = text.match(/^\/start cm-(\d+)$/i))) {
          CommentService.start(user, match[1]).then(result =>
          {
            sendPostMessage(bot, chatId, result.post).then(() => {
              bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'start cm'))
            }).catch(e => logError(e, user, 'start cm post'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * start insert order
         */
        /*else if(text !== null && (match = text.match(/^\/start order-(\d+)$/i))) {
          OrderService.start(user, match[1]).then(result =>
          {
            sendPostMessage(bot, chatId, result.post).then(() => {
              bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'start order'))
            }).catch(e => logError(e, user, 'start order post'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * start post
         */
        else if(text !== null && (match = text.match(/^\/start p(\w+)$/i))) {
          PostService.publishByKey(match[1]).then(result => {
            sendPostMessage(bot, chatId, result).then()
          })
        }
        /**
         * create post keyboard
         */
        else if(text === config.message.create_post_keyboard) {
          PostService.keyboardCreate(user).then(result => {
            bot.sendMessage(chatId, result.message, config.keyboard.cancelKeyboard).then().catch(e => logError(e, user, 'create_post_keyboard'))
          })
        }
        /**
         * like & comment & order keyboard for create post
         */
        /*else if(text === config.message.create_post_like_comment_order_keyboard) {
          if(user.data.chargeAmount > 0) {
            PostService.keyboardCreateWithLikeAndCommentAndOrder(user).then(result => {
              bot.sendMessage(chatId, result.message, {reply_markup: {remove_keyboard: true}}).then().catch(e => logError(e, user, 'create_post_like_comment_keyboard'))
            })
          } else {
            bot.sendMessage(chatId, config.message.finish_charge_amount).then(() => {
              UserService.selfStatus(user).then(result => {
                bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'status_account_keyboard'))
              })
            })
          }
        }*/
        /**
         * like & comment keyboard for create post
         */
        /*else if(text === config.message.create_post_like_comment_keyboard) {
          PostService.keyboardCreateWithLikeAndComment(user).then(result => {
            bot.sendMessage(chatId, result.message, {reply_markup: {remove_keyboard: true}}).then().catch(e => logError(e, user, 'create_post_like_comment_keyboard'))
          })
        }*/
        /**
         * like & order keyboard for create post
         */
        /*else if(text === config.message.create_post_like_order_keyboard) {
          if(user.data.chargeAmount > 0) {
            PostService.keyboardCreateWithLikeAndOrder(user).then(result => {
              bot.sendMessage(chatId, result.message, {reply_markup: {remove_keyboard: true}}).then().catch(e => logError(e, user, 'create_post_like_order_keyboard'))
            })
          } else {
            bot.sendMessage(chatId, config.message.finish_charge_amount).then(() => {
              UserService.selfStatus(user).then(result => {
                bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'status_account_keyboard'))
              })
            })
          }
        }*/
        /**
         * like keyboard for create post
         */
        else if(text === config.message.create_post_like_keyboard) {
          PostService.keyboardCreateWithLike(user).then(result => {
            bot.sendMessage(chatId, result.message, {reply_markup: {remove_keyboard: true}}).then().catch(e => logError(e, user, 'create_post_like_keyboard'))
          })
        }
        /**
         * my post list
         */
        else if(text === config.message.post_list_keyboard) {
          PostService.selfList(user).then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'post_list_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }
        /**
         * my status
         */
        /*else if(text === config.message.status_account_keyboard) {
          UserService.selfStatus(user).then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'status_account_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * view post by id
         */
        else if(text !== null && (match = text.match(/^\/post_(\d+)$/i))) {
          PostService.selfView(user, match[1]).then(result => {
            sendPostMessage(bot, chatId, result).then().catch(e => logError(e, user, 'post(d)'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }
        /**
         * delete channel
         */
        else if(text !== null && (match = text.match(/^\/delete_channel_(\d+)$/i))) {
          const id = parseInt(match[1])
          ChannelService.delete(id).then(res => {
            bot.sendMessage(chatId, res).then()
          }, err => {
            bot.sendMessage(chatId, err).then()
          })
        }
        /**
         * view comment by id
         */
        /*else if(text !== null && (match = text.match(/^\/comment_(\d+)$/i))) {
          CommentService.selfView(user, match[1]).then(result => {
            sendPostMessage(bot, chatId, result).then().catch(e => logError(e, user, 'comment(d)'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * view order by id
         */
        /*else if(text !== null && (match = text.match(/^\/order_(\d+)$/i))) {
          OrderService.selfView(user, match[1]).then(result => {
            sendPostMessage(bot, chatId, result).then().catch(e => logError(e, user, 'order(d)'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * manage users
         */
        /*else if(isAdmin && text === config.message.admin_user_keyboard) {
          UserService.manageList().then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'admin_user_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * manage posts
         */
        else if(isAdmin && text === config.message.admin_post_keyboard) {
          PostService.manageList().then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'admin_post_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }
        /**
         * manage payments
         */
        /*else if(isAdmin && text === config.message.admin_payment_keyboard) {
          PaymentService.manageList().then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'admin_payment_keyboard'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * manage post by id
         */
        else if(isAdmin && text !== null && (match = text.match(/^\/admin_post(\d+)$/i))) {
          const postId = match[1]
          PostService.manageInfo(postId).then(result => {
            sendPostMessage(bot, chatId, result).catch(e => logError(e, user, 'start admin-post'))
          })
        }
        /**
         * manage post comment by id
         */
        /*else if(isAdmin && text !== null && (match = text.match(/^\/admin_post_comment(\d+)$/i))) {
          const commentId = match[1]
          CommentService.findById(commentId).then(result => {
            sendPostMessage(bot, chatId, {
              id: result.data.id,
              type: result.data.type,
              params: JSON.parse(result.data.params),
              options: {},
              postModel: null
            }).catch(e => logError(e, user, 'start admin-post-comment'))
          })
        }*/
        /**
         * manage comment increase
         */
        /*else if(isAdmin && user.data.state === 'admin_post_comment_increase') {
          PostService.manageIncreaseCommentCount(user, parseInt(text)).then(result => {
            editPostMessage(bot, result.post)
            bot.sendMessage(chatId, result.message).then(() => {
              bot.sendMessage(chatId, config.message.enter_comment_user_increase).then().catch(e => logError(e, user, 'enter_comment_user_increase'))
            }).catch(e => logError(e, user, 'admin_post_comment_increase'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * manage comment user increase
         */
        /*else if(isAdmin && user.data.state === 'admin_post_comment_user_increase') {
          PostService.manageIncreaseCommentUserCount(user, parseInt(text)).then(result => {
            editPostMessage(bot, result.post)
            bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'admin_post_comment_user_increase'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * manage like increase
         */
        else if(isAdmin && user.data.state === 'admin_post_like_increase') {
          PostService.manageIncreaseLikeCount(user, parseInt(text)).then(result => {
            editPostMessage(bot, result.post)
            bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'admin_post_like_increase'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }
        /**
         * create new channel
         */
        else if(user.data.state === 'add_new_channel') {
          ChannelService.add(text).then(result => {
            UserService.update(user.model, {state: 'start'})
            bot.sendMessage(chatId, 'کانال جدید با موفقیت اضافه شد.').then().catch(e => logError(e, user, 'add_new_channel'))
          }, (error) => {
            bot.sendMessage(chatId, error).then()
          })
        }
        /**
         * get comment text
         */
        /*else if(user.data.state === 'start_comment') {
          CommentService.add(user, msg).then(result => {
            bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'start_comment'))
            editPostMessage(bot, result.post).catch((err) => {})

            // notification to owner
            bot.sendMessage(result.owner.tgId, result.owner.message, result.owner.options).then(() => {
              if(result.owner.post.type === 'text' && Array.isArray(result.owner.post.params.text)) {
                sendPostMessage(bot, result.owner.tgId, result.owner.comment).then()
              } else {
                sendPostMessage(bot, result.owner.tgId, result.owner.post).then(() => {
                  sendPostMessage(bot, result.owner.tgId, result.owner.comment).then()
                }).catch(e => logError(e, user, 'start_comment owner post'))
              }
            }).catch(e => logError(e, user, 'start_comment owner'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * get order text
         */
        /*else if(user.data.state === 'start_order') {
          OrderService.add(user, msg).then(result => {
            bot.sendMessage(chatId, result.message).then().catch(e => logError(e, user, 'start_order'))

            // notification to owner
            bot.sendMessage(result.owner.tgId, result.owner.message, result.owner.options).then(() => {
              sendPostMessage(bot, result.owner.tgId, result.owner.post).then(() => {
                sendPostMessage(bot, result.owner.tgId, result.owner.order)
              }).catch(e => logError(e, user, 'start_order owner post'))
            }).catch(e => logError(e, user, 'start_order owner'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }*/
        /**
         * get post context
         */
        else if(user.data.state === 'create_post') {
          PostService.receiveContext(bot, user, msg).then(result => {
            bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'create_post'))
          }, (error) => {
            bot.sendMessage(chatId, error.message).then()
          })
        }
        /**
         * create post final
         */
        else if(['create_post_like', 'create_post_like_comment', 'create_post_like_order', 'create_post_like_comment_order'].indexOf(user.data.state) > -1
          || text === config.message.create_post_comment_keyboard
          || text === config.message.create_post_order_keyboard
          || text === config.message.create_post_comment_order_keyboard)
        {
          if(user.data.chargeAmount <= 0 && text === config.message.create_post_order_keyboard) {
            bot.sendMessage(chatId, config.message.finish_charge_amount).then(() => {
              UserService.selfStatus(user).then(result => {
                bot.sendMessage(chatId, result.message, result.options).then().catch(e => logError(e, user, 'status_account_keyboard'))
              })
            })
          } else {
            PostService.publish(user, text).then(result => {
              sendPostMessage(bot, chatId, result).then(() => {
                bot.sendMessage(chatId, result.message, config.keyboard.admin_start).then().catch(e => logError(e, user, 'create_post options'))
              }).catch(e => logError(e, user, 'create_post options post'))
            }, (error) => {
              bot.sendMessage(chatId, error.message).then()
            })
          }
        }
      }
      /**
       * i dont known
       */
      else {
        bot.sendMessage(chatId, config.message.dont_understand_mean).then().catch(e => logError(e, user, 'dont_understand_mean'))
      }

    }, err => {
      bot.sendMessage(chatId, config.message.problem_call_support).then().catch(e => logError(e, user, 'problem_call_support'))
    })
  })

  /**
   *****************************************************************************************
   * CALL BACK QUERY
   */
  bot.on('callback_query', callbackQuery => {
    const data = callbackQuery.data
    const from = callbackQuery.from

    UserService.findAndCreate(from).then(user =>
    {
      const isAdmin = (config.telegram.adminTgIds.indexOf(user.data.tgId) > -1)
      /**
       * like post
       */
      if (match = data.match(/^like_p(\d+)_n(\d+)$/i)) {
        const postId   = parseInt(match[1])
        const likeNum  = parseInt(match[2])

        LikeService.update(user.data.id, postId, likeNum).then(newPost => {
          const newInlineMessageId = (callbackQuery.inline_message_id !== undefined) ? callbackQuery.inline_message_id : null
          editPostMessage(bot, newPost, newInlineMessageId)
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id, text: config.message.save_success})
        })
      }
      /**
       * publish auto
       */
      else if (match = data.match(/^publish_auto_p(\d+)$/i)) {
        const postId = parseInt(match[1])
        PostService.publishByIdInBot(postId).then(post => {
          ChannelService.getAll().then(channels => {
            channels.forEach(channel => {
              sendPostMessage(bot, `@${channel.username}`, post).then()
            })

            bot.sendMessage(callbackQuery.message.chat.id, 'ربات شروع به انتشار پست شما کرده است.').then(() => {
              bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
            })
          }, () => {
            bot.sendMessage(callbackQuery.message.chat.id, 'کانالی برای انتشار یافت نشد').then(() => {
              bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
            })
          })
        })
      }
      /**
       * like post in bot
       */
      else if (match = data.match(/^like_p(\d+)_n(\d+)_page(\d+)$/i)) {
        const postId   = parseInt(match[1])
        const likeNum  = parseInt(match[2])
        const page     = parseInt(match[3])

        LikeService.update(user.data.id, postId, likeNum).then(newPost => {
          bot.editMessageReplyMarkup({inline_keyboard: PostService.generateInlineKeyboardInBot(newPost.data, page)}, {
            message_id: callbackQuery.message.message_id,
            chat_id: callbackQuery.message.chat.id
          }).then()
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id, text: config.message.save_success})
        })
      }
      /**
       * comment post in bot
       */
      /*if (match = data.match(/^comment_p(\d+)$/i)) {
        const postId = parseInt(match[1])

        CommentService.start(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message).then().catch(e => logError(e, user, 'start cm in bot'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * order post in bot
       */
      /*if (match = data.match(/^order_p(\d+)$/i)) {
        const postId = parseInt(match[1])

        OrderService.start(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message).then().catch(e => logError(e, user, 'start order in bot'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * self post page
       */
      /*else if(match = data.match(/^self_post_page(\d+)$/i)) {
        const page = parseInt(match[1])

        PostService.selfList(user, page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'self_post_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * self like post
       */
      /*else if (match = data.match(/^self_post(\d+)_like$/i)) {
        const postId = parseInt(match[1])

        LikeService.selfListByPostId(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message, result.options).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'self_post_like'))
        })
      }*/
      /**
       * self like post page
       */
      /*else if(match = data.match(/^self_post(\d+)_like_page(\d+)$/i)) {
        const postId = parseInt(match[1])
        const page = parseInt(match[2])

        LikeService.selfListByPostId = (user, postId, page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'self_post_like_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * self comment post
       */
      /*else if (match = data.match(/^self_post(\d+)_comment$/i)) {
        const postId   = parseInt(match[1])

        CommentService.selfListByPostId(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message, result.options).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'self_post_comment'))
        })
      }*/
      /**
       * self comment post page
       */
      /*else if(match = data.match(/^self_post(\d+)_comment_page(\d+)$/i)) {
        const postId = parseInt(match[1])
        const page = parseInt(match[2])

        CommentService.selfListByPostId = (user, postId, page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'self_post_comment_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * self order post
       */
      /*else if (match = data.match(/^self_post(\d+)_order$/i)) {
        const postId = parseInt(match[1])

        OrderService.selfListByPostId(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message, result.options).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'self_post_order'))
        })
      }*/
      /**
       * self order post page
       */
      /*else if(match = data.match(/^self_post(\d+)_order_page(\d+)$/i)) {
        const postId  = parseInt(match[1])
        const page    = parseInt(match[2])

        OrderService.selfListByPostId = (user, postId, page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'self_post_order_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * post pager
       */
      /*else if(match = data.match(/^post(\d+)_pager(\d+)$/i)) {
        const postId  = parseInt(match[1])
        const page    = parseInt(match[2])

        PostService.publishByIdInBot(postId, page).then(result => {
          result.options = {
            reply_markup: result.options.reply_markup,
            message_id: callbackQuery.message.message_id,
            chat_id: callbackQuery.message.chat.id
          }
          bot.editMessageText(result.params.text, result.options).then().catch(e => logError(e, user, 'post_pager'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * manage user page
       */
      /*else if(isAdmin && (match = data.match(/^admin_user_page(\d+)$/i))) {
        const page = parseInt(match[1])

        UserService.manageList(page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'admin_user_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * manage post page
       */
      else if(isAdmin && (match = data.match(/^admin_post_page(\d+)$/i))) {
        const page = parseInt(match[1])

        PostService.manageList(page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'admin_post_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }
      /**
       * manage channels page
       */
      else if(isAdmin && (match = data.match(/^admin_channel_page(\d+)$/i))) {
        const page = parseInt(match[1])

        ChannelService.manageList(page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'admin_post_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }
      /**
       * manage payment page
       */
      /*else if(isAdmin && (match = data.match(/^admin_payment_page(\d+)$/i))) {
        const page = parseInt(match[1])

        PaymentService.manageList(page).then((result) => {
          result.options.message_id = callbackQuery.message.message_id
          result.options.chat_id    = callbackQuery.message.chat.id
          bot.editMessageText(result.message, result.options).then().catch(e => logError(e, user, 'admin_payment_page'))
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        })
      }*/
      /**
       * manage post like
       */
      /*else if(isAdmin && (match = data.match(/^admin_post(\d+)_like$/i))) {
        const postId = parseInt(match[1])
        LikeService.manageListByPostId(postId).then((result) => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'admin_post_like'))
        })
      }*/
      /**
       * manage post comment
       */
      /*else if(isAdmin && (match = data.match(/^admin_post(\d+)_comment$/i))) {
        const postId = parseInt(match[1])
        CommentService.manageListByPostId(postId).then((result) => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message, result.options).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'admin_post_comment'))
        })
      }*/
      /**
       * manage post like
       */
      else if(isAdmin && (match = data.match(/^admin_post(\d+)_like_increase$/i))) {
        const postId = parseInt(match[1])
        PostService.manageLikeEmojiList(user, postId).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message, result.options).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'admin_post(d)_like_increase'))
        })
      }
      /**
       * manage post like
       */
      else if(isAdmin && (match = data.match(/^admin_post_like(\d+)_increase$/i))) {
        const likeNumber = parseInt(match[1])
        PostService.manageLikeEmojiSelected(user, likeNumber).then(result => {
          bot.sendMessage(callbackQuery.message.chat.id, result.message).then(() => {
            bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
          }).catch(e => logError(e, user, 'admin_post_like(d)_increase'))
        })
      }
      /**
       * manage post comment
       */
      /*else if(isAdmin && (match = data.match(/^admin_post(\d+)_comment_increase$/i))) {
        const postId = parseInt(match[1])
        UserService.update(user.model, {state: 'admin_post_comment_increase', selectedPostId: postId})
        bot.sendMessage(callbackQuery.message.chat.id, config.message.enter_comment_increase).then(() => {
          bot.answerCallbackQuery({callback_query_id: callbackQuery.id})
        }).catch(e => logError(e, user, 'admin_post(d)_comment_increase'))
      }*/
      /**
       * answer comment
       */
       /*else if(data === 'answer_comment_keyboard') {
         bot.answerCallbackQuery({
           callback_query_id: callbackQuery.id,
           text: config.message.comming_soon,
         })
       }*/
    })
  });


  /**
   *****************************************************************************************
   * INLINE QUERY
   */
  bot.on('inline_query', inlineQuery => {
    let query = inlineQuery.query
    const from = inlineQuery.from
    const requestId = inlineQuery.id

    if(query === '') return undefined

    UserService.findAndCreate(from).then(user =>
    {
      /**
       * get post code id
       */
      if (match = query.match(/^#(\d+)$/i)) {
        const postId = match[1]
        PostService.publishById(postId, user.data.id).then(result => {

          let answer = {
            type: result.type,
            id: uuidV1(),
            title: 'انتشار',
            reply_markup: result.replyMarkup
          }

          if(['photo', 'audio', 'video', 'document', 'sticker', 'voice', 'video_note'].indexOf(result.type) > -1) {
            answer[`${result.type}_file_id`] = result.params.file_id
          }
          else if(result.type === 'text') {
            answer.type = 'article'
            answer.input_message_content = {message_text: result.params.text}
          }
          else if(result.type === 'contact') {
            answer.phone_number = result.params.phone_number
            answer.first_name = result.params.first_name

            if(result.params.last_name !== undefined) {
              answer.last_name = result.param.last_name
            }
          }
          else if(result.type === 'location') {
            answer.latitude = result.params.latitude
            answer.longitude = result.params.longitude
          }

          if(result.params.caption !== undefined) {
            answer.caption = result.params.caption
          }

          bot.answerInlineQuery(requestId, [answer]).then().catch(e => logError(e, user, 'answerInlineQuery'))
        }, () => {})
      }
    })
  })
})
