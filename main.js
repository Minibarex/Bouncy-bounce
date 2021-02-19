let minCanvas = document.getElementById('minCanvas');
let ctx = minCanvas.getContext('2d');
let theGameIsOn = true; // Sjekker om spillet kjører
let hdnPoeng = document.getElementById('hdnPoeng');
let hdnRekord = document.getElementById('hdnRekord');
let poeng = 0;

let bane = { // Objektet bane
    bredde: minCanvas.width, // Bredden lik canvas
    hoyde: minCanvas.height,
    banefarge: 'LightBlue',
    linjefarge: 'White',
    linjetykkelse: 4
}
function tegnBane() { // Funksjonen som tegner banen
    ctx.fillStyle = bane.banefarge; // Farge på banen
    ctx.fillRect(0, 0, bane.bredde, bane.hoyde); 
}
let ball = { // Ballen 
    radius: 12,
    xpos: 400, // x-posisjon ved start
    ypos: 10, // y-posisjon ved start
    farge: 'red',
    xretning: 0,
    xfart: 0,
    yfart: 0,
    gravity: 1,
    gravitySpeed: 0.5,
    bounce: 0.5
}
function tegnBall() { // Tegner opp en sirkel
    ctx.beginPath(); // Start tegningen av buen
    ctx.arc(ball.xpos, ball.ypos, ball.radius, 0, Math.PI*2); // Tegner sirkel
    ctx.closePath(); // Lukker sirkelbuen
    ctx.fillStyle = ball.farge; // Setter farge
    ctx.fill(); // Fyller sirkelen med fargen
}

function gravitasjon() {
    ball.gravitySpeed += ball.gravity;
    ball.xpos += ball.xfart;
    ball.ypos += ball.yfart + ball.gravitySpeed;
} 
let racket = {
    'bredde': 100,
    'hoyde': 10,
    'farge': 'Yellow',
    'xpos': bane.bredde -425,
    'ypos': bane.hoyde -20,
    'xretning': 0, // retning (starter stillestående)
    'xfart': 20 // Fart på racket
}
function tegnRacket() {
    ctx.fillStyle = racket.farge; // Racket farge
    ctx.fillRect(racket.xpos, racket.ypos, // Tegner racket
    racket.bredde, racket.hoyde);
    if (racket.xpos <= 0) { // Holder racket innenfor banen
        racket.xpos = 0;
    }
    if (racket.xpos + racket.bredde >= bane.bredde) { // Holder racket innenfor banen
        racket.xpos = bane.bredde - racket.bredde;
    }
    racket.xpos += (racket.xfart*racket.xretning);  // Posisjonen til racket styres av retning*fart
}
let dash = false
document.onkeydown = function(evt) { // Flytter racket med piltaster
    let tastekode = evt.keyCode;
    if (tastekode === 37) { // V. piltast
        racket.xretning = -1; // Flytte racket til venstre
    }
    if(tastekode === 39) { // H. piltast
        racket.xretning = 1; // Flytte racket til høyre
    }
    if(tastekode === 16 && !dash) {
	racket.xpos += racket.xretning * 100
	dash = true
    }
}
document.onkeyup = function(evt) { // Stopper racket når man slipper pilstastene
    let tastekode = evt.keyCode;
    if(tastekode === 37 && racket.xretning === -1) {
        racket.xretning = 0;
    }
    if (tastekode === 39 && racket.xretning === 1) {
        racket.xretning = 0;
    }
    if (tastekode === 16) {
	dash = false
    }
}
function sjekkOmBallTrefferVegg() { // Kollisjonskode vegg
    if (ball.xpos <= ball.radius) { // Venstre vegg
        ball.xfart *= -1; // Ballen går til høyre når den har truffet venstre vegg
        ball.xpos += 5;
    }
    if ( ball.xpos + ball.radius >= bane.bredde) { // Høyre vegg vegg
        ball.xfart *= -1; // Ballen går til venstre når den har truffet høyre vegg
        ball.xpos -= 5;
    }
    if(ball.ypos <= ball.radius) { // Øvre vegg
        ball.gravitySpeed *= -0.5; // Ballen skal gå nedover etter å ha truffet øvre vegg
        ball.yfart = 0;
    }
}
function sjekkOmBallTrefferRacket() { // Kollisjonskode ball med racket
    let kollisjon = ball.ypos + ball.radius*2 > racket.ypos; // Sjekker om ballen er ovenfor racket (ypos)
    let innenforRacket = ball.xpos + ball.radius > racket.xpos && ball.xpos - 
        ball.radius< racket.xpos + racket.bredde; // Sjekker om ballen er innenfor xpos av racket 

    if (kollisjon && innenforRacket) { // Hvis begge krav er oppfylt
        ball.gravitySpeed = -2 * (ball.gravitySpeed * ball.bounce)-(Math.random()*1.75);
        ball.ypos = 465;
        // Endrer gravitasjonsfart til en tilfeldig verdi (som passer banen)
        if (ball.gravitySpeed > -5) {   // Kode som øker gravitasjonen hvis den blir for lav 
            ball.gravitySpeed += 5;     // (for å gjøre spillet mer rettferdig)
        }
        ball.xfart = (Math.random()-0.5)*20;    // Endrer ballens horisontale fart til en tilfeldig 
                                                // verdi som er valgt
        if (Math.random() < 0.025) {    // 2.5% sjanse for at ballen teleporterer          
            ball.ypos = 100;            // til toppen av skjermen hver gang den treffer
            ball.gravitySpeed = -12;    // racketen
            ball.xpos = Math.random()*bane.bredde;
        }
        poeng = poeng + 1; // Legger til et poeng for hver gang ball treffer racket
        hdnPoeng.innerHTML = 'Poeng: ' + poeng;
        if (poeng > localStorage.rekord) {
            localStorage.rekord = poeng; // Lagrer rekord lokalt i nettleser for highscore
            hdnRekord.innerHTML = 'Ny rekord: ' + poeng;
            hdnRekord.style.color = 'Red';
        }
    }
}
if(localStorage.rekord === undefined) { // Setter rekorden til 0 hvis den er udefinert
    localStorage.rekord = 0;            // (har ingen tidligere rekord)
}
hdnRekord.innerHTML = 'Rekord: ' + localStorage.rekord;
function sjekkOmBallErUtenforBanen() { // Stopper spillet hvis ballen forlater baneområdet
    if (ball.ypos > bane.hoyde + ball.radius*2) {
        theGameIsOn = false;
    }
}
/*
let gravmax = 0;
let gravmin = 0;
function debug() { // testeverktøy som viser gravitasjonsfart 
    let balldebug = document.getElementById('balldebug');
    balldebug.innerHTML = 'gravitySpeed ' + Math.floor(ball.gravitySpeed) + '<br>' +
    'gravmin ' + Math.floor(gravmin) + '<br>' +
    'gravmax ' + Math.floor(gravmax);
    if (ball.gravitySpeed > gravmax) {
        gravmax = ball.gravitySpeed;
    }
    if (ball.gravitySpeed < gravmin) {
        gravmin = ball.gravitySpeed;
    }
}
*/
function gameLoop() { // Funksjon som samler de andre funksjonene
    tegnBane();
    tegnBall();
    gravitasjon();
    tegnRacket();
    sjekkOmBallTrefferVegg();
    sjekkOmBallTrefferRacket();
    sjekkOmBallErUtenforBanen();
    //debug();
    if(theGameIsOn) { // Hvis spiller kjører
        requestAnimationFrame(gameLoop);
    }
    else { // Hvis spillet ikke kjører, kjør dette:
        ctx.fillStyle = bane.banefarge; // Tegner game over skjerm
        ctx.fillRect(0, 0, bane.bredde, bane.hoyde)
        ctx.font = "60px Arial"
        ctx.fillStyle = "black"
        ctx.fillText("Game over", (bane.bredde / 2) - 150  , bane.hoyde / 2 )
        window.onkeydown = function () {location.reload()}; // Laster inn siden på nytt
        window.onclick = function () {location.reload()}; // Laster inn siden på nytt
     }
}
//localStorage.clear(); // Nullstille rekorden
gameLoop(); // Funksjonskall for spillet
