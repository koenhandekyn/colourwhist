import {App} from 'app';
import {GunDb} from 'gundb';
import {Games} from 'games';
import {inject} from 'aurelia-framework';
import {sum} from './app';
// import {computedFrom} from 'aurelia-framework';
// import {observable} from 'aurelia-framework';

// converter to help to iterate over a Hash
export class KeysValueConverter {
  toView(value){
    return Object.keys(value);
  }
}

@inject(GunDb, Games, App)
export class Game {

  // @observable totals;
  // totalsChanged(newValue, oldValue) {
  //   console.log('totals changed', newValue, oldValue);
  // }

  constructor(gunDb, games, app) { 
    this.app = app;
    this.gunDb = gunDb.db;
    this.games = games;
    this.players = ['koen', 'kevin', 'gert', 'yves'];
    this.totals = [0,0,0,0];
    this.roundNrMax = 0;
    // this.rounds = [];
    this.rounds = new Map();
  }

  activate(params) {
    this.id = params['id'];
    this.gameDb = this.gunDb.get(this.id);
    this.gameDb.val( game => { this.game = game });
    this.gameDb.get('rounds').map().on((round,id) => { 
      if (round) {         
        this.rounds.set(id, round);
        // incrementally calculate max round nr
        if (Number.parseInt(round.nr) > this.roundNrMax) { 
          this.roundNrMax = round.nr;
        }
      } else { 
        this.rounds.delete(id);
      }
      // derive sorted array
      this.sortedRounds = Array.from(this.rounds.entries())
                                .map( ([k,v]) => { v.id=k; return v; } )
                                .sort( (a,b) => b.nr - a.nr );        
      // calculate the max round nr 
      // this.roundNrMax = Math.max(...this.sortedRounds.map( r => Number.parseInt(r.nr) ));
      // calculate and store totals
      let t1 = this.sortedRounds.map( r => r.s1 ).reduce(sum, 0);
      let t2 = this.sortedRounds.map( r => r.s2 ).reduce(sum, 0);
      let t3 = this.sortedRounds.map( r => r.s3 ).reduce(sum, 0);
      let t4 = this.sortedRounds.map( r => r.s4 ).reduce(sum, 0);
      this.totals = [t1, t2, t3, t4];
    });
  }  

  deactivate() {
    // this is ok as we start listening on the activate
    console.log("stop listening to gundb events");
    this.gameDb.get('rounds').off();
  }

  // TODO turn this into a const
  gametypes = {
    '6a': { players: 1, score: 2 },
    '7a': { players: 1, score: 2 },
    '8a': { players: 1, score: 2 },
    '8': { players: 2, score: 2 },
    '9': { players: 2, score: 2 },
    '10': { players: 2, score: 2 },
    '11': { players: 2, score: 2 },
    '12': { players: 2, score: 2 },
    'Mis': { players: 1, score: 4 },
    'Abo': { players: 1, score: 6 },
    'Solo': { players: 1, score: 24 },
    'Pas': { players: 0, score: 0 }
  };

  current_score = 2;
  current_gametype = '8';
  current_players = this.no_players();

  selectGameType(event) {
    let gametype = this.gametypes[event.srcElement.value];
    this.current_score = gametype.score;
  }

  get countSelected() {
    return this.current_players.map( x => x ? 1 : 0).reduce(sum, 0);
  }

  get canSubmit() {
    return this.countSelected == this.gametypes[this.current_gametype].players;
  }

  submit() {
    // the current score
    let score = Number.parseInt(this.current_score);
    // the scores
    let scores = (this.countSelected == 2) ?
                    [0,1,2,3].map( x => (this.current_players[x] == true ? score     : -score ) ) :
                    [0,1,2,3].map( x => (this.current_players[x] == true ? score * 3 : -score ) );    
    // the round
    let round = { nr: this.roundNrMax+1, gametype: this.current_gametype, s1: scores[0], s2: scores[1], s3: scores[2], s4: scores[3] }
    // persist
    this.gameDb.get('rounds').set( round );
    // this.gameDb.put({ totals: { t1: t1, t2: t2, t3: t3, t4: t4 }});
    // deselect players
    this.current_players = this.no_players();
  }

  removeRound(id) { 
    let confirmation = confirm("Confirm removal of this round.");
    if (confirmation == true) {
      this.rounds.delete(id); // delete from list
      this.gameDb.get('rounds').get(id).put(null); // delete from store
    } else {
    }        
  }
  
  no_players() { 
    return [false, false, false, false];
  }  

  remove() {     
    let confirmation = confirm("Confirm removal of this game.");
    if (confirmation == true) {
      this.app.router.navigateToRoute('games', { });
      this.games.removeGame(this.id);
    } else {
    }    
  }
}
