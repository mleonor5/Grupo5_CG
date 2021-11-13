const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d');

const W = canvas.width
const H = canvas.height
//balls (array of objects)
let b = new Array()

//As variáveis vão contar a distância que o triângulo tem que mover em resultado da tecla precionada
let deltaX = 0; let deltaY = 0;
//As variáveis para as teclas
let rightKey = false; let leftKey = false; let upKey = false


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
        deltaX += 2;
    };
    if(e.key == 'ArrowLeft'){
        leftKey = true;
        deltaX -= 2;
    }
    if(e.key == 'ArrowUp'){
        upKey = true;
        deltaY -= 2;
    }

    e.preventDefault();

    drawTriangle()
});

//evento para quando a tecla é libertada
window.addEventListener('keyup', e => {
    if(e.key == 'ArrowRight') rightKey = false;
    if(e.key == 'ArrowLeft') leftKey = false;
    if(e.key == 'ArrowUp') upKey = false;
})

window.onload = () => {
    init()  //setup the array of objects
    render() //start the animation
}

//função que desenha o triângulo
function drawTriangle(){
    //triângulo
    ctx.beginPath();
    ctx.moveTo(200 + deltaX, 100 + deltaY);
    ctx.lineTo(180 + deltaX, 160 + deltaY);
    ctx.lineTo(220 + deltaX, 160 + deltaY);
    ctx.closePath();

    //fill color
    ctx.fillStyle = '#fff';
    ctx.fill();
}

drawTriangle()

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

//function render
function render() {
    //fade Canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, W, H);

    //draw update
    b.forEach(function (ball) {
        ball.draw()
        ball.update()
        ball.leftCanvas()
    })

    drawTriangle()
    window.requestAnimationFrame(render)
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