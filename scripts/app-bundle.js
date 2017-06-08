define('app',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    function App() {
      _classCallCheck(this, App);
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.title = 'Colour Whist';
      config.map([{ route: ['', 'games'], name: 'games', moduleId: 'games', nav: false, title: 'Games' }, { route: ['games/:id'], name: 'game', moduleId: 'game', nav: false, title: 'Game' }]);

      this.router = router;
    };

    return App;
  }();

  var sum = exports.sum = function sum(a, b) {
    return a + b;
  };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('game',['exports', 'gundb', 'aurelia-framework', './app'], function (exports, _gundb, _aureliaFramework, _app) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Game = exports.KeysValueConverter = undefined;

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _dec, _class;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var KeysValueConverter = exports.KeysValueConverter = function () {
    function KeysValueConverter() {
      _classCallCheck(this, KeysValueConverter);
    }

    KeysValueConverter.prototype.toView = function toView(value) {
      return Object.keys(value);
    };

    return KeysValueConverter;
  }();

  var Game = exports.Game = (_dec = (0, _aureliaFramework.inject)(_gundb.GunDb), _dec(_class = function () {
    function Game(gunDb) {
      _classCallCheck(this, Game);

      this.gametypes = {
        '8': { players: 2, score: 2 },
        '9': { players: 2, score: 2 },
        '10': { players: 2, score: 2 },
        'miserie': { players: 1, score: 4 },
        'abondance': { players: 1, score: 6 },
        'solo slim': { players: 1, score: 24 },
        'pas': { players: 0, score: 0 }
      };
      this.current_score = 2;
      this.current_gametype = '8';
      this.current_players = this.no_players();

      this.gunDb = gunDb.db;
      this.players = ['koen', 'kevin', 'gert', 'yves'];
      this.totals = [0, 0, 0, 0];

      this.rounds = new Map();
    }

    Game.prototype.activate = function activate(params) {
      var _this = this;

      this.id = params['id'];
      this.gameDb = this.gunDb.get(this.id);
      this.gameDb.val(function (game) {
        _this.game = game;
      });
      this.gameDb.get('rounds').map().on(function (round, id) {
        if (round) {
          _this.rounds.set(id, round);
        } else {
          _this.rounds.delete(id);
        }

        _this.sortedRounds = Array.from(_this.rounds.entries()).map(function (_ref) {
          var k = _ref[0],
              v = _ref[1];
          v.id = k;return v;
        }).sort(function (a, b) {
          return b.nr - a.nr;
        });

        var t1 = _this.sortedRounds.map(function (r) {
          return r.s1;
        }).reduce(_app.sum, 0);
        var t2 = _this.sortedRounds.map(function (r) {
          return r.s2;
        }).reduce(_app.sum, 0);
        var t3 = _this.sortedRounds.map(function (r) {
          return r.s3;
        }).reduce(_app.sum, 0);
        var t4 = _this.sortedRounds.map(function (r) {
          return r.s4;
        }).reduce(_app.sum, 0);
        _this.totals = [t1, t2, t3, t4];

        console.log(_this.totals);
        console.log(_this.sortedRounds.map(function (r) {
          return r.nr;
        }));
      });
    };

    Game.prototype.deactivate = function deactivate() {
      console.log("stop listening to gundb events");
      this.gameDb.get('rounds').off();
    };

    Game.prototype.selectGameType = function selectGameType(event) {
      var gametype = this.gametypes[event.srcElement.value];
      this.current_score = gametype.score;
    };

    Game.prototype.submit = function submit() {
      var _this2 = this;

      var score = Number.parseInt(this.current_score);

      var scores = this.countSelected == 2 ? [0, 1, 2, 3].map(function (x) {
        return _this2.current_players[x] == true ? score : -score;
      }) : [0, 1, 2, 3].map(function (x) {
        return _this2.current_players[x] == true ? score * 3 : -score;
      });

      var round = { nr: this.rounds.size + 1, gametype: this.current_gametype, s1: scores[0], s2: scores[1], s3: scores[2], s4: scores[3] };

      this.gameDb.get('rounds').set(round);

      this.current_players = no_players();
    };

    Game.prototype.removeRound = function removeRound(id) {
      this.rounds.delete(id);
      this.gameDb.get('rounds').get(id).put(null);
    };

    Game.prototype.no_players = function no_players() {
      return [false, false, false, false];
    };

    _createClass(Game, [{
      key: 'countSelected',
      get: function get() {
        return this.current_players.map(function (x) {
          return x ? 1 : 0;
        }).reduce(_app.sum, 0);
      }
    }, {
      key: 'canSubmit',
      get: function get() {
        return this.countSelected == this.gametypes[this.current_gametype].players;
      }
    }]);

    return Game;
  }()) || _class);
});
define('games',['exports', 'gundb', 'aurelia-framework'], function (exports, _gundb, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Games = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Games = exports.Games = (_dec = (0, _aureliaFramework.inject)(_gundb.GunDb), _dec(_class = function () {
    function Games(gunDb) {
      var _this = this;

      _classCallCheck(this, Games);

      this.gamesDb = gunDb.db.get('games/koen');
      this.games = new Map();
      this.gamesDb.map().on(function (game, id) {
        if (game) {
          _this.games.set(id, game);
        } else {
          _this.games.delete(id);
        }
      });
    }

    Games.prototype.deactivate = function deactivate() {
      console.log("stop listening to gundb events");
      this.gamesDb.off();
    };

    Games.prototype.removeGame = function removeGame(id) {
      this.games.delete(id);
      this.gamesDb.get(id).put(null);
    };

    Games.prototype.newGame = function newGame() {
      var _this2 = this;

      console.log('fetching random name for game');
      fetch('http://setgetgo.com/randomword/get.php').then(function (response) {
        return response.text();
      }).then(function (name) {
        console.log('response', name);return _this2.gamesDb.set({ name: name });
      });
    };

    return Games;
  }()) || _class);
});
define('gundb',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var GunDb = exports.GunDb = function GunDb() {
    _classCallCheck(this, GunDb);

    this.db = Gun('http://colour-whist-gun.herokuapp.com/gun');
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template><require from=\"./app.css\"></require><section id=\"container\"><router-view></router-view></section></template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "html {\n  background-color: grey;\n  font-family: Courier New, Courier, monospace; }\n\nbody {\n  background-color: grey;\n  margin: 0px; }\n\n#container {\n  padding-top: 1em;\n  padding-bottom: 1em;\n  background-color: white;\n  margin-left: auto;\n  margin-right: auto;\n  width: 750px; }\n"; });
define('text!game.html', ['module'], function(module) { module.exports = "<template><require from=\"./game.css\"></require><section class=\"au-animate\"><section class=\"header\"><a route-href=\"route: games\">Games</a><h2>${game.name} <small>${id}</small></h2><form role=\"form\" submit.delegate=\"submit()\" class=\"game\"><select id=\"current_gametype\" value.bind=\"current_gametype\" change.delegate=\"selectGameType($event)\"><option repeat.for=\"name of gametypes | keys\">${name}</option></select><input id=\"current_score\" class=\"form-control\" type=\"number\" min=\"0\" value.bind=\"current_score\"> <button id=\"submit\" type=\"submit\" disabled.bind=\"!canSubmit\">Score</button></form></section><table class=\"rounds\"><thead><tr><td class=\"roundnr\"></td><td class=\"gametype\">Playing</td><td class=\"player\"><input class=\"form-control\" type=\"checkbox\" checked.bind=\"current_players[0]\"></td><td class=\"player\"><input class=\"form-control\" type=\"checkbox\" checked.bind=\"current_players[1]\"></td><td class=\"player\"><input class=\"form-control\" type=\"checkbox\" checked.bind=\"current_players[2]\"></td><td class=\"player\"><input class=\"form-control\" type=\"checkbox\" checked.bind=\"current_players[3]\"></td><th class=\"delete\"></th></tr><tr><td class=\"roundnr\"></td><td class=\"gametype\">Players</td><td class=\"player\">${players[1]}</td><td class=\"player\">${players[2]}</td><td class=\"player\">${players[3]}</td><td class=\"player\">${players[0]}</td><th class=\"delete\"></th></tr><tr><th class=\"roundnr\">#</th><th class=\"gametype\">Totals:</th><th class=\"player\">${totals[0]}</th><th class=\"player\">${totals[1]}</th><th class=\"player\">${totals[3]}</th><th class=\"player\">${totals[2]}</th><th class=\"delete\"></th></tr></thead><tbody><tr repeat.for=\"round of sortedRounds\"><td class=\"roundnr\">${round.nr}</td><td class=\"gametype\">${round.gametype}</td><td class=\"player\">${round.s1}</td><td class=\"player\">${round.s2}</td><td class=\"player\">${round.s3}</td><td class=\"player\">${round.s4}</td><th class=\"delete\"><a href=\"#\" click.delegate=\"$parent.removeRound(round.id)\" title=\"Remove\">[X]</a></th></tr></tbody></table></section></template>"; });
define('text!games.html', ['module'], function(module) { module.exports = "<template><require from=\"./games.css\"></require><section class=\"au-animate games\"><h2>Games</h2><div class=\"row au-stagger\"><ul class=\"list-group\"><li class=\"list-group-item\" repeat.for=\"[game_id, game] of games\"><a route-href=\"route: game; params.bind: { id: game_id }\">${game.name}</a> <a href=\"#\" click.delegate=\"$parent.removeGame(game_id)\" title=\"Remove\">[X]</a></li></ul></div><a href=\"#\" click.delegate=\"newGame()\" title=\"New\">New Game</a></section></template>"; });
//# sourceMappingURL=app-bundle.js.map