const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d');

const W = canvas.width
const H = canvas.height
//balls (array of objects)
let b = new Array()
let balas = new Array()


//As variáveis vão contar a distância que o triângulo tem que mover em resultado da tecla precionada
let deltaX = W/2; let deltaY = H/2;
//As variáveis para as teclas
let rightKey = false; let leftKey = false; let upKey = false; let shot = false

window.onload = () => {
    init()  //setup the array of objects
    render() //start the animation
}

const debounce = function (func) {    // função debouncing inspirada do site https://flaviocopes.com/canvas/
    let timer;
    return function () {
        if (timer) { clearTimeout(timer) }    // if(timer) se timer tiver um valor, caso contrário não funciona
        timer = setTimeout(func, 100)
    };
};


window.addEventListener('resize', debounce((function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})))

//evento para quando a tecla é precionada
window.addEventListener('keydown', e => {
    if(e.key == 'ArrowRight'){
        rightKey = true;
    };
    if(e.key == 'ArrowLeft'){
        leftKey = true;
    }
    if(e.key == 'ArrowUp'){
        upKey = true;
    }

    if(e.key == " "){
        if(!e.repeat){ 
            shot = true
        }
    }  

    e.preventDefault();

});

//evento para quando a tecla é libertada
window.addEventListener('keyup', e => {
    if(e.key == 'ArrowRight') rightKey = false;
    if(e.key == 'ArrowLeft') leftKey = false;
    if(e.key == 'ArrowUp') upKey = false;
    if(e.key == " "){
        shot = false
    } 

})


class Bullet{
    constructor(x,y,r,c,yd,xd) {
        this.xd = xd
        this.yd = yd
        this.x = x 
        this.y = y 
        this.R = r
        this.c = c
    }

    draw(){
        ctx.fillStyle = this.c
        ctx.beginPath()
        ctx.arc(this.x, this.y,this.R,0,2*Math.PI)
        ctx.fill()
    }
    update() {
        this.y += this.yd * 2
        this.x += this.xd * 2

        /* if(this.y <= 0){
            balas.shift()
        } */
    }
}

//Class Balls
class Ball {
    //constructor 
    constructor(x, y, r, d, v, c) {
        this.x = x
        this.y = y
        //ALTERED: horizontal displacement
        this.dx = v * Math.cos(d)
        //ALTERED:vertical displacement
        this.dy = v * Math.sin(d)
        this.v = v

        this.color = c
        this.R = r
        this.draw()
        this.update()
    }

    //Draw asteroids
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.R, 0, 2 * Math.PI)
        ctx.strokeStyle = this.color
        ctx.stroke()
    }

    //update
    update() {
        //check Canvas vertical collisions
        if (this.x >= W - this.R) {
            this.x += this.dx
        }

        //check Canvas horizontal collisions
        if (this.y >= H - this.R) {
            this.y += this.dy
        }

        //update horizontal position
        this.x += this.dx
        //update vertical position
        this.y += this.dy
    }

    leftCanvas() {
        if (this.y >= H) {
            this.color = 'white'
            this.y = -25
            this.x = 20 + Math.random() * (W - 2 * 20)
            // this.v = 0.75 + Math.random() * 5
        } else if (this.x >= W) {
            this.color = 'white'
            this.x = -25
            this.y = 20 + Math.random() * (W - 2 * 20)
            // this.v = 0.75 + Math.random() * 5
        }

    }
}

let rightAngle = Math.PI * 60 / 180   // ângulo do ponto direito
let leftAngle = Math.PI * 120 / 180   // ângulo do ponto esquerdo
let upAngle = Math.PI * (-90) / 180   // ângulo do ponto de onde saiem as balas
let upPointX, upPointY

//função que desenha o triângulo
function drawTriangle(){
    upPointX = deltaX + 35 * Math.cos(upAngle)  // Coordenada X do ponto de onde saiem as balas
    upPointY = deltaY + 35 * Math.sin(upAngle)  // Coordenada Y do ponto de onde saiem as balas
    let leftPointX = deltaX + 35 * Math.cos(leftAngle) // Coordenada X do ponto esquerdo
    let leftPointY = deltaY + 35* Math.sin(leftAngle) // Coordenada Y do ponto esquerdo
    let rightPointX = deltaX + 35 * Math.cos(rightAngle) // Coordenada X do ponto direito
    let rightPointY = deltaY + 35* Math.sin(rightAngle) // Coordenada Y do ponto direito
    
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.moveTo(upPointX,upPointY);   // ponta da nave
    ctx.lineTo(leftPointX, leftPointY)   // lado esquerdo
    ctx.lineTo(rightPointX, rightPointY)   // lado direito
    ctx.fill()
    
}

//function init asteroids
function init() {
    //setup the balls
    for (let i = 0; i < 20; i++) {
        let color = 'white'

        //Random size
        let radius = 10 + Math.random() * 20

        //random position
        let xInit = radius + Math.random() * (W - 2 * radius)
        let yInit = radius + Math.random() * (H - 2 * radius)

        //random direction
        let direction = Math.random() * 2 * Math.PI

        //random velocity
        let velocity = 1

        b.push(new Ball(xInit, yInit, radius, direction, velocity, color))
    }
}

//Função que desenha a nave inimiga no canvas
function enemy(){
    //imagem
    let img = new Image()
    img.src = './enemy1.png'
    //coordenadas iniciais(para já está estas coordendas até conseguir fazer o seu movimento)
    let imgX = 300
    let imgY = 200
    //desenha a imagem no canvas
    ctx.drawImage(img, imgX, imgY, img.width/2.6, img.height/2.6)
}

//Função que mostra o número de pontos(Falta a parte que conta os pontos que o utilizador ganha)
function playerPoints(){
    var text = 'Pontos:'
    let points = 0
    ctx.font = '20px Verdana'
    ctx.fillStyle = 'White'
    ctx.fillText(text, 50, 70)
    ctx.fillText(points, 140, 72) 
}

//function render
function render() {
    //fade Canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, W, H);
    if(rightKey){
         rightAngle +=0.05
         leftAngle +=0.05
         upAngle +=0.05
    };
    if(leftKey){
        leftAngle -=0.05
        rightAngle -=0.05
        upAngle -=0.05
    }
    if(shot){
        let color = `white`;
        let xInit = upPointX
        let yInit = upPointY
        let radius = 2
        let yDirection = Math.sin(upAngle)
        let xDirection = Math.cos(upAngle)
        balas.push(new Bullet(xInit, yInit, radius, color, yDirection, xDirection)) 
        shot = false
    }
    if(upKey){
        deltaY += Math.sin(upAngle)
        deltaX += Math.cos(upAngle)
    }
    //draw update
    b.forEach(function (ball) {
        ball.draw()
        ball.update()
        ball.leftCanvas()
    })
    balas.forEach(bullet =>{
        bullet.draw();
        bullet.update();
        
    })
    drawTriangle()
    enemy()
    playerPoints()
    window.requestAnimationFrame(render)
}
