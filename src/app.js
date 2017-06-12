export class App {
  constructor() {
  }

  configureRouter(config, router) {
    config.title = 'Colour Whist';
    config.map([
      { route: ['', 'games'], name: 'games', moduleId: 'games', nav: false, title: 'Games' },
      { route: ['games/:id'], name: 'game', moduleId: 'game', nav: false, title: 'Game' },
      // { route: 'welcome', name: 'welcome', moduleId: 'welcome', nav: true, title: 'Welcome' },
    ]);

    this.router = router;
  }
}

export const sum = (a, b) => a + b;
