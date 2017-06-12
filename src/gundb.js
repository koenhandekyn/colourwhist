export class GunDb {
  constructor() { 
    this.db = Gun('https://colour-whist-gun.herokuapp.com/gun');
    // this.db = Gun('https://gun-jfulqixzue.now.sh/gun');
  }
}