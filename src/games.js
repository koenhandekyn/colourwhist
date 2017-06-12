// import {gun} from 'gun';
import {GunDb} from 'gundb';
import {inject} from 'aurelia-framework';
// import {lodash} from 'lodash';

@inject(GunDb)
export class Games {  
  constructor(gunDb)  {
    this.gamesDb = gunDb.db.get('games/koen');
    this.games = new Map();    
    this.gamesDb.map().on((game, id) => {      
      if (game) { 
        this.games.set(id,game);
      } else {
        this.games.delete(id);
      }
    });    
  }

  deactivate() {
  }  

  removeGame(id) { 
    this.games.delete(id); // delete from list
    this.gamesDb.get(id).put(null); // delete from store
  }

  newGame() { 
    console.log('fetching random name for game');
    fetch('https://setgetgo.com/randomword/get.php')
      .then((response) => {return response.text(); })
      .then((name) => { console.log('response', name); return this.gamesDb.set( {name: name} ); });
  }
}

