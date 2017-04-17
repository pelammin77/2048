var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var palanKoko = 100;
var voiLiikkua = false;
var groupTilet;
var tileja;
var MAX_TILE = 16;
var score;
var topScore;
var palatTaulu;
var localStorageKaytossa;
var varit = {
    2: 0xFFFFFF,
    4: 0xFFEEEE,
    8: 0xFFDDDD,
    16: 0xFFCCCC,
    32: 0xFFBBBB,
    64: 0xFFAAAA,
    128: 0xFF9999,
    256: 0xFF8888,
    512: 0xFF7777,
    1024: 0xFF6666,
    2048: 0xFF5555,
    4096: 0xFF4444,
    8192: 0xFF3333,
    16384: 0xFF2222,
    32768: 0xFF1111,
    65536: 0xFF0000
};
//let header = new Phaser.Game(100, 400, Phaser.AUTO,'header');
var game = new Phaser.Game(400, 400, Phaser.AUTO, 'content', {
    create: this.create, preload: this.preload
});
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super.apply(this, arguments) || this;
    }
    BootState.prototype.create = function () {
        //   alert("Alkaa");    
        game.stage.backgroundColor = '#000000'; //'#BDD5DD';
        game.state.start('preLoadState');
        //     header.stage.backgroundColor = '#CDC0B4';
    };
    return BootState;
}(Phaser.State));
var PreLoaderState = (function (_super) {
    __extends(PreLoaderState, _super);
    function PreLoaderState() {
        return _super.apply(this, arguments) || this;
    }
    PreLoaderState.prototype.preload = function () {
        //alert("Lataa");
        game.load.image('tile', 'kuvat/tile.png');
        game.load.image('tile2', 'kuvat/tile_pohja.png');
        game.load.image('label', "kuvat/label.png");
        game.load.image('labelComplete', 'kuvat/label_Complete.png');
        game.stage.backgroundColor = "#CDC0B4";
    };
    PreLoaderState.prototype.create = function () {
        game.scale.pageAlignHorizontally = true;
        // center the game vertically
        game.scale.pageAlignVertically = true;
        // setting the scale mode to cover the largest part of the screen possible while showing the entire game
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        /*
                   header.scale.pageAlignHorizontally = true;
                  // center the game vertically
                header.scale.pageAlignVertically = true;
                  // setting the scale mode to cover the largest part of the screen possible while showing the entire game
                  header.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        */
        game.state.start('gameState');
    };
    return PreLoaderState;
}(Phaser.State));
var GameOnState = (function (_super) {
    __extends(GameOnState, _super);
    function GameOnState() {
        return _super.apply(this, arguments) || this;
    }
    GameOnState.prototype.create = function () {
        palatTaulu = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        game.add.tileSprite(0, 0, game.width, game.height, 'tile2');
        tileja = 0;
        score = 0;
        /*
          if ('localStorage' in window && window.localStorage !== null) {
           alert('can use');
       }else{
           alert('cannot use');
       }
       */
        topScore = localStorage.getItem("topScore") == null ? 0 : localStorage.getItem("topScore");
        game.input.onDown.add(this.aloitaPyyhkaisy, this);
        game.input.onUp.add(this.lopetaPyyhkaisy, this);
        this.UP_ARROW = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.UP_ARROW.onDown.add(this.liikutaYlos, this);
        this.DOWN_ARROW = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.DOWN_ARROW.onDown.add(this.liikutaAlas, this);
        this.LEFT_ARROW = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.LEFT_ARROW.onDown.add(this.liikutaVasemalle, this);
        this.RIGHT_ARROW = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.RIGHT_ARROW.onDown.add(this.liikutaOikealle, this);
        groupTilet = game.add.group();
        this.lisaaTile();
        this.lisaaTile();
        document.getElementById("score").innerHTML = "Score: " + score;
        document.getElementById('hiScore').innerHTML = "Top score: " + topScore;
    };
    GameOnState.prototype.lisaaTile = function () {
        do {
            var randomValue = Math.floor(Math.random() * 16);
        } while (palatTaulu[randomValue] != 0);
        palatTaulu[randomValue] = 2;
        var tile = game.add.sprite(palautaSarake(randomValue) * palanKoko, palautaRivi(randomValue) * palanKoko, "tile");
        // creation of a custom property "pos" and assigning it the index of the newly added "2"
        tile.pos = randomValue;
        // at the beginning the tile is completely transparent
        tile.alpha = 0;
        // creation of a text which will represent the value of the tile
        var text = game.add.text(palanKoko / 2, palanKoko / 2, "2", { font: "bold 36px Arial", align: "center" });
        // setting text anchor in the horizontal and vertical center
        tile.value = 2;
        text.anchor.set(0.5);
        // adding the text as a child of tile sprite
        tile.addChild(text);
        // adding tile sprites to the group
        groupTilet.add(tile);
        // creation of a new tween for the tile sprite
        var fadeIn = game.add.tween(tile);
        // the tween will make the sprite completely opaque in 250 milliseconds
        fadeIn.to({ alpha: 1 }, 250);
        // tween callback
        fadeIn.onComplete.add(function () {
            muutaTilenArvo();
            // updating tile numbers. This is not necessary the 1st time, anyway
            // now I can move
            voiLiikkua = true;
        });
        // starting the tween
        fadeIn.start();
        tileja++;
        // this.peliLoppui();
    };
    GameOnState.prototype.liikutaYlos = function () {
        if (voiLiikkua == true) {
            voiLiikkua = false;
            var moved = false;
            groupTilet.sort("y", Phaser.Group.SORT_ASCENDING);
            groupTilet.forEach(function (item) {
                var row = palautaRivi(item.pos);
                var col = palautaSarake(item.pos);
                if (row > 0) {
                    var remove = false;
                    for (var i = row - 1; i >= 0; i--) {
                        if (palatTaulu[i * 4 + col] != 0) {
                            if (palatTaulu[i * 4 + col] == palatTaulu[row * 4 + col]) {
                                remove = true;
                                i--;
                            }
                            break;
                        }
                    }
                    if (row != i + 1) {
                        moved = true;
                        liikutaPalaa(item, row * 4 + col, (i + 1) * 4 + col, remove);
                    }
                }
            });
            this.lopetaLiike(moved);
        }
    };
    GameOnState.prototype.liikutaAlas = function () {
        if (voiLiikkua == true) {
            voiLiikkua = false;
            var moved = false;
            groupTilet.sort("y", Phaser.Group.SORT_DESCENDING);
            groupTilet.forEach(function (item) {
                var row = palautaRivi(item.pos);
                var col = palautaSarake(item.pos);
                if (row < 3) {
                    var remove = false;
                    for (var i = row + 1; i <= 3; i++) {
                        if (palatTaulu[i * 4 + col] != 0) {
                            if (palatTaulu[i * 4 + col] == palatTaulu[row * 4 + col]) {
                                remove = true;
                                i++;
                            }
                            break;
                        }
                    }
                    if (row != i - 1) {
                        moved = true;
                        liikutaPalaa(item, row * 4 + col, (i - 1) * 4 + col, remove);
                    }
                }
            });
            this.lopetaLiike(moved);
        }
    };
    GameOnState.prototype.liikutaOikealle = function () {
        if (voiLiikkua == true) {
            voiLiikkua = false;
            var moved = false;
            groupTilet.sort("x", Phaser.Group.SORT_DESCENDING);
            groupTilet.forEach(function (item) {
                var row = palautaRivi(item.pos);
                var col = palautaSarake(item.pos);
                if (col < 3) {
                    var remove = false;
                    for (var i = col + 1; i <= 3; i++) {
                        if (palatTaulu[row * 4 + i] != 0) {
                            if (palatTaulu[row * 4 + i] == palatTaulu[row * 4 + col]) {
                                remove = true;
                                i++;
                            }
                            break;
                        }
                    }
                    if (col != i - 1) {
                        moved = true;
                        liikutaPalaa(item, row * 4 + col, row * 4 + i - 1, remove);
                    }
                }
            });
            this.lopetaLiike(moved);
        }
    };
    GameOnState.prototype.liikutaVasemalle = function () {
        // Is the player allowed to move?
        if (voiLiikkua == true) {
            // the player can move, let's set "canMove" to false to prevent moving again until the move process is done
            voiLiikkua = false;
            // keeping track if the player moved, i.e. if it's a legal move
            var moved = false;
            // look how I can sort a group ordering it by a property
            groupTilet.sort("x", Phaser.Group.SORT_ASCENDING);
            // looping through each element in the group
            groupTilet.forEach(function (item) {
                // getting row and column starting from a one-dimensional array
                var row = palautaRivi(item.pos);
                var col = palautaSarake(item.pos);
                // checking if we aren't already on the leftmost column (the tile can't move)
                if (col > 0) {
                    // setting a "remove" flag to false. Sometimes you have to remove tiles, when two merge into one 
                    var remove = false;
                    // looping from column position back to the leftmost column
                    for (var i = col - 1; i >= 0; i--) {
                        // if we find a tile which is not empty, our search is about to end...
                        if (palatTaulu[row * 4 + i] != 0) {
                            // ...we just have to see if the tile we are landing on has the same value of the tile we are moving
                            if (palatTaulu[row * 4 + i] == palatTaulu[row * 4 + col]) {
                                // in this case the current tile will be removed
                                remove = true;
                                i--;
                            }
                            break;
                        }
                    }
                    // if we can actually move...
                    if (col != i + 1) {
                        // set moved to true
                        moved = true;
                        // moving the tile "item" from row*4+col to row*4+i+1 and (if allowed) remove it
                        liikutaPalaa(item, row * 4 + col, row * 4 + i + 1, remove);
                    }
                }
            });
            // completing the move
            this.lopetaLiike(moved);
        }
    };
    GameOnState.prototype.lopetaLiike = function (l) {
        if (l == true) {
            this.lisaaTile();
            var s = this.onkoSiirtojaJaljella();
            if (s == false) {
                this.game.time.events.add(Phaser.Timer.SECOND * 2, this.peliLoppui, this);
            }
        }
        else {
            voiLiikkua = true;
        }
    };
    GameOnState.prototype.onkoSiirtojaJaljella = function () {
        if (onkoTyhjiä() == true)
            return true;
        //  if(groupTilet.length<15) return true;
        // var paluuarvo=false;       
        groupTilet.sort("pos", Phaser.Group.SORT_ASCENDING);
        for (var i = 0; i < 16; i++) {
            var tile = groupTilet.getAt(i);
            var t = palatTaulu[tile.pos];
            var tileCol = palautaSarake(tile.pos);
            var tilenRivi = palautaRivi(tile.pos);
            var viereinen;
            viereinen = palatTaulu[tile.pos + 1];
            if (tileCol == 3)
                viereinen = -1;
            var seuraavanRivi;
            seuraavanRivi = palautaRivi(tile.pos + 1);
            var alhaalla;
            alhaalla = palatTaulu[tile.pos + 4];
            if (alhaalla == "undefined")
                alhaalla = -1;
            if (t == viereinen || viereinen == 0) {
                return true;
            }
            else if (t == alhaalla || alhaalla == 0) {
                return true;
            }
        }
        return false;
    };
    GameOnState.prototype.update = function () {
    };
    GameOnState.prototype.aloitaPyyhkaisy = function (e) {
        game.input.onDown.remove(this.aloitaPyyhkaisy, this);
        game.input.onUp.add(this.lopetaPyyhkaisy, this);
    };
    GameOnState.prototype.lopetaPyyhkaisy = function (e) {
        var swipeTime = e.timeUp - e.timeDown;
        var swipeDistance = Phaser.Point.subtract(e.position, e.positionDown);
        var swipeMagnitude = swipeDistance.getMagnitude();
        var swipeNormal = Phaser.Point.normalize(swipeDistance);
        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.x) > 0.8 || Math.abs(swipeNormal.y) > 0.8)) {
            if (swipeNormal.x > 0.8) {
                this.liikutaOikealle();
            }
            if (swipeNormal.x < -0.8) {
                this.liikutaVasemalle();
            }
            if (swipeNormal.y > 0.8) {
                this.liikutaAlas();
            }
            if (swipeNormal.y < -0.8) {
                this.liikutaYlos();
            }
        }
        else {
            game.input.onDown.add(this.aloitaPyyhkaisy, this);
        }
    };
    GameOnState.prototype.peliLoppui = function () {
        // localStorage.setItem("topScore",Math.max(score,topScore));
        var gameOverLabel = game.add.sprite(0, 0, 'label');
        if (score > topScore)
            topScore = score;
        try {
            localStorage.setItem("topScore", topScore.toString());
        }
        catch (ex) {
            alert("Can't save hiscore");
        }
        // alert("Game over"+score +" "+ topScore);
        gameOverLabel.alpha = 0.7;
        tulostaLopetus();
        this.input.onTap.addOnce(this.reStart, this);
        //  game.state.start("gameOverState");
    };
    /*
    suoritettu(){
    
         var gameOverLabel = game.add.sprite(0, 0, 'labelComplete');
      
            gameOverLabel.alpha = 0.7;
            let textPisteet: string = "Your score "+score;
            let style2 = { font: "35px Arial", fill: "#19070B", align: "center" };
             game.add.text(50, 200, textPisteet,style2);
             this.input.onTap.addOnce(this.reStart, this);
    }
    */
    GameOnState.prototype.reStart = function () {
        // game.state.start("gameState");
        game.state.start('gameState');
    };
    return GameOnState;
}(Phaser.State));
function muutaTilenArvo() {
    groupTilet.forEach(function (item) {
        var value = palatTaulu[item.pos];
        // showing the value
        item.getChildAt(0).text = value;
        item.value = value;
        // tinting the tile
        item.tint = varit[value];
        //  score= value;
        // console.log("Score "+ score);
        if (value == 2048) {
            voiLiikkua == false;
            peliSuoritettu();
        }
    });
}
function palautaRivi(n) {
    return Math.floor(n / 4);
}
function palautaSarake(n) {
    return n % 4;
}
function liikutaPalaa(tile, lahtoPaikka, kohdePaikka, poistetaan) {
    palatTaulu[kohdePaikka] = palatTaulu[lahtoPaikka];
    palatTaulu[lahtoPaikka] = 0;
    tile.pos = kohdePaikka;
    // then we create a tween
    var movement = game.add.tween(tile);
    movement.to({ x: palanKoko * (this.palautaSarake(kohdePaikka)), y: palanKoko * (this.palautaRivi(kohdePaikka)) }, 150);
    if (poistetaan == true) {
        // if the tile has to be removed, it means the destination tile must be multiplied by 2
        palatTaulu[kohdePaikka] *= 2;
        // at the end of the tween we must destroy the tile
        movement.onComplete.add(function () {
            score = score + tile.value * 2;
            document.getElementById("score").innerHTML = "Score: " + score;
            //  document.getElementById("hiScore").innerHTML="Top score: "+topScore;                                
            tile.destroy();
            tileja--;
        });
    }
    // let the tween begin!
    movement.start();
}
function peliSuoritettu() {
    localStorage.setItem("topScore", Math.max(score, topScore));
    if (score > topScore)
        topScore = score;
    var gameOverLabel = game.add.sprite(0, 0, 'labelComplete');
    gameOverLabel.alpha = 0.7;
    tulostaLopetus();
    game.input.onTap.addOnce(aloitaPeliUudestaan);
    //  game.state.start("gameOverState");
}
function tulostaLopetus() {
    var textPisteet = "Your score: " + score;
    var hiScoreText = "Hi score: " + topScore;
    var style2 = { font: "35px Arial", fill: "#19070B", align: "center" };
    game.add.text(50, 200, textPisteet, style2);
    game.add.text(50, 300, hiScoreText, style2);
}
function aloitaPeliUudestaan() {
    game.state.start("gameState");
}
function onkoTyhjiä() {
    for (var i = 0; i < palatTaulu.length; i++) {
        if (palatTaulu[i] == 0) {
            console.log("tyhjiä löytyy");
            return true;
        }
    }
    console.log("Taynna");
    return false;
}
game.state.add('bootState', BootState, true);
game.state.add('preLoadState', PreLoaderState);
game.state.add('gameState', GameOnState);
