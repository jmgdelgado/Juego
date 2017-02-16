var app={
  inicio: function(){
    DIAMETRO_BOLA = 50;
    dificultad = 0;
    velocidadX = 0;
    velocidadY = 0;
    puntuacion = 0;
    numVidas   = 5;
    hayColisionBordes= false;
		fondoInicial= 0xff*0x010000 + 0x28*0x000100 + 0xff*0x000001; //Equivalente a un RGB en hexadecimal
		fondoColisionBordes= '#ff0000'; //Rojo puro para representar colisión con los bordes
		fondoActual= fondoInicial;


    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;

    var weapon;

    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      game.stage.backgroundColor = '#f27d0c';
      game.stage.backgroundColor = '#000030';
      game.load.image('bola','assets/halcon.png');
      game.load.image('objetivo', 'assets/coin_euro.png');
      game.load.image('objetivo2', 'assets/bitcoin.png');
      game.load.image('vida', 'assets/corazon4.png');
      game.load.image('agujero', 'assets/black-hole.png');
      game.load.image('misil_1', 'assets/Misil_simulado2.png');
      game.load.image('misil_2', 'assets/missile2.png');
      game.load.image('misil_3', 'assets/rocket2.png');
      game.load.image('explosion_1', 'assets/explosion_1.png');
      game.load.image('explosion_2', 'assets/explosion_2.png');

      game.load.audio('colisionsound', 'assets/audio/colisionsound.ogg');
      game.load.audio('objetivosound', 'assets/audio/coin-04.wav');
      game.load.audio('succion', 'assets/audio/hambu.wav');
      game.load.audio('vidas', 'assets/audio/actmsg.wav');
      game.load.audio('fin', 'assets/audio/fanfare.wav');

      game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
      game.load.spritesheet('hole', 'assets/StarFoxBlackHole.png', 139, 139);


      game.load.image('bullet', 'assets/shmup-bullet.png');
    }

    function create() {
      titleText = game.add.text(5, 0, 'Puntos:             Nivel:      Vidas:', { fontSize: '25px', fill: '#ff7606' });
      scoreText = game.add.text(16, 16, puntuacion, { fontSize: '60px', fill: '#ff7606' });
      levelText = game.add.text(200, 25, dificultad, { fontSize: '25px', fill: '#ff7606' });
      lifeText  = game.add.text(300, 16, numVidas, { fontSize: '60px', fill: '#ff7606' });
      finText  = game.add.text(50, 250, '', { fontSize: '50px', fill: '#ff7606' });

      objetivo2 = game.add.sprite(app.inicioX(), app.inicioY(), 'objetivo2');
      objetivo = game.add.sprite(app.inicioX(), app.inicioY(), 'objetivo');
      objetivo.scale.set(0.2);
      objetivo2.scale.set(0.3);

      bola = game.add.sprite(app.inicioX(), app.inicioY(), 'bola');
      // vida = game.add.sprite(app.inicioXborde(), app.inicioY(), 'vida');
      vida = game.add.sprite(-150, -150, 'vida');
      agujero = game.add.sprite(app.inicioX(), app.inicioY(), 'agujero');
      // misil_1 = game.add.sprite(app.inicioX(), app.inicioYborde(), 'misil_1');
      // misil_2 = game.add.sprite(app.inicioXborde(), app.inicioY(), 'misil_2');
      // misil_3 = game.add.sprite(app.inicioX(), app.inicioYborde(), 'misil_3');
      misil_1 = game.add.sprite(-150,-150, 'misil_1');
      misil_2 = game.add.sprite(-150,-150, 'misil_2');
      misil_3 = game.add.sprite(-150,-150, 'misil_3');
      // explosion_1 = game.add.sprite(-150,-150, 'explosion_1');
      // explosion_2 = game.add.sprite(-150,-150, 'explosion_2');

      // explosion = game.add.spritesheet(-150,-150, 'kaboom');
      explosion = game.add.sprite(-1500,-1500, 'kaboom');
      hole = game.add.sprite(-1500,-1500, 'hole');

      colisionsound = game.add.audio('colisionsound');
      objetivosound = game.add.audio('objetivosound');
      objetivosound = game.add.audio('objetivosound');
      vidasound     = game.add.audio('vidas');
      finsound      = game.add.audio('fin');
      succionsound  = game.add.audio('succion');

      misil_1.scale.set(0.7);
      misil_2.scale.set(0.5);
      misil_3.scale.set(0.5);
      bola.scale.set(0.75);
      agujero.scale.set(0.30);

      game.physics.arcade.enable(bola);
      game.physics.arcade.enable(objetivo);
      game.physics.arcade.enable(objetivo2);
      game.physics.arcade.enable(vida);
      game.physics.arcade.enable(agujero);
      game.physics.arcade.enable(misil_1);
      game.physics.arcade.enable(misil_2);
      game.physics.arcade.enable(misil_3);
      // game.physics.arcade.enable(explosion_1);
      // game.physics.arcade.enable(explosion_2);

      bola.body.collideWorldBounds = true;
      bola.body.onWorldBounds = new Phaser.Signal();
      bola.body.onWorldBounds.add(app.decrementaPuntuacion, this);

      bola.body.bounce = 0.2;


      bola.inputEnabled = true;
      bola.input.useHandCursor = true;
      bola.events.onInputDown.add(disparaBala, this);
      game.input.onTap.add(onTap, this);
      bola.input.onTap.add(onTap, this);

      //  Creates 30 bullets, using the 'bullet' graphic
      weapon = game.add.weapon(30, 'bullet');
      //  The bullet will be automatically killed when it leaves the world bounds
      weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
      //  The speed at which the bullet is fired
      weapon.bulletSpeed = 600;
      //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
      weapon.fireRate = 100;
      //  Tell the Weapon to track the 'player' Sprite
      //  With no offsets from the position
      //  But the 'true' argument tells the weapon to track sprite rotation
      weapon.trackSprite(bola, 0, 0, true);


      // bola.animations.add('spin', [ 'explosion_1.png', 'explosion_2.png' ], 50, true, false);
    }

    function update(){
      var factorDificultad = (300 + (dificultad * 100));
      bola.body.velocity.y = (velocidadY * factorDificultad);
      bola.body.velocity.x = (velocidadX * (-1 * factorDificultad));

      if (agujero.scale.x < 2) {
        agujero.scale.x += 0.0001;
        agujero.scale.y += 0.0001;
      }



      if (app.tocaActivar(2000)) {
        vida.body.x = app.inicioXborde();
        vida.body.y = app.inicioY();
      };

      if (app.tocaActivar(500) && misil_1.body.y < 0) {
        misil_1.body.x = app.inicioX();
        misil_1.body.y = app.inicioYborde();
      };

      if (app.tocaActivar(300) && misil_2.body.x < 0) {
        misil_2.body.x = app.inicioXborde();
        misil_2.body.y = app.inicioY();
      };

      if (app.tocaActivar(400) && misil_3.body.y < 0) {
        misil_3.body.x = app.inicioX();
        misil_3.body.y = app.inicioYborde();
      };

      vida.body.x = vida.body.x - 3;
      misil_1.body.y = misil_1.body.y - 1;
      misil_2.body.x = misil_2.body.x - 2;
      misil_3.body.y = misil_3.body.y - 3;

      game.physics.arcade.overlap(bola, objetivo, app.incrementaPuntuacion, null, this);
      game.physics.arcade.overlap(bola, objetivo2, app.incrementaPuntuacion2, null, this);
      game.physics.arcade.overlap(bola, agujero, app.caeAgujero, null, this);
      game.physics.arcade.overlap(bola, vida, app.incrementaVida, null, this);
      game.physics.arcade.overlap(bola, misil_1, app.impactoMisil, null, this);
      game.physics.arcade.overlap(bola, misil_2, app.impactoMisil, null, this);
      game.physics.arcade.overlap(bola, misil_3, app.impactoMisil, null, this);
      game.physics.arcade.overlap(misil_1, misil_3, app.choqueMisiles, null, this);
      game.physics.arcade.overlap(misil_1, misil_2, app.choqueMisiles, null, this);
      game.physics.arcade.overlap(misil_2, misil_3, app.choqueMisiles, null, this);

      game.physics.arcade.overlap(objetivo, agujero, app.reposicionaObjetivo1, null, this);
      game.physics.arcade.overlap(objetivo2, agujero, app.reposicionaObjetivo2, null, this);

      game.physics.arcade.overlap(misil_1, agujero, app.misilEnAgujero, null, this);
      game.physics.arcade.overlap(misil_2, agujero, app.misilEnAgujero, null, this);
      game.physics.arcade.overlap(misil_3, agujero, app.misilEnAgujero, null, this);

/*
      if (dificultad > 0) {
          fondoActual= fondoInicial + (0x0d*dificultad)*0x000100; //Modifico la componente G del inicial 0x28 hacia 0xFF (hacia blanco, pues R y B ya son 0xFF)
				  game.stage.backgroundColor= fondoActual;
      } else {
          game.stage.backgroundColor= fondoActual= fondoInicial;
      }
*/

/*
      if (hayColisionBordes===true)
      {
        game.stage.backgroundColor= fondoColisionBordes;
        hayColisionBordes= false;
      }
      else
        game.stage.backgroundColor= fondoActual;
*/

    }

    function onTap(pointer, doubleTap) {

      numVidas +=1;
      lifeText.text = numVidas;
      weapon.fire();

    }

    var estados = { preload: preload, create: create, update: update, onTap: onTap };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser', estados);

  },




  finalizaJuego: function(){
    finsound.play();
    numVidas = 0;
    lifeText.text = numVidas;
    finText.text  = 'GAME OVER';
    vida.body.x = -150;
    vida.body.y = -150;
    bola.body.x = -150;
    bola.body.y = -150;
    agujero.body.x = -150;
    agujero.body.y = -150;
    objetivo.body.x = -150;
    objetivo.body.y = -150;
    objetivo2.body.x = -150;
    objetivo2.body.y = -150;

    bola.destroy();
    agujero.destroy();
    vida.destroy();
    objetivo.destroy();
    objetivo2.destroy();
    misil_3.destroy();
    misil_2.destroy();
    misil_1.destroy();
    explosion.destroy();
    hole.destroy();

    setTimeout(app.recomienza, 3000);


  },

  sleep: function(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  },



  choqueMisiles: function(sprite1, sprite2){

    if (sprite1.body.x > 0 && sprite1.body.y > 0) {
      colisionsound.play();

      var x = sprite1.body.x - DIAMETRO_BOLA;
      var y = sprite1.body.y - DIAMETRO_BOLA;

      app.mostrarExplosion(x,y);

      sprite1.body.x = -150;
      sprite1.body.y = -150;
      sprite2.body.x = -150;
      sprite2.body.y = -150;
    }

  },

  impactoMisil: function(){
    colisionsound.play();

    var x = bola.body.x - DIAMETRO_BOLA;
    var y = bola.body.y - DIAMETRO_BOLA;

    app.mostrarExplosion(x,y);

    app.decrementaVida();
  },

  misilEnAgujero: function(sprite1,sprite2){
    // bola.body.x = agujero.body.x;
    // bola.body.y = agujero.body.y;
    // game.add.tween(bola.scale).to( { x: 2, y: 2 }, 2000, Phaser.Easing.Linear.None, true);

    succionsound.play('',0,5);
    sprite1.body.x = -150;
    sprite1.body.y = -150;

  },

  caeAgujero: function(){
    bola.body.x = agujero.body.x;
    bola.body.y = agujero.body.y;
    // game.add.tween(bola.scale).to( { x: 2, y: 2 }, 2000, Phaser.Easing.Linear.None, true);

    succionsound.play('',0,5);

    var x = bola.body.x - DIAMETRO_BOLA;
    var y = bola.body.y - DIAMETRO_BOLA;

    app.mostrarTragalo(x,y);
    // app.mostrarExplosion(x,y);

    app.decrementaVida();
  },

  mostrarExplosion: function(x,y){
    var explota = explosion.animations.add('walk');
    //  And this starts the animation playing by using its key ("walk")
    //  30 is the frame rate (30fps)
    //  true means it will loop when it finishes
    explosion.x = x;
    explosion.y = y;
    explosion.animations.play('walk', 50, false);
  },

  mostrarTragalo: function(x,y){
    var traga = hole.animations.add('black');
    //  And this starts the animation playing by using its key ("walk")
    //  30 is the frame rate (30fps)
    //  true means it will loop when it finishes
    hole.x = x;
    hole.y = y;
    hole.animations.play('black', 50, false);
  },

  decrementaVida: function(){

    if (numVidas > 1) {
      numVidas = numVidas - 1;
      lifeText.text = numVidas;
      bola.body.x = app.inicioX();
      bola.body.y = app.inicioY();
    } else {
       lifeText.text = '0';
       app.finalizaJuego();
    }
  },

  incrementaVida: function(){
      vidasound.play();

      numVidas = numVidas + 1;
      lifeText.text = numVidas;
      vida.body.x = -50;
      vida.body.y = -50;

  },

  decrementaPuntuacion: function(){
		hayColisionBordes= true;

    if (puntuacion > 0) {
      puntuacion = puntuacion-1;
      scoreText.text = puntuacion;
      if (dificultad > 0) {
        dificultad = dificultad - 1;
        levelText.text = dificultad;
      }
    }
  },

  incrementaPuntuacion: function(){
    objetivosound.play();

    puntuacion = puntuacion+1;
    scoreText.text = puntuacion;

    objetivo.body.x = app.inicioX();
    objetivo.body.y = app.inicioY();

    if (puntuacion > 0){
      dificultad = dificultad + 1;
      levelText.text = dificultad;
    }
  },

  reposicionaObjetivo1: function(){

    objetivo.body.x = app.inicioX();
    objetivo.body.y = app.inicioY();

  },

  reposicionaObjetivo2: function(){

    objetivo2.body.x = app.inicioX();
    objetivo2.body.y = app.inicioY();

  },

  incrementaPuntuacion2: function(){
    objetivosound.play();

    puntuacion = puntuacion+10;
    scoreText.text = puntuacion;

    objetivo2.body.x = app.inicioX();
    objetivo2.body.y = app.inicioY();

    if (puntuacion > 0){
      dificultad = dificultad + 1;
      levelText.text = dificultad;
    }
  },
  inicioX: function() {
    return app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA );
  },

  inicioY: function(){
    return app.numeroAleatorioHasta(alto - DIAMETRO_BOLA*2)+DIAMETRO_BOLA;
  },

  inicioXborde: function() {
    return (ancho - DIAMETRO_BOLA );
  },

  inicioYborde: function(){
    return (alto - DIAMETRO_BOLA);
  },

  numeroAleatorioHasta: function(limite){
    return Math.floor(Math.random() * limite);
  },

  tocaActivar: function(probabilidad){
    if (app.numeroAleatorioHasta(probabilidad) === 1) {
      //console.log('resultaso: true');
      return true
    } else {
      //console.log('resultado: false');
      return false;
    }
  },

  vigilaSensores: function(){

        function onError() {
          console.log('onError!');
        }

        function onSuccess(datosAceleracion){
            app.detectaAgitacion(datosAceleracion);
            app.registraDireccion(datosAceleracion);
          }

        navigator.accelerometer.watchAcceleration(onSuccess, onError,{frequency: 10});

  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY) {
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }

};

if ('addEventListener' in document) {
  document.addEventListener('deviceready', function() {
    app.inicio();
  }, false);
}
