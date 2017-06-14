import {GunDb} from 'gundb';
import {inject} from 'aurelia-framework';
// import {default as word} from 'words'; // alternative for the below let randomWords = require('words');    

@inject(GunDb)
export class Games {  
  constructor(gunDb)  {    
    this.games = new Map();    
    this.gamesDb = gunDb.db.get('games/koen');
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
    console.log("new game");
    let randomWords = require('words');    
    let name = randomWords();
    this.gamesDb.set( {name: name} );
    // alternatively use a service for fetching a random word
    // it's not working however due to mixed http and https traffic
    // console.log('fetching random name for game');
    // fetch('http://setgetgo.com/randomword/get.php')
    //   .then((response) => { return response.text(); })
    //   .then((name) => { console.log('response', name); return this.gamesDb.set( {name: name} ); });
  }
}

