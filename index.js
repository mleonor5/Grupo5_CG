const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d');

let W = canvas.width
let H = canvas.height, H1, W1
//balls (array of objects)
let b = new Array()
let balas = new Array()
let resize = false
const aToB = Math.sqrt(H ** 2 + W ** 2) / 1

//destroir nave
let shipDestroy = false

//Points
let points = 0
//Vidas
let lives = 3

//As variáveis vão contar a distância que o triângulo tem que mover em resultado da tecla precionada
let deltaX = W / 2; let deltaY = H / 2;
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
    resize = true
})))

//evento para quando a tecla é precionada
window.addEventListener('keydown', e => {
    if (e.key == 'ArrowRight') {
        rightKey = true;
    };
    if (e.key == 'ArrowLeft') {
        leftKey = true;
    }
    if (e.key == 'ArrowUp') {
        upKey = true;
    }

    if (e.key == " ") {
        if (!e.repeat) {
            shot = true
        }
    }

});

//evento para quando a tecla é libertada
window.addEventListener('keyup', e => {
    if (e.key == 'ArrowRight') rightKey = false;
    if (e.key == 'ArrowLeft') leftKey = false;
    if (e.key == 'ArrowUp') upKey = false;
    if (e.key == " ") {
        shot = false
    }

})


class Bullet {
    constructor(x, y, r, c, yd, xd) {
        this.xd = xd
        this.yd = yd
        this.x = x
        this.y = y
        this.R = r
        this.c = c
    }

    draw() {
        ctx.fillStyle = this.c
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.R, 0, 2 * Math.PI)
        ctx.fill()
    }
    update() {
        this.y += this.yd * 2
        this.x += this.xd * 2

        if (this.R + this.x < 0 || this.R + this.x > W || this.R + this.y > H || this.R + this.y < 0) {
            this.destroyed = true
        }
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

        //colisao
        this.collide = false

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
        if (this.y >= H + this.R) {    //Se o circulo ultrapassou a borda inferior
            this.y = -this.R
            this.x = 20 + Math.random() * (W - 2 * 20)
        } else if (this.y <= 0 - this.R) {    //Se o circulo ultrapassou a borda superior
            this.y = H + this.R
            this.x = 20 + Math.random() * (W - 2 * 20)
        } else if (this.x >= W + this.R) {    //Se o circulo ultrapassou a borda direita
            this.x = -this.R
            this.y = 20 + Math.random() * (W - 2 * 20)
        } else if (this.x <= 0 - this.R) {    //Se o circulo ultrapassou a borda esquerda
            this.x = W + this.R
            this.y = 20 + Math.random() * (W - 2 * 20)
        }
    }

}

let rightAngle = Math.PI * 60 / 180   // ângulo do ponto direito
let leftAngle = Math.PI * 120 / 180   // ângulo do ponto esquerdo
let upAngle = Math.PI * (-90) / 180   // ângulo do ponto de onde saiem as balas
let upPointX, upPointY

//função que desenha o triângulo
function drawTriangle() {
    upPointX = deltaX + 31 * Math.cos(upAngle)  // Coordenada X do ponto de onde saiem as balas
    upPointY = deltaY + 31 * Math.sin(upAngle)  // Coordenada Y do ponto de onde saiem as balas
    let leftPointX = deltaX + 31 * Math.cos(leftAngle) // Coordenada X do ponto esquerdo
    let leftPointY = deltaY + 31 * Math.sin(leftAngle) // Coordenada Y do ponto esquerdo
    let rightPointX = deltaX + 31 * Math.cos(rightAngle) // Coordenada X do ponto direito
    let rightPointY = deltaY + 31 * Math.sin(rightAngle) // Coordenada Y do ponto direito

    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.moveTo(upPointX, upPointY);   // ponta da nave
    ctx.lineTo(leftPointX, leftPointY)   // lado esquerdo
    ctx.lineTo(rightPointX, rightPointY)   // lado direito
    ctx.fill()

    /* //círculo da nave
    ctx.beginPath()
    ctx.arc(deltaX, deltaY, 20, 0, 2 * Math.PI)
    ctx.strokeStyle = 'green'
    ctx.stroke() */
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
function enemy() {
    //imagem
    let img = new Image()
    img.src = './enemy1.png'
    //coordenadas iniciais(para já está estas coordendas até conseguir fazer o seu movimento)
    let imgX = 300
    let imgY = 200
    //desenha a imagem no canvas
    ctx.drawImage(img, imgX, imgY, img.width / 2.6, img.height / 2.6)
}

//Função que mostra o número de pontos(Falta a parte que conta os pontos que o utilizador ganha)
function playerPoints() {
    var text = 'Pontos:'
    let points = 0
    ctx.font = '20px myFont'
    ctx.fillStyle = 'White'
    ctx.fillText(text, 50, 70)
    ctx.fillText(points, 140, 72)
}

//Função que mostra o número de vidas que o jogador tem(Falta a parte de diminuir uma vida quando o jogador é atingido por asteroide ou nave inimiga)
function playerLives() {
    var text = 'Lives:'
    let lives = 3
    ctx.font = '20px myFont'
    ctx.fillStyle = 'White'
    ctx.fillText(text, 50, 100)
    ctx.fillText(lives, 140, 102)
}

//verificar se ocorre colisao
function checkCollision(obj1) {
    let squareDistance = (obj1.x - deltaX) * (obj1.x - deltaX) + (obj1.y - deltaY) * (obj1.y - deltaY);
    if (squareDistance <= ((obj1.R + 20) * (obj1.R + 20))) {
        obj1.collide = true
    }
}

//function render
function render() {
    if (resize) {
        H1 = H
        W1 = W
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        H = window.innerHeight;
        W = window.innerWidth;
        b.forEach(function (ball) {
            //GRAÇAS AOS TESTES 1 E 2
            let xB = ((ball.x + ball.dx) * W) / W1
            let xA = ball.x = (ball.x * W) / W1
            let yB = ((ball.y + ball.dy) * H) / H1
            let yA = ball.y = (ball.y * H) / H1
            let xVetorAB = xB - xA
            let yVetorAB = yB - yA
            let xVetorAC = W - xA
            let denominador = xVetorAB * xVetorAC
            let normaAB = Math.sqrt(xVetorAB ** 2 + yVetorAB ** 2)
            let normaAC = Math.sqrt(xVetorAC ** 2)
            let numerador = Math.abs(normaAB * normaAC)
            let cos = denominador / numerador
            let angulo = Math.acos(cos)
            //GRAÇAS AO TESTE 3
            ball.d < 0 ? angulo = -angulo : ""
            ball.dx = ball.v * Math.cos(angulo)
            ball.dy = ball.v * Math.sin(angulo)

        })

        resize = false
    } else {
        //fade Canvas
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, W, H);
        if (rightKey) {
            rightAngle += 0.05
            leftAngle += 0.05
            upAngle += 0.05
        };
        if (leftKey) {
            leftAngle -= 0.05
            rightAngle -= 0.05
            upAngle -= 0.05
        }
        if (shot) {
            let color = `white`;
            let xInit = upPointX
            let yInit = upPointY
            let radius = 2
            let yDirection = Math.sin(upAngle)
            let xDirection = Math.cos(upAngle)
            balas.push(new Bullet(xInit, yInit, radius, color, yDirection, xDirection))
            shot = false
        }
        if (upKey) {
            deltaY += Math.sin(upAngle)
            deltaX += Math.cos(upAngle)
        }
        //for all objects in the object array
        b.forEach(obj1 => {
            //check if it collides with other object
            checkCollision(obj1);
        });

        //draw update
        b.forEach(function (ball) {
            ball.draw()
            ball.update()
            ball.leftCanvas()
            if (ball.collide) {
                shipDestroy = true
            }
        })

        //desenhar e atualizar as balas 
        for (let i = 0; i < balas.length; i++) {
            balas[i].draw()
            balas[i].update()
            if (balas[i].destroyed) {
                balas.splice(i, 1)
            }
        }

        if (!shipDestroy) {
            drawTriangle()
        }
        enemy()
        playerPoints()
        playerLives()
    }
    window.requestAnimationFrame(render)
}