const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d');

let W = canvas.width
let H = canvas.height, H1, W1
const originalW = 1920    // Largura base da resolução
const originalH = 1080     // Altura base da resolução
//balls (array of objects)  
let b = new Array()
let balas = new Array()
let resize = false
const aToB = Math.sqrt(H ** 2 + W ** 2) / 1
let sW = W/originalW                                //Valor do x e o y do método scale
const menuInicial = document.querySelector('#menu-inicial')
//destroir nave
let shipDestroy = false

//Points
let points = 0
//Vidas
let lives = 3

//As variáveis para as teclas
let rightKey = false; let leftKey = false; let upKey = false; let shot = false

window.onload = () => {
    menuInicial.children[0].style.fontSize= (W * 40)/originalW + "px"
    menuInicial.children[1].style.fontSize= (W * 17)/originalW + "px"
    init()  //setup the array of objects
    start() //menu inicial
}

let resizeType = 0  //se o valor for 1, então significa que foi redimensionada a landing page. Se o valor for igual a 2 significa que o jogo foi redimensionado
function debounce(func) {    // função debouncing inspirada do site https://flaviocopes.com/canvas/
    let timer;
    return function () {
        if(!resize){    // No primeiro instante em que o site sofreu redimensionamento
            H1 = H      // o programa vai guardar a altura da página antes de ser redimensionada
            W1 = W      // o programa vai guardar a largura da página antes de ser redimensionada
            resize = true   // significa que o 
        }
        H = window.innerHeight
        W = document.body.offsetWidth
        console.log(W,H);
        if (timer) { clearTimeout(timer) }    // if(timer) se timer tiver um valor, caso contrário não funciona
        timer = window.setTimeout(func, 600)
    };
};

window.addEventListener('resize', debounce((function () { 
    makeItResize() 
})))

let pause = 0, pauseTimeout
//evento para quando a tecla é precionada
window.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        if(pause !=2){
            pauseTimeout = window.setTimeout(()=>{
                render()
            },600)
        }
        pause = 2
    };
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
        this.sW = sW
        this.dX = this.sW * this.xd * 4
        this.dY = this.sW * this.yd * 4
    }

    draw() {
        ctx.translate(this.x, this.y);
        ctx.scale(this.sW,this.sW);
        ctx.fillStyle = this.c
        ctx.beginPath()
        ctx.arc(0, 0, this.R, 0, 2 * Math.PI)
        ctx.fill()
    }
    update() {
        this.y += this.dY
        this.x += this.dX

        if (this.R + this.x < 0 || this.R + this.x > W || this.R + this.y > H || this.R + this.y < 0) {
            this.destroyed = true
        }
    }
}

//Class Balls
class Ball {
    //constructor 
    constructor(x, y, r, d, v, c,sW) {
        this.x = x
        this.sW = sW
        this.d = d
        this.y = y
        //ALTERED: horizontal displacement
        this.dx = this.sW * Math.cos(this.d)
        //ALTERED:vertical displacement
        this.dy = this.sW * Math.sin(this.d)
        this.v = v
        
        

        //colisao
        this.collide = false

        this.color = c
        this.R = r
    }

    //Draw asteroids
    draw() {
        ctx.translate(this.x, this.y);
        ctx.scale(this.sW,this.sW)
        ctx.beginPath()
        ctx.arc(0, 0, this.R, 0, 2 * Math.PI)
        ctx.strokeStyle = this.color
        ctx.stroke()

        
    }

    //update
    update() {
        //update horizontal position
        this.x += this.dx
        //update vertical position
        this.y += this.dy 
    }

    leftCanvas() {
        if (this.y >= H + this.R) {    //Se o circulo ultrapassou a borda inferior
            this.y = -this.R
            this.x = this.R + Math.random() * (W - this.R)
        } else if (this.y <= 0 - this.R) {    //Se o circulo ultrapassou a borda superior
            this.y = H + this.R
            this.x = this.R + Math.random() * (W - this.R)
        } else if (this.x >= W + this.R) {    //Se o circulo ultrapassou a borda direita
            this.x = -this.R
            this.y = this.R + Math.random() * (W - this.R)
        } else if (this.x <= 0 - this.R) {    //Se o circulo ultrapassou a borda esquerda
            this.x = W + this.R
            this.y = this.R + Math.random() * (W - this.R)
        }
    }

}

//As variáveis vão contar a distância que o triângulo tem que mover em resultado da tecla precionada
let deltaX = W / 2; let deltaY = H / 2;
//gravidade da nave
let g = 0
let rightAngle = Math.PI * 60 / 180   // ângulo do ponto direito
let leftAngle = Math.PI * 120 / 180   // ângulo do ponto esquerdo
let upAngle = Math.PI * (-90) / 180   // ângulo do ponto de onde saiem as balas
let upPointX, upPointY
//função que desenha o triângulo
function drawTriangle() {
    upPointX = 31 * Math.cos(upAngle)  // Coordenada X do ponto de onde saiem as balas
    upPointY =  31 * Math.sin(upAngle)  // Coordenada Y do ponto de onde saiem as balas
    let leftPointX = 31 * Math.cos(leftAngle) // Coordenada X do ponto esquerdo
    let leftPointY = 31 * Math.sin(leftAngle) // Coordenada Y do ponto esquerdo
    let rightPointX =  31 * Math.cos(rightAngle) // Coordenada X do ponto direito
    let rightPointY =  31 * Math.sin(rightAngle) // Coordenada Y do ponto direito
    
    ctx.save()
    ctx.setTransform(sW, 0, 0, sW, deltaX, deltaY)
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.moveTo(upPointX, upPointY);   // ponta da nave
    ctx.lineTo(leftPointX, leftPointY)   // lado esquerdo
    ctx.lineTo(rightPointX, rightPointY)   // lado direito
    ctx.fill()
    ctx.restore()

    //círculo da nave, ex-hitbox
    /* ctx.beginPath()
    ctx.arc(deltaX, deltaY, 31*sW, 0, 2 * Math.PI)
    ctx.strokeStyle = 'green'
    ctx.stroke()  */
}

//function init asteroids
function init() {
    //setup the balls
    for (let i = 0; i < 3; i++) {
        let color = 'white'

        //Random size
        let radius = 40

        //random position
        let xInit = radius + Math.random() * (W - 2 * radius)
        let yInit = radius + Math.random() * (H - 2 * radius)

        //random direction
        let direction = Math.random() * 2 * Math.PI

        //random velocity
        let velocity = 1

        b.push(new Ball(xInit, yInit, radius, direction, velocity, color,sW))
    }
}
let timer1
function start(){
    timer1 = window.setInterval(()=>{
        if(menuInicial.children[0].style.visibility=="hidden"){
            menuInicial.children[0].style.visibility="visible" 
        } else{
           menuInicial.children[0].style.visibility="hidden" 
        }
        
    }, 500);
    beforeRender()
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

let playerPoints = {
    points : 0,
    text : `Pontos: ${points}`,
    font : `${20*W/originalW}px myFont`,
    fillStyle : 'White',
    xText: W*40/originalW,
    yText: H*60/originalH,
    //Função que mostra o número de pontos(Falta a parte que conta os pontos que o utilizador ganha)
    makePlayerPoints() {
        ctx.font = this.font
        ctx.fillStyle = this.fillStyle
        ctx.fillText(this.text, this.xText, this.yText)
    }    
}

let playerLives = {
    lives : 3,
    text : `Lives: ${lives}`,
    font : `${20*W/originalW}px myFont`,
    fillStyle : 'White',
    xText: W*40/originalW,
    yText: H*90/originalH,
    //Função que mostra o número de vidas que o jogador tem(Falta a parte de diminuir uma vida quando o jogador é atingido por asteroide ou nave inimiga)
    makePlayerLives() {
        ctx.font = this.font
        ctx.fillStyle = this.fillStyle
        ctx.fillText(this.text, this.xText, this.yText)
    } 
}


//verificar se ocorre colisao
function checkCollision(obj1) {
    let squareDistance = (obj1.x - deltaX) * (obj1.x - deltaX) + (obj1.y - deltaY) * (obj1.y - deltaY);
    if (squareDistance <= ((obj1.R*sW + 25*sW) * (obj1.R*sW + 25*sW))) {
        obj1.collide = true
    }
}

function makeItResize() {
    resize = false
    canvas.height = H
    canvas.width  = W
    
    //A nave do jogador
    deltaX = deltaX * W/ W1
    deltaY = deltaY * H/ H1
    sW = W/originalW

    //O nome do jogo
    menuInicial.style.width=W + "px"
    menuInicial.style.height=H + "px"
    menuInicial.children[1].style.fontSize= (W * 17)/originalW + "px"
    menuInicial.children[0].style.fontSize= (W * 40)/originalW + "px"

    //O texto que se encontra no canto superior esquerdo
    playerPoints.font = `${20*W/originalW}px myFont`
    playerLives.font = `${20*W/originalW}px myFont`
    playerLives.xText= W*40/originalW
    playerLives.yText= H*90/originalH
    playerPoints.xText=W*40/originalW,
    playerPoints.yText= H*60/originalH,

    //Os asteróides
    b.forEach(function (ball) {
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
        if(Math.PI <= ball.d && ball.d < 2*Math.PI ){
            angulo = 2*Math.PI - angulo 
        } 
        ball.sW = W/originalW
        ball.dx = ball.sW * Math.cos(angulo)
        ball.dy = ball.sW * Math.sin(angulo)
    })

    //As balas
    if(balas != []){
        balas.forEach(function (ball) {
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
            if(Math.PI <= ball.d && ball.d < 2*Math.PI ){
                angulo = 2*Math.PI - angulo 
            } 
            ball.sW = W/originalW
            ball.dx = 4*ball.sW * Math.cos(angulo)
            ball.dy = 4*ball.sW * Math.sin(angulo)
        })
    }
    if(resizeType == 1){
        resizeType = 0 
        window.requestAnimationFrame(beforeRender) 
    } else{
        resizeType = 0 
        window.requestAnimationFrame(render) 
    }
    
}

function beforeRender() {
    //fade Canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, W, H);
    
    //draw update
    b.forEach(function (ball) {
        ctx.save()
        ball.draw() 
        ctx.restore();
        ball.update()
        ball.leftCanvas()
    })
    if(pause != 2 && !resize){
        window.requestAnimationFrame(beforeRender) 
    }
    if(resize){
        resizeType = 1
    }
    if(pause == 2){
        ctx.clearRect(0,0,W,H)
        window.clearInterval(timer1);
        menuInicial.children[0].style.display="none"
    }
}
let upAngleChosen = 0 // direção em que a nave se desloca quando o utilizador pressiona na seta para a frente. Soltado o dedo da tecla upArrow, a nave vai se continuar a movimentar-se na mesma direção até perder o impulso, mesmo que esta seja rotacionada.
function render() {
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
        let xInit = upPointX*sW + deltaX       // coordenada x do ponto do triangulo escalado
        let yInit = upPointY*sW + deltaY       // coordenada y do ponto do triangulo escalado
        let radius = 2
        let yDirection = Math.sin(upAngle)
        let xDirection = Math.cos(upAngle)
        balas.push(new Bullet(xInit, yInit, radius, color, yDirection, xDirection))
        shot = false
    }
    if (upKey) {
        upAngleChosen = upAngle
        if(g<1.5){
           g+=0.1 
        }
    }else{
        if(g>0){
           g-=0.01 
        }
        
    }
    //for all objects in the object array
    b.forEach(obj1 => {
        //check if it collides with other object
        checkCollision(obj1);
    });
    //desenhar e atualizar as balas 
    for (let i = 0; i < balas.length; i++) {
        ctx.save()    
        balas[i].draw()
        ctx.restore()
        balas[i].update()
        if (balas[i].destroyed) {
            balas.splice(i, 1)
        }
    }
    if (!shipDestroy) {
        //atualiza o triangulo
        deltaY += g*2*sW*Math.sin(upAngleChosen)
        deltaX += g*2*sW*Math.cos(upAngleChosen)  
        if (deltaY >= H + 31*sW) {    //Se o circulo ultrapassou a borda inferior
            deltaY = -31*sW
            deltaX = 31*sW 
        } else if (deltaY <= 0 - 31*sW) {    //Se o circulo ultrapassou a borda superior
            deltaY = H + 31*sW
            deltaX = 31*sW 
        } else if (deltaX >= W + 31*sW) {    //Se o circulo ultrapassou a borda direita
            deltaX = -31*sW
        } else if (deltaX <= 0 - 31*sW) {    //Se o circulo ultrapassou a borda esquerda
            deltaX = W + 31*sW
        } 
        if(deltaY)
        drawTriangle()
    }
    enemy()
    playerPoints.makePlayerPoints()
    playerLives.makePlayerLives()

    //draw update
    b.forEach(function (ball) {
        ctx.save()
        ball.draw() 
        ctx.restore();
        ball.update()
        ball.leftCanvas()
        if (ball.collide) {
            shipDestroy = true
        }
        //Para ver o hitbox do asteroide com escala
        /* ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.R*sW, 0, 2 * Math.PI)
        ctx.strokeStyle = 'red'
        ctx.stroke() */
    })
    if (!resize) {
        window.requestAnimationFrame(render) 
    }else{
        resizeType = 2
    }
}