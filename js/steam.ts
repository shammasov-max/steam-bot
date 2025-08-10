const SteamUser = require("steam-user");
const SteamCommunity = require("steamcommunity");
const request = require("request");
const EventEmitter = require("events");
const {
  getUserAgent
} = require("./components/utils");
const {
  logger
} = require("./components/logger");
const {
  msInMinute
} = require("./constants/common");
const fastq = require("fastq");
const gamesForBoostInput = document.getElementById("games_for_boost");
const setStateAllInput = document.getElementById('setStateAll');
module.exports = class Steam {
  constructor(_0x982dbb, _0xb5eb06, _0x2ae215) {
    this.event_emitter = new EventEmitter();
    this.account = _0x982dbb;
    this.maFile = _0xb5eb06 || _0x982dbb.maFile;
    this.is_account_opened = false;
    this.is_printed_all_users = false;
    this.last_online_state = Number(setStateAllInput.value) || 0x1;
    this.unread_messages = {};
    this.play_game_info = {
      'is_play': false,
      'games': ''
    };
    this.unsend_messages = {};
    this.typing_templates = {};
    this.statistic = localStorage.getItem(this.account.login + '_statistic') ? JSON.parse(localStorage.getItem(this.account.login + "_statistic")) : {};
    this.owned_apps = {};
    this.muted = localStorage.getItem(this.account.login + '_muted') ? JSON.parse(localStorage.getItem(this.account.login + "_muted")) : {};
    this.spammed = localStorage.getItem(this.account.login + '_spammed') ? JSON.parse(localStorage.getItem(this.account.login + "_spammed")) : {};
    this.new_friends = {};
    this.deleted_friends = localStorage.getItem(this.account.login + "_deleted_friends") ? JSON.parse(localStorage.getItem(this.account.login + "_deleted_friends")) : {};
    this.pinned = localStorage.getItem(this.account.login + '_pinned') ? JSON.parse(localStorage.getItem(this.account.login + "_pinned")) : {};
    this.old_friends = localStorage.getItem(this.account.login + '_old_friends') ? JSON.parse(localStorage.getItem(this.account.login + "_old_friends")) : null;
    this.account_nickname = localStorage.getItem("nickname_" + this.account.login) || '';
    this.invite_link = localStorage.getItem('invite_link_' + this.account.login) || null;
    this.handledOldFriends = false;
    this.logged_on = false;
    this.is_friends_printed = false;
    this.is_account_printed = false;
    this.is_play_game = false;
    this.comment_info = {
      'count': 0x0,
      'myItems': 0x0,
      'discussions': []
    };
    this.friends_limit = null;
    this.locked = null;
    this.limited = null;
    this.emotions = {};
    this.removed_by_me = {};
    this.reloginInterval = null;
    this.weblogonInterval = null;
    this.enteredGuardCodeManyally = false;
    this.ui_mode = 0x0;
    this.users = {};
    this.myFriends = {};
    this.reloginTimeout = 0x0;
    this.lastReloginDate = 0x0;
    this.clientSteamID64 = null;
    this.jar = request.jar();
    this.userAgent = getUserAgent();
    this.set_proxy(_0x2ae215);
    this.update_statistic();
    this.createSteamClient();
    this.community = new SteamCommunity(this.proxy ? {
      'request': request.defaults({
        'proxy': this.proxy
      })
    } : {});
    this.event_emitter.on("stop_typing", _0x5163d9 => {
      const _0x373f72 = this.typing_templates[_0x5163d9];
      if (_0x373f72) {
        clearInterval(_0x373f72.interval);
        clearTimeout(_0x373f72.timeout);
        this.typing_template(_0x5163d9, false);
      }
    });
  }
  get ["isDisconnected"]() {
    return !this.client.steamID;
  }
  ['createSteamClient']() {
    this.client = new SteamUser({
      'httpProxy': this.proxy ? this.proxy : null
    });
    this.client.on('webSession', async (_0x4327c2, _0xd559af) => {
      try {
        this.sessionID = _0x4327c2;
        _0xd559af.forEach(_0x590953 => {
          this.jar.setCookie(_0x590953, 'https://steamcommunity.com');
          this.jar.setCookie(_0x590953, "https://store.steampowered.com");
          this.jar.setCookie(_0x590953, "https://help.steampowered.com");
        });
        this.cookies = _0xd559af.join(';');
        this.community.setCookies(_0xd559af);
        this.client.setPersona(this.last_online_state);
        this.play_game(this.play_game_info.games, this.play_game_info.is_play);
        this.set_ui_mode(this.ui_mode);
        if (!this.logged_on) {
          this.clientSteamID64 = this.client.steamID.getSteamID64();
          this.logged_on = true;
          this.print_account();
          this.check_friends_limit();
          this.get_emotions();
          this.get_games();
          this.weblogonInterval = setInterval(() => {
            try {
              this.client.webLogOn();
            } catch (_0x368e09) {
              logger.error("webLogOn " + this.account.login + " " + _0x368e09);
              if (_0x368e09.toString().indexOf("without first being connected to Steam network") !== -0x1) {
                this.relogin("Detected disconnect at webLogOn");
              }
            }
          }, msInMinute * 0x1e);
          if (process.settings.auto_boost) {
            this.play_game(gamesForBoostInput.value, true);
          }
          const _0x3facd5 = document.querySelector(".row_header.row_header_" + this.account.login);
          let _0x266226 = 0x0;
          for (const _0x8149b2 in this.myFriends) {
            if (this.myFriends[_0x8149b2] == 0x4 || this.myFriends[_0x8149b2] == 0x2) {
              if (this.myFriends[_0x8149b2] == 0x2) {
                ++_0x266226;
              }
            }
          }
          let _0x5e8703 = '[' + process.current_account_index + '/' + process.accounts.length + "] " + this.account.login + " " + process.languages[process.settings.language].logged_in + '.';
          let _0x3176c2 = false;
          if (this.comment_info.myItems > 0x0) {
            _0x5e8703 += " " + process.helper.replace_log_variable(process.languages[process.settings.language].unread_comments, [this.comment_info.myItems]) + '.';
            _0x3176c2 = true;
          }
          if (_0x266226 > 0x0) {
            _0x5e8703 += " " + process.helper.replace_log_variable(process.languages[process.settings.language].unread_invites, [_0x266226]) + '.';
            _0x3176c2 = true;
          }
          if (this.account.proxy !== undefined) {
            _0x5e8703 += " Proxy: " + this.account.proxy;
          }
          process.helper.print_info(_0x5e8703, 'grn', _0x3176c2 ? "https://steamcommunity.com/profiles/" + this.clientSteamID64 : false, _0x3176c2 ? this.account.login : false);
          ++process.current_account_index;
          this.event_emitter.emit("logOn", true);
          this.reloginInterval = setInterval(() => {
            if (navigator.onLine && this.isDisconnected) {
              this.relogin("No users or steamid");
            }
          }, 0x7530);
          const _0x405ee6 = await this.has_ban();
          if (_0x405ee6) {
            _0x3facd5.classList.add("locked");
            await this.ack_support_messages();
            if (!(await this.has_ban())) {
              _0x3facd5.classList.remove('locked');
            } else {
              this.locked = true;
            }
          } else {
            _0x3facd5.classList.remove("locked");
          }
        } else {
          this.event_emitter.emit('logOn', true);
        }
      } catch (_0x11a9c8) {
        const _0xcd3617 = _0x11a9c8.toString();
        logger.error("webSession " + this.account.login + " " + _0xcd3617);
        this.event_emitter.emit('logOn', false);
        if (_0xcd3617.indexOf("write") !== -0x1) {
          this.relogin("Websession error");
        }
      }
    });
    this.client.on('friendPersonasLoaded', async () => {
      this.copyFriendsFromClient();
      const _0x4d194e = async (_0x5a15fc, _0x2c6c3c) => {
        await this.get_messages(_0x5a15fc);
        _0x2c6c3c();
      };
      const _0x42dd37 = fastq(_0x4d194e, 0xa);
      if (!this.is_friends_printed) {
        this.print_account();
        this.is_friends_printed = true;
      }
      for (const _0x350b94 in this.users) {
        const _0x5db098 = this.users[_0x350b94];
        this.customize_user_info(_0x350b94, _0x5db098);
        requestIdleCallback(() => this.print_user(_0x350b94));
        _0x42dd37.push(_0x350b94);
      }
      this.get_unread_messages();
    });
    this.client.on("user", (_0x4d0d0c, _0xf29324) => {
      const _0x33a7b2 = _0x4d0d0c.getSteamID64();
      this.customize_user_info(_0x33a7b2, _0xf29324);
      requestIdleCallback(() => this.print_user(_0x33a7b2));
    });
    this.client.chat.on("friendMessage", _0x4b40ca => this.friend_message(_0x4b40ca));
    this.client.chat.on('friendTyping', _0x3c34c3 => this.friend_typing(_0x3c34c3.steamid_friend));
    this.client.on("friendRelationship", (_0x299b17, _0xb6e700) => this.friend_relationship(_0x299b17, _0xb6e700));
    this.client.on('newComments', (_0x3d66ed, _0x300c1a, _0x188c8a) => {
      if (this.logged_on && this.comment_info.myItems < _0x300c1a) {
        process.helper.print_info(process.languages[process.settings.language].new_comment + " " + this.account.login, "blue", "https://steamcommunity.com/profiles/" + this.clientSteamID64 + '/', this.account.login);
        process.helper.notificate(process.languages[process.settings.language].new_comment + " " + this.account.login, '', {
          'login': this.account.login,
          'client_id': this.clientSteamID64,
          'type': "comment"
        });
      }
      this.comment_info = {
        'count': _0x3d66ed,
        'myItems': _0x300c1a,
        'discussions': _0x188c8a
      };
    });
    this.client.on("error", _0x57fc2a => {
      const _0x4d49c7 = '' + _0x57fc2a;
      if (!this.logged_on) {
        process.helper.print_info(this.account.login + " " + _0x4d49c7 + " " + (this.proxy || ''), "red");
      }
      if (_0x4d49c7.search(/InvalidPassword|AccessDenied/i) !== -0x1) {
        localStorage.removeItem(this.account.login + '_jwt');
        delete this.jwt;
      }
      this.event_emitter.emit("logOn", false);
      logger.error("ClientError: " + this.account.login + " " + _0x57fc2a);
      if (this.logged_on) {
        setTimeout(() => {
          this.relogin("ClientError");
        }, 0x2710);
      }
    });
    this.client.on('nickname', (_0x1f5044, _0x5cfd93) => {
      if (_0x5cfd93) {
        this.client.myNicknames[_0x1f5044] = _0x5cfd93;
      } else {
        delete this.client.myNicknames[_0x1f5044];
      }
      this.print_user(_0x1f5044);
    });
    this.client.on('friendsList', () => {
      this.copyFriendsFromClient();
      if (!this.handledOldFriends) {
        if (this.old_friends && Object.keys(this.old_friends).length > 0x0) {
          for (const _0x166bfe in this.myFriends) {
            const _0x47c486 = this.myFriends[_0x166bfe];
            if (_0x47c486 == 0x3 && this.old_friends && !this.old_friends[_0x166bfe]) {
              this.new_friends[_0x166bfe] = true;
              this.pinned[_0x166bfe] = 0x1;
              this.update_statistic("added");
            }
          }
        }
        const _0x11ab8a = {};
        for (const _0x4e371c in this.myFriends) {
          if (this.myFriends[_0x4e371c] == 0x3) {
            _0x11ab8a[_0x4e371c] = 0x1;
          }
        }
        this.old_friends = _0x11ab8a;
        if (Object.keys(_0x11ab8a).length > 0x0) {
          localStorage.setItem(this.account.login + "_old_friends", JSON.stringify(_0x11ab8a));
        }
      }
      this.handledOldFriends = true;
    });
    this.client.on("accountLimitations", _0x431150 => {
      this.limited = _0x431150;
    });
    this.client.on("disconnected", () => {
      this.reloginTimeout = setTimeout(() => {
        this.relogin("Disconnected");
      }, 0xea60);
    });
    this.client.on("loggedOn", () => {
      clearTimeout(this.reloginTimeout);
    });
  }
  ["copyFriendsFromClient"]() {
    for (const _0x2f590d in this.client.myFriends) {
      this.myFriends[_0x2f590d] = this.client.myFriends[_0x2f590d];
    }
  }
  ["set_proxy"](_0x1b2bdd) {
    if (!_0x1b2bdd) {
      return this.proxy = null;
    }
    const _0x3e16e0 = _0x1b2bdd.trim().split(':');
    this.proxy = 'http://' + (_0x3e16e0.length === 0x4 ? _0x3e16e0[0x2] + ':' + _0x3e16e0[0x3] + '@' + _0x3e16e0[0x0] + ':' + _0x3e16e0[0x1] : _0x1b2bdd);
    this.default_proxy = _0x1b2bdd;
  }
  ["update_statistic"](_0x58f38a, _0xc8ef2f) {
    const _0x559c14 = new Date();
    const _0x1fca7e = _0x559c14.getMonth();
    const _0x163f93 = _0x559c14.getDate();
    if (this.statistic.month !== _0x1fca7e) {
      this.statistic = {
        'month': _0x1fca7e
      };
    }
    if (!this.statistic[_0x163f93]) {
      this.statistic[_0x163f93] = {
        'added': 0x0,
        'deleted': 0x0,
        'invites_sent': 0x0
      };
    }
    if (_0xc8ef2f && _0x58f38a) {
      if (this.statistic[_0x163f93][_0x58f38a]) {
        this.statistic[_0x163f93][_0x58f38a] += _0xc8ef2f;
      } else {
        this.statistic[_0x163f93][_0x58f38a] = _0xc8ef2f;
      }
    } else if (_0x58f38a) {
      this.statistic[_0x163f93][_0x58f38a]++;
    }
    localStorage.setItem(this.account.login + '_statistic', JSON.stringify(this.statistic));
  }
  ["getRenderPlayerName"](_0x2baf41, _0x16d0f6) {
    let _0x8b3c3 = '';
    if (this.client.myNicknames[_0x2baf41]) {
      _0x8b3c3 = _0x16d0f6.player_name + " (" + this.client.myNicknames[_0x2baf41] + ')';
    } else if (_0x16d0f6.player_name) {
      _0x8b3c3 = _0x16d0f6.player_name;
    }
    return _0x8b3c3.replace(/"|<|>/g, '');
  }
  async ["customize_user_info"](_0x36061c, _0x57ded8) {
    try {
      const _0x1ccac = this.users[_0x36061c];
      if (_0x57ded8.gameid && _0x57ded8.gameid !== '0') {
        _0x57ded8.persona_state = 0x9;
      }
      if (_0x57ded8.persona_state === null || _0x57ded8.persona_state === undefined) {
        _0x57ded8.persona_state = _0x57ded8.last_persona_state || 0x0;
      }
      _0x57ded8.last_persona_state = _0x1ccac ? _0x1ccac.persona_state : _0x57ded8.persona_state;
      _0x57ded8.render_player_name = this.getRenderPlayerName(_0x36061c, _0x57ded8);
      _0x57ded8.inventory = _0x1ccac && typeof _0x1ccac.inventory === "object" ? _0x1ccac.inventory : {};
      _0x57ded8.user_info = _0x1ccac && typeof (_0x1ccac.user_info === "object") ? _0x1ccac.user_info : {};
      _0x57ded8.games_info = _0x1ccac && typeof (_0x1ccac.games_info === 'object') ? _0x1ccac.games_info : {};
      _0x57ded8.trade_hold_info = _0x1ccac?.["trade_hold_info"] || {
        'checked': false,
        'escrow': 0x0
      };
      if (!_0x57ded8.inventory) {
        _0x57ded8.inventory = {};
      }
      _0x57ded8.message_history = _0x1ccac?.["message_history"];
      _0x57ded8.customized = true;
      this.users[_0x36061c] = _0x57ded8;
    } catch (_0x107551) {
      logger.error("customize user error: " + _0x107551 + " " + _0x36061c);
    }
  }
  ["set_account_name"](_0xb58825) {
    this.account_nickname = _0xb58825.trim();
    document.getElementById("nickname_" + this.account.login).innerText = this.account.login + " " + (_0xb58825 !== '' ? '(' + _0xb58825 + ')' : '');
    localStorage.setItem("nickname_" + this.account.login, _0xb58825);
  }
};
require('./components/login');
require("./components/render");
require('./components/chat');
require("./components/relationship");
require('./components/online_state');
require("./components/request");
require('./components/settings');
require("./components/community_task");
require('./components/cycle');
require("./components/confirmations");
require('./components/changePassword');