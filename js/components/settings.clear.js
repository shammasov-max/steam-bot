const steam = require("../steam");
settings_timeout = 0x1b58;
steam.prototype.change_privacy = function (_0x1b825b, {
  index: _0x38e06b,
  selected_accounts_length: _0x3fb68a
}) {
  this.community.profileSettings(_0x1b825b, _0x31cdd0 => {
    process.helper.print_info('[' + (_0x38e06b + 0x1) + '/' + _0x3fb68a + "] " + this.account.login + " " + process.languages[process.settings.language].change_privacy + " " + (_0x31cdd0 ? "error " + _0x31cdd0 : process.languages[process.settings.language].successfully_changed), '' + (_0x31cdd0 ? "red" : "grn"));
  });
};
steam.prototype.change_profile = function ({
  index: _0x577ba6,
  selected_accounts_length: _0x44cec1
}) {
  try {
    const _0x352fd4 = {
      'country': process.profile_settings.country,
      'city': '',
      'state': ''
    };
    for (const _0x3ed492 in process.profile_settings) {
      const _0x49fa7f = process.profile_settings[_0x3ed492];
      if (_0x49fa7f) {
        const _0x27578d = _0x49fa7f.split(';');
        const _0x5a3d34 = _0x27578d[[process.helper.random(0x0, _0x27578d.length - 0x1)]].trim();
        _0x352fd4[_0x3ed492] = _0x5a3d34;
      }
    }
    this.community.editProfile(_0x352fd4, _0x4b8957 => {
      process.helper.print_info('[' + (_0x577ba6 + 0x1) + '/' + _0x44cec1 + "] " + this.account.login + " " + process.languages[process.settings.language].change_profile + " " + (_0x4b8957 ? "error " + _0x4b8957 : process.languages[process.settings.language].successfully_changed), '' + (_0x4b8957 ? 'red' : "grn"));
    });
  } catch (_0x3cd65e) {
    process.helper.print_info(this.account.login + " change profile: error: " + _0x3cd65e, 'red');
  }
};
steam.prototype.change_avatar = function ({
  index: _0x596907,
  selected_accounts_length: _0x1f262d
}) {
  const _0x338b17 = document.getElementById("avatar_settings").value.trim().split(';');
  const _0x40b5b7 = _0x338b17[[process.helper.random(0x0, _0x338b17.length - 0x1)]].trim();
  this.community.uploadAvatar(_0x40b5b7, _0x43997e => {
    process.helper.print_info('[' + (_0x596907 + 0x1) + '/' + _0x1f262d + "] " + this.account.login + " " + process.languages[process.settings.language].change_avatar + " " + (_0x43997e ? "error " + _0x43997e : process.languages[process.settings.language].avatar_successfully_changed), '' + (_0x43997e ? "red" : "grn"));
  });
};