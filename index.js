const { Plugin, segment, http, wait } = require('keli')

const { version } = require('./package.json')
const plugin = new Plugin('keli-daily60s', version)

const config = { 
  time: 6, 
  enableGroup: [], 
  enablePrivate: [], 
}

plugin.onMounted((bot, admins) => {
  plugin.saveConfig(Object.assign(config, plugin.loadConfig()))

  const api = "https://api.vvhan.com/api/60s"
  plugin.onCmd("今日新闻", async (event, params, options) => {
    let data  = await http.get(api)
    let res = data.request.res.responseUrl
    let msg = segment.image(res)
    event.reply(msg)
  })

  // 管理员操作
  plugin.onAdminCmd("/60s", (event, params, options) => {
    const [param, other] = params
    const n = Number(event.raw_message
      .replace("/60s", "")
      .replace(param, "")
      .replace(other, "")
      .trim())
    let test = (array, element) => {
      if(~array.indexOf(element)) return true;
      return false
    }
    if(param === 'g'){
      if(other === 'add'){
        if(test(config.enableGroup, n)){ event.reply("[daily60s]该群已存在60s新闻提醒列表，请勿重复操作", true); return}
        config.enableGroup.push(Number(n))
        plugin.saveConfig(config)
        event.reply("[daily60s]成功将该群聊纳入每日60s新闻提醒列表，重载插件生效", true)
      } else if(other === 'delete'){
        if(!test(config.enableGroup, n)){ event.reply("[daily60s]移除失败，该群未纳入每日60s新闻提醒列表", true); return}
        let temp = config.enableGroup.indexOf(n)
        config.enableGroup.splice(temp, 1)
        plugin.saveConfig(config)
        event.reply("[daily60s]成功将该群移出每日60s新闻提醒列表， 重载插件成效", true)
      }
    } else  if(param === 'p') {
      if(other === 'add'){
        if(test(config.enablePrivate, n)){ event.reply("[daily60s]该QQ已存在每日60s新闻提醒列表，请勿重复操作", true); return}
        config.enablePrivate.push(Number(n))
        plugin.saveConfig(config)
        event.reply("[daily60s]成功将该QQ纳入每日60s新闻提醒列表，重载插件生效", true)
      } else if(other === 'delete'){
        if(!test(config.enablePrivate, n)){ event.reply("[daily60s]移除失败，该QQ未纳入每日60s新闻提醒列表", true); return}
        let temp = config.enablePrivate.indexOf(n)
        config.enablePrivate.splice(temp, 1)
        plugin.saveConfig(config)
        event.reply("[daily60s]成功将该QQ移出每日60s新闻提醒列表，重载插件成效", true)
      }
    } else if(param === 'time') {
      config.time = n
      plugin.saveConfig(config)
      event.reply(`[daily60s]成功将每日60s的时间调整为${config.time}:00，重载插件生效`,true)
    } else if(param === 'list') {
      if(config.enableGroup == 0 && config.enablePrivate == 0){
        event.reply("每日60s提醒列表为空")
        return
      }
      let msg = `每日60s提醒时间：${config.time}:00\n`
      msg += '私聊提醒：\n'
      for(let i of config.enablePrivate){
        msg += '\t'
        msg += i
        msg += '\n'
      }
      msg += '群提醒：\n'
      for(let i of config.enableGroup){
        msg += '\t'
        msg += i
        msg += '\n'
      }
      event.reply(msg)
    } else {
      event.reply("设置每日提醒时间(小时): /60s time [0~24]\n查看提醒列表：/60s list\n添加群提醒：/60s g add [群号]\n删除群提醒：/60s g delete [群号]\n添加私聊提醒：/60s p add [QQ号]\n删除私聊提醒：/60s p delete [QQ号]")
    }
  })

  plugin.cron(`10 0 ${config.time} * * *`, async (bot, admins) => {
    let data = await http.get(api)
    let res = data.request.res.responseUrl
    let msg = segment.image(res)
    
    for(let i of config.enablePrivate){
      await bot.sendPrivateMsg(i, msg)
      wait(Math.floor(Math.random*10))
    }
    for(let i of config.enableGroup){
      console.log(i, typeof i);
      await bot.sendGroupMsg(i, msg)
      wait(Math.floor(Math.random*10))
    }
    
  })
})

module.exports = { plugin }