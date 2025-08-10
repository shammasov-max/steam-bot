const steam = require("../steam");
const SteamTotp = require("steam-totp");
const {
  LoginSession,
  EAuthTokenPlatformType
} = require("steam-session");
const {
  logger
} = require('./logger');
steam.prototype.getSteamGuardMachineToken = async function (_0x24a422) {
  try {
    const _0x496073 = await this.client._readFile("machineAuthToken." + this.account.no_replace_login + ".txt");
    return _0x496073.toString("utf8");
  } catch (_0x3c2038) {}
  return undefined;
};
const decodeJwt = _0x37cef6 => {
  let _0x2ec3d3 = _0x37cef6.split('.');
  if (_0x2ec3d3.length != 0x3) {
    throw new Error("Invalid JWT");
  }
  let _0x3f824f = _0x2ec3d3[0x1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(_0x3f824f, "base64").toString("utf8"));
};
steam.prototype.getRefreshToken = async function () {
  this.jwt = localStorage.getItem(this.account.login + "_jwt") ? JSON.parse(localStorage.getItem(this.account.login + "_jwt")) : null;
  if (this.jwt && (this.jwt.rt_exp || this.jwt.exp) * 0x3e8 > new Date().getTime() && this.jwt.password === this.account.password) {
    return {
      'status': true,
      'refreshToken': this.jwt.refreshToken
    };
  }
  return this.jwtLogin();
};
steam.prototype.jwtLogin = function () {
  return new Promise(async _0x53d709 => {
    const _0x13f2b9 = {
      'machineFriendlyName': this.account.no_replace_login
    };
    if (this.proxy) {
      _0x13f2b9.httpProxy = this.proxy;
    }
    const _0x3cdb52 = new LoginSession(EAuthTokenPlatformType.SteamClient, _0x13f2b9);
    const _0x980227 = await this.getSteamGuardMachineToken(this.account.no_replace_login);
    const _0x15d4ae = () => {
      _0x3cdb52.cancelLoginAttempt();
      _0x53d709({
        'status': false
      });
    };
    const _0x570b56 = async () => {
      const _0x8ea662 = document.getElementById('codeInput').value.trim();
      if (_0x8ea662 === '') {
        swal("Error", process.languages[process.settings.language].input_steam_guard, "error");
      } else {
        try {
          await _0x3cdb52.submitSteamGuardCode(_0x8ea662);
        } catch (_0xe425b5) {
          process.helper.print_info(this.account.login + ": " + _0xe425b5, "red");
        }
      }
    };
    try {
      const _0x171fcf = await _0x3cdb52.startWithCredentials({
        'accountName': this.account.no_replace_login,
        'password': this.account.password.trim(),
        'steamGuardCode': this.maFile ? SteamTotp.getAuthCode(this.maFile.shared_secret, process.steamTimeOffset) : undefined,
        'steamGuardMachineToken': _0x980227
      });
      if (_0x171fcf.actionRequired) {
        if (document.getElementById('fast_auth').checked) {
          process.helper.print_info(this.account.login + ": " + process.languages[process.settings.language].importMafile, "yellow");
          _0x15d4ae();
        } else {
          process.helper.print_info(process.languages[process.settings.language].enter_steam_guard + " " + this.account.login);
          const _0x3fcb4d = document.querySelector(".code");
          const _0x24c813 = document.getElementById("codeInput");
          _0x3fcb4d.classList.remove("hide");
          _0x24c813.onkeyup = _0x41e7d7 => {
            if (_0x41e7d7.keyCode === 0xd) {
              this.enteredGuardCodeManyally = true;
              _0x570b56();
              _0x24c813.value = '';
            }
          };
          document.getElementById("codeSend").onclick = () => {
            this.enteredGuardCodeManyally = true;
            _0x570b56();
          };
          document.getElementById("skip_account").onclick = () => {
            delete process.clients[this.account.login];
            _0x15d4ae();
          };
          setTimeout(() => _0x24c813.focus(), 0xc8);
        }
      }
      _0x3cdb52.on("authenticated", async () => {
        const _0x2ceae8 = decodeJwt(_0x3cdb52.refreshToken);
        this.jwt = {
          'refreshToken': _0x3cdb52.refreshToken,
          'exp': _0x2ceae8.exp,
          'password': this.account.password
        };
        localStorage.setItem(this.account.login + "_jwt", JSON.stringify(this.jwt));
        _0x3cdb52.cancelLoginAttempt();
        _0x53d709({
          'status': true,
          'refreshToken': _0x3cdb52.refreshToken,
          'jwt': _0x2ceae8
        });
      });
      _0x3cdb52.on("timeout", () => {
        logger.error("Login Timedout " + this.account.login);
        process.helper.print_info(this.account.login + " Auth timedout " + (this.proxy || ''), 'red');
        _0x15d4ae();
      });
      _0x3cdb52.on('steamGuardMachineToken', () => {
        if (_0x3cdb52.steamGuardMachineToken) {
          this.client._saveFile("machineAuthToken." + this.account.no_replace_login + '.txt', Buffer.from(_0x3cdb52.steamGuardMachineToken, "utf8"));
          logger.info("Save steam guard machine token " + this.account.no_replace_login);
        }
      });
      _0x3cdb52.on('error', _0x5a1617 => {
        logger.error("Session error: " + _0x5a1617.message);
        process.helper.print_info(this.account.login + " " + _0x5a1617 + " " + (this.proxy || ''), "red");
        _0x15d4ae();
      });
    } catch (_0x49cba3) {
      logger.error("Session error 2: " + this.account.login + " " + _0x49cba3 + " " + (this.proxy || ''));
      process.helper.print_info(this.account.login + ": " + _0x49cba3, "red");
      _0x15d4ae();
    }
  });
};
steam.prototype.login = function () {
  return new Promise(async _0x530550 => {
    try {
      const {
        status: _0x4410b0
      } = await this.getRefreshToken();
      if (_0x4410b0) {
        this.event_emitter.once("logOn", _0x49e630 => {
          _0x530550(_0x49e630);
        });
        this.logonID = this.logonID || Math.floor(Math.random() * 100) + 0x0;
        this.client.logOn({
          'refreshToken': this.jwt.refreshToken,
          'machineName': this.account.no_replace_login,
          'logonID': this.logonID
        });
      } else {
        _0x530550(false);
      }
    } catch (_0x3a6c82) {
      logger.error("Login error: " + _0x3a6c82);
      _0x530550(false);
    }
  });
};
steam.prototype.removeSteamHandlers = function () {
  this.client.removeAllListeners('webSession');
  this.client.removeAllListeners('friendPersonasLoaded');
  this.client.removeAllListeners('user');
  this.client.removeAllListeners('friendTyping');
  this.client.removeAllListeners("friendMessage");
  this.client.removeAllListeners("friendRelationship");
  this.client.removeAllListeners("newComments");
  this.client.removeAllListeners("error");
  this.client.removeAllListeners("loggedOn");
  this.client.removeAllListeners("loginKey");
  this.client.removeAllListeners("steamGuard");
  this.client.removeAllListeners("nickname");
  this.client.removeAllListeners("friendsList");
  this.client.removeAllListeners("accountLimitations");
  this.client.removeAllListeners("disconnected");
  this.client.chat.removeAllListeners('friendMessage');
  this.client.chat.removeAllListeners('friendTyping');
};
steam.prototype.removeEventEmitterHandlers = function () {
  this.event_emitter.removeAllListeners("logOn");
  this.event_emitter.removeAllListeners('stop_typing');
};
steam.prototype.relogin = function (_0x29df43) {
  if (new Date().getTime() > this.lastReloginDate + 0x2710) {
    this.lastReloginDate = new Date().getTime();
    logger.info("relog " + this.account.login + ". Reason " + _0x29df43);
    try {
      this.client.relog();
    } catch (_0x581f9e) {
      logger.info("full relog " + this.account.login + ". Reason " + _0x581f9e);
      this.login();
    }
  } else {
    logger.info(this.account.login + " already rellogining");
  }
};