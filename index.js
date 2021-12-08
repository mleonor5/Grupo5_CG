const menuGameOver = document.querySelector('#game-over')
const menuInicial = document.querySelector('#menu-inicial')
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d');

let W = canvas.width            //Largura atual da resolução
let H = canvas.height           //Altura atual da resolução
let H1, W1
const originalW = 1920    // Largura base da resolução
const originalH = 1080     // Altura base da resolução

//Audio para quando se dispara as balas  // Alguns sons tirados do site: http://www.classicgaming.cc/classics/asteroids/sounds
const fireSound = new Audio()
fireSound.src = './media/fire.wav'
//Audio para quando os asteroides granfes explodem
const largeAstSound = new Audio()
largeAstSound.src = './media/bangLarge.wav'
//Audio para quando os asteroides médios explodem
const mediumAstSound = new Audio()
mediumAstSound.src = './media/bangMedium.wav'
//Audio para quando os asteroides pequenos explodem
const smallAstSound = new Audio()
smallAstSound.src = './media/bangSmall.wav'
//Audio para quando a nave anda para a frente
/* const thrustSound = new Audio()
thrustSound.src = './media/thrust.wav' */

//animation sprite do fogo
const FIRE = new Image()
FIRE.src = "./media/imagens/fogo1.png"

let b = new Array()    //asteroides  
let balas = new Array()
let resize = false
const aToB = Math.sqrt(H ** 2 + W ** 2) / 1
let sW = W / originalW                                //Valor do x e o y do método scale
//destroir nave
let shipDestroy = false
let asterNum = 3 //Número inicial de asteroides
let velocity = 1 //Velocidade inicial
let level = 0
let lives = 3 //Vidas
let gameOver = 0 // Verificar se é game over ou não
//As variáveis para as teclas
let rightKey = false; let leftKey = false; let upKey = false; let shot = false

window.onload = () => {
    /* menuInicial.children[0].style.fontSize= (W * 40)/originalW + "px"
    menuInicial.children[1].style.fontSize= (W * 17)/originalW + "px" */
    init()  //setup the array of objects
    enemy() //nave inimiga
    start() //mostrar a landing page
}

let resizeType = 0  //se o valor for 1, então significa que foi redimensionada a landing page. Se o valor for igual a 2 significa que o jogo foi redimensionado
const debounce = function (func) {    // função debouncing inspirada do site https://flaviocopes.com/canvas/
    let timer;
    return function () {
        if (!resize) {    // No primeiro instante em que o site sofreu redimensionamento
            H1 = H      // o programa vai guardar a altura da página antes de ser redimensionada
            W1 = W      // o programa vai guardar a largura da página antes de ser redimensionada
            resize = true
        }
        H = window.innerHeight                // atualiza o valor da altura
        W = document.body.offsetWidth         // atualiza o valor da largura
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
        if (!pause) {   // Se foi pressionado o enter pela primeira vez
            level++
            init()
            pauseTimeout = window.setTimeout(() => {   // cabe à pauseTimout começar o jogo 
                render()
            }, 600)
        }
        pause = 1 //pause vai ser sempre igual a 1 para evitar que pauseTimeout seja chamada mais do que uma vez sempre que for pressionado o enter
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

    if (e.key == " " && shipDestroy == false) {
        if (!e.repeat) {
            shot = true
            //Sempre que houver um disparo o audio vai ocorrer 
            fireSound.cloneNode().play()   // .cloneNode() para poder tocar várias vezes ao mesmo tempo
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
        ctx.scale(this.sW, this.sW);
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

//Class Asteroids
class Ball {
    //constructor 
    constructor(x, y, r, d, v, c, sW) {
        this.x = x
        this.sW = sW
        this.d = d
        this.y = y
        this.v = v
        //ALTERED: horizontal displacement
        this.dx = this.v * Math.cos(this.d) 
        //ALTERED:vertical displacement
        this.dy = this.v * Math.sin(this.d) 
        
        this.color = c
        this.R = r
    }

    //Draw asteroids
    draw() {
        ctx.translate(this.x, this.y);
        ctx.scale(this.sW, this.sW)
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
            this.y = this.R + Math.random() * (H - this.R)
        } else if (this.x <= 0 - this.R) {    //Se o circulo ultrapassou a borda esquerda
            this.x = W + this.R
            this.y = this.R + Math.random() * (H - this.R)
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
let upPointX, upPointY, leftPointX,leftPointY,rightPointX,rightPointY
//função que desenha o triângulo
function drawTriangle() {
    upPointX = 31 * Math.cos(upAngle)  // Coordenada X do ponto de onde saiem as balas
    upPointY = 31 * Math.sin(upAngle)  // Coordenada Y do ponto de onde saiem as balas
    leftPointX = 31 * Math.cos(leftAngle) // Coordenada X do ponto esquerdo
    leftPointY = 31 * Math.sin(leftAngle) // Coordenada Y do ponto esquerdo
    rightPointX = 31 * Math.cos(rightAngle) // Coordenada X do ponto direito
    rightPointY = 31 * Math.sin(rightAngle) // Coordenada Y do ponto direito

    ctx.save()
    ctx.setTransform(sW, 0, 0, sW, deltaX, deltaY)
    ctx.fillStyle = "white"
    ctx.beginPath();
    ctx.moveTo(upPointX, upPointY);   // ponta da nave
    ctx.lineTo(leftPointX, leftPointY)   // ponto esquerdo
    ctx.lineTo(rightPointX, rightPointY)   // ponto direito
    ctx.fill()
    ctx.restore()

    //hitbox
    /* ctx.beginPath()
    ctx.arc(deltaX, deltaY, 25*sW, 0, 2 * Math.PI)
    ctx.strokeStyle = 'green'
    ctx.stroke()  */
}

//função que cria os asteroides
function init() {
    b = [] // elimina todos os asteróides. É importante porque quando começamos o jogo, os três asteróides iniciais tem que ser eliminados para aparecem os novos asteróides

    if (level == 0) {   // na landing page só vão estar presentes três asteróides
        asterNum = 3
        velocity = 1
    } else { // no level x, o numero de asteroides é 5 + (x-1)
        asterNum = 5 + (level - 1)
        velocity = velocity * 5 //aumenta a velocidade quando passa para o level seguinte
    }

    //criar os asteroides
    for (let i = 0; i < asterNum; i++) {
        let color = 'white'

        //Random size
        let radius = level == 0 ? 50 * sW : (10 + Math.random() * 40) * sW   // se level = 0, ou seja, se o  utilizador ainda encontra-se na landing page, o tamanho do asteróide será o máximo, caso contrário será um tamanho aleatorio entre 10 e 30

        let oneToFour = Math.floor(1+Math.random() * 4) // retorna valor aleatório entre 1 e 4
        let xInit, yInit

        //random position
        if (oneToFour === 1) {
            //O asteroide é desenhado encostado ao limite inferior
            xInit = radius + Math.random() * (W - 2 * radius)
            yInit = H + radius
        } else if (oneToFour === 2) {
            //O asteroide é desenhado encostado ao limite superior
            xInit = radius + Math.random() * (H - 2 * radius)
            yInit = 0 - radius
        } else if (oneToFour === 3) {
            //O asteroide é desenhado encostado ao limite lateral da direita
            yInit = radius + Math.random() * (W - 2 * radius)
            xInit = W + radius
        } else if (oneToFour === 4) {
            //O asteroide é desenhado encostado ao limite lateral da esquerda
            yInit = radius + Math.random() * (W - 2 * radius)
            xInit = 0 - radius
        }

        //random direction
        let direction = Math.random() * 2 * Math.PI
        //velocity
        let velocity
        if (radius >= 10*sW && radius < 20*sW) {
            velocity = 1*sW + (level/10)      // (level/10) a velocidade aumenta quado o nível aumenta  
        } else if (radius >= 20*sW && radius < 35*sW) {
            velocity = 0.8*sW + (level/10)
        } else{
            velocity = 0.5*sW + (level/10)
            if(!level){
                velocity = sW
            }
            
        }
        

        b.push(new Ball(xInit, yInit, radius, direction, velocity, color, sW))
    }
    if (gameOver == 1) {   //Se o utilizador perdeu e clicou em "PLAY AGAIN"
        gameOver = 0
        ctx.clearRect(0,0,W,H) // Para garantir que o canvas é apagado completamente antes de começarmos um novo jogo
        window.requestAnimationFrame(render)
    }
}
let timer1
function start() {
    timer1 = window.setInterval(() => {
        if (menuInicial.children[0].style.visibility == "hidden") {
            menuInicial.children[0].style.visibility = "visible"
        } else {
            menuInicial.children[0].style.visibility = "hidden"
        }

    }, 500);
    beforeRender()
}

//NAVE INIMIGA
//DIREÇÃO RANDOM
let d = Math.random()
//VELOCIDADE
let v = 2
//DESLOCAMENTO EM X
let imgdX = v * Math.sin(d)
//DESLOCAMENTO EM Y
let imgdY = v * Math.cos(d)
//IMAGEM
let img = new Image()
img.src = './media/imagens/nave inimiga.svg'
//COORDENADAS INICIAIS
let imgX = (img.width / 2.6) + (Math.random() * (W - img.width / 2.6))
let imgY = (img.height / 2.6) + (Math.random() * (H - img.height / 2.6))
//Função que desenha a nave inimiga no canvas
function enemy() {
    //CHECK CANVAS VERTICAL COLLISIONS
    if (imgX < img.width / 50 || imgX > W - img.width / 2.6) {
        imgdX = -imgdX
    }
    //CHECK CANVAS HORIZONTAL COLLISIONS
    if (imgY < img.height / 50 || imgY > H - img.height / 2.6) {
        imgdY = -imgdY
    }
    imgX += imgdX
    imgY += imgdY
    //desenha a imagem no canvas
    ctx.drawImage(img, imgX, imgY, img.width / 2.6, img.height / 2.6)
}

let playerPoints = {
    points: 0,
    text: `Points: 0`,
    font: `${20 * W / originalW}px myFont`,
    fillStyle: 'White',
    xText: W * 40 / originalW,
    yText: H * 60 / originalH,
    //Função que mostra o número de pontos
    makePlayerPoints(R) {
        ctx.font = this.font
        ctx.fillStyle = this.fillStyle
        ctx.fillText(this.text, this.xText, this.yText)
    }
}

let playerLives = {
    lives: 3,
    text: `Lives: ${lives}`,
    font: `${20 * W / originalW}px myFont`,
    fillStyle: 'White',
    xText: W * 40 / originalW,
    yText: H * 90 / originalH,
    //Função que mostra o número de vidas que o jogador tem(Falta a parte de diminuir uma vida quando o jogador é atingido por asteroide ou nave inimiga)
    makePlayerLives() {
        this.text = `Lives: ${this.lives}`
        ctx.font = this.font
        ctx.fillStyle = this.fillStyle
        ctx.fillText(this.text, this.xText, this.yText)
    }
}


//verificar se ocorre colisao
function checkCollision(asteroid) {
    let squareDistance = (asteroid.x - deltaX) * (asteroid.x - deltaX) + (asteroid.y - deltaY) * (asteroid.y - deltaY);
    if (squareDistance <= ((asteroid.R * sW + 25 * sW) * (asteroid.R * sW + 25 * sW))) {    
        if (!shipDestroy){    //Se a nave colidiu pela primeira vez
            deltas = [[deltaX,deltaY],[deltaX,deltaY],[deltaX,deltaY]]
            mediumAstSound.play()
        }
        shipDestroy = true
        
        if(playerLives.lives == 0){  // Se a nave esgotou as vidas
            balas = []                // As balas sao eliminadas
            gameOver = 1
            shipDestroy = false
            times = 0
            rightAngle = Math.PI * 60 / 180   // ângulo do ponto direito
            leftAngle = Math.PI * 120 / 180   // ângulo do ponto esquerdo
            upAngle = Math.PI * (-90) / 180   // ângulo do ponto de onde saiem as balas

            // a nave volta para o meio da página
            deltaX = W / 2                    
            deltaY = H /2

            playerLives.lives--  //a nave perde uma vida
            g = 0                //A nave perde impulso 
            uA = 0
        }
    }
}

function makeItResize() {
    resize = false
    canvas.height = H
    canvas.width = W

    //A nave do jogador
    deltaX = deltaX * W / W1
    deltaY = deltaY * H / H1
    deltas = [[deltaX,deltaY],[deltaX,deltaY],[deltaX,deltaY]]
    //atualizar a razão
    sW = W / originalW

    /* //O nome do jogo
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
    playerPoints.yText= H*60/originalH, */

    //Os asteróides
    b.forEach(function (ball) {
        //Sabemos que, quando a página é redimensionada, as coordenadas da posição e a direção/ o angulo mudam.
        //ponto A representa a nova posição da bola 
        //ponto B representa a posição seguinte da bola
        //No ponto C, o x é o valor da largura da página e o y é igual ao y do ponto A 
        let xB = ((ball.x + ball.dx) * W) / W1       //x do ponto B
        let xA = ball.x = (ball.x * W) / W1          //x do ponto A
        let yB = ((ball.y + ball.dy) * H) / H1       //y do ponto B
        let yA = ball.y = (ball.y * H) / H1          //y do ponto A
        // xC = W
        // yC = yA
        // sabemos que podemos determinar o novo ângulo do elemento através da expressão cos(angulo) = denominador/numerador 
        // denominador = x do vetor AB * x do vetor AC + y do vetor AB * y do vetor AC
        //y do vetor AC = yC - yA = yA - yA = 0
        //y do vetor AB * y do vetor AC = y do vetor AB * 0 = 0
        //Logo, denominador = x do vetor AB * x do vetor AC
        //numerador = sqrt(norma do vetor AB) * sqrt(norma do vetor AC)
        let xVetorAB = xB - xA
        let yVetorAB = yB - yA
        let xVetorAC = W - xA
        let denominador = xVetorAB * xVetorAC
        let normaAB = Math.sqrt(xVetorAB ** 2 + yVetorAB ** 2)
        let normaAC = Math.sqrt(xVetorAC ** 2)
        let numerador = Math.abs(normaAB * normaAC)
        let cos = denominador / numerador
        let angulo = Math.acos(cos)                     // o novo angulo é igual ao acosseno (=cos-1) do resultado da expressão
        if (Math.PI <= ball.d && ball.d < 2 * Math.PI) {
            angulo = 2 * Math.PI - angulo
        }
        // reajustar a velocidade do asteroide
        //Na função init(), definimos a velocidade = (valor hardcode)*sW + (level/10), o problema é que sW apresenta um valor desatualizado, entao temos que o atualizar
        ball.v -= (level/10)
        ball.v /= ball.sW
        ball.sW = W / originalW                          // para reajustar a escala dos elementos
        ball.v = ball.v * ball.sW + (level/10)

        ball.dx = ball.v * Math.cos(angulo)
        ball.dy = ball.v * Math.sin(angulo)
    })

    //As balas
    if (balas != []) {
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
            if (Math.PI <= ball.d && ball.d < 2 * Math.PI) {
                angulo = 2 * Math.PI - angulo
            }
            ball.sW = W / originalW
            ball.dx = 4 * ball.sW * Math.cos(angulo)
            ball.dy = 4 * ball.sW * Math.sin(angulo)
        })
    }
    if (resizeType == 1) {
        resizeType = 0
        window.requestAnimationFrame(beforeRender)  // = beforeRender()
    } else {
        resizeType = 0
        window.requestAnimationFrame(render)   // = render()
    }

}

//colisao entre bala e os asteroides
function Collision(bx, by, rb, ax, ay, ar) {
    let rSum; //Soma dos raios
    let diffx; //Diferença (distância) entre o x da bala e o x do asteroide
    let diffy; //Diferença (distância) entre o y da bala e o y do asteroide

    rSum = rb + ar;
    diffx = bx - ax;
    diffy = by - ay;

    if (rSum > Math.sqrt((diffx * diffx) + (diffy * diffy))) {
        return true;
    } else {
        return false;
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
    enemy()
    if (pause != 1 && !resize) {
        window.requestAnimationFrame(beforeRender)
    }
    if (resize) {
        resizeType = 1
    }
    if (pause) {
        ctx.clearRect(0, 0, W, H)
        window.clearInterval(timer1);
        menuInicial.children[0].style.display = "none"
    }
}
let upAngleChosen = 0 // direção em que a nave se desloca quando o utilizador pressiona na seta para a frente. Soltado o dedo da tecla upArrow, a nave vai se continuar a movimentar-se na mesma direção até perder o impulso, mesmo que esta seja rotacionada.
let lA, uA, rA // ângulos do triângulo desfragmentado cujos valores são iguais aos valores de leftAngle, upAngle e rightAngle
let deltas = [[deltaX,deltaY],[deltaX,deltaY],[deltaX,deltaY]]  //lista que contem o deltaX e o deltaY de cada lado do triângulo desfragmentado
let times = 0 // conta quantas vezes os lados do triangulo desfragmentado se moveram.
let frameIndex = 0, frameTimes = 0
function render() {
    //fade Canvas
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, W, H);
    if (rightKey) {
        rightAngle += 0.05 *sW
        leftAngle += 0.05 *sW
        upAngle += 0.05*sW
    };
    if (leftKey) {
        leftAngle -= 0.05*sW
        rightAngle -= 0.05*sW
        upAngle -= 0.05*sW
    }
    if (shot) {
        let color = `white`;
        let xInit = upPointX * sW + deltaX       // coordenada x do ponto do triangulo transformado à escala
        let yInit = upPointY * sW + deltaY       // coordenada y do ponto do triangulo transformado à escala
        let radius = 2
        let yDirection = Math.sin(upAngle)
        let xDirection = Math.cos(upAngle)
        balas.push(new Bullet(xInit, yInit, radius, color, yDirection, xDirection))
        shot = false
    }
    if (upKey) {
        ctx.save()

        //ANIMATION SPRITE: FOGO
        if(!shipDestroy){
            //Preciso encontrar o ponto médio (midPoint) entre leftPoint e rightPoint, ou seja, o ponto esquerdo e ponto direito da nave para podermos colocar o fogo nas costas da nave
            midPointX = ((leftPointX*sW+deltaX)+(rightPointX*sW+deltaX))/2    // Todas as variáveis são multiplicadas por sW, por causa da transformação à escala que é feita na função drawTriangle() e por fim somadas com o delta (deltaY se for a coordenada y de um ponto, deltaX se for a coordenada x de um ponto) por causa do translate que é aplicado também
            midPointY = ((leftPointY*sW+deltaY)+(rightPointY*sW+deltaY))/2
            ctx.save()
            ctx.translate(midPointX,midPointY)
            ctx.rotate(180 * Math.PI/180 + upAngle +(Math.PI/2)) //A direção em que a nave se desloca é o inverso da direção em que as chamas sao expelidas. Depois adicionei (Math.PI/2) (90 graus) porque verificou-se que se a nave sem rotação, ou seja, rotation(0), já parece ter uma direção corresponde a -90 graus. Por isso se quisermos fazer com que as chamas tenham o valor de direção 0, temos que adicionar aos -90 mais 90. 
            ctx.scale(sW,sW) 
            ctx.drawImage(FIRE, frameIndex*90, 0, 90, 110, -90/3/2,-110/3/2, 90/3, 110/3 )  // Para fazer com que o ponto de origem fosse o centro do objeto das chamas, tivemos que indicar os valores -90/3/2 para x e -110/3/2 para y.
            ctx.restore()
            if(frameTimes >= 20){   // J+a que não se deve user setInterval, usamos o frameTimes para definir o tempo entre cada frame
                frameIndex ++
                frameTimes = 0
            }
            frameTimes++
            upAngleChosen = upAngle
        }
        if (g < 1.0) {
            g += 0.1
        }
        if(frameIndex == 4){
            frameIndex =0
        }
    } else {
        if (g > 0) {
            g -= 0.01
        }

    }

    //verificar colisão entre as balas e os asteroides
    if (b.length !== 0 && balas.length != 0) {
        loop1:
        for (let i = 0; i < b.length; i++) {
            for (let j = 0; j < balas.length; j++) {
                if (Collision(balas[j].x, balas[j].y, 2, b[i].x, b[i].y, b[i].R)) {
                    if (b[i].R >= 10*sW && b[i].R < 20*sW) {
                        playerPoints.text = `Points: ${playerPoints.points += 30}`
                        smallAstSound.cloneNode().play()
                    } else if (b[i].R >= 20*sW && b[i].R < 35*sW) {
                        playerPoints.text = `Points: ${playerPoints.points += 20}`
                        mediumAstSound.cloneNode().play()
                    } else {
                        playerPoints.text = `Points: ${playerPoints.points += 10}`
                        largeAstSound.cloneNode().play()
                    }

                    playerPoints.makePlayerPoints(b[i].R)
                    b.splice(i, 1)
                    balas.splice(j, 1)
                    break loop1
                }
            }
        }
    } else if (b.length === 0) {  //se não há mais asteróides, então o nível foi completado 
        level++
        init()  // reiniciar o desenho dos asteroides
    }

    //for all objects in the object array
    b.forEach(asteroid => {
        //check if it collides with other object
        checkCollision(asteroid);
    });

    /* //verificar colisão da nave com a nave inimiga
    checkCollisionEnemy() */

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

    //atualiza o triangulo
    if(!shipDestroy){ // Se a nave não colidiu com nenhum objeto
        deltaY += g*2*sW*Math.sin(upAngleChosen)
        deltaX += g*2*sW*Math.cos(upAngleChosen)  
        if (deltaY >= H + 31*sW) {    //Se o circulo ultrapassou a borda inferior
            deltaY = -31*sW
        } else if (deltaY <= 0 - 31*sW) {    //Se o circulo ultrapassou a borda superior
            deltaY = H + 31*sW
        } else if (deltaX >= W + 31*sW) {    //Se o circulo ultrapassou a borda direita
            deltaX = -31*sW
        } else if (deltaX <= 0 - 31*sW) {    //Se o circulo ultrapassou a borda esquerda
            deltaX = W + 31*sW
        } 
        drawTriangle()
    }else{ //Caso contrário, a nave produz um efeito de desfragmentação
        // Para não podermos rotacionar os ângulos do triângulo desfragmentado
        if(!uA){    
            uA = upAngle
            lA = leftAngle
            rA = rightAngle
        }
        //Um triangulo normal é representado por três pontos. Um triângulo desfragmentado é divido por 3 retas e cada reta contém 2 pontos (no total dão 6 pontos). 
        //Vamos usar os três pontos originais da reta mais 3 clones dos mesmos.
        upPointX = 31 * Math.cos(uA)  // Coordenada X do ponto de onde saiem as balas
        upPointY = 31 * Math.sin(uA)  // Coordenada Y do ponto de onde saiem as balas
        let upPointXClone = 31 * Math.cos(uA) 
        let upPointYClone = 31 * Math.sin(uA)  
        leftPointX = 31 * Math.cos(lA) // Coordenada X do ponto esquerdo
        leftPointY = 31 * Math.sin(lA) // Coordenada Y do ponto esquerdo
        let leftPointXClone = 31 * Math.cos(lA) 
        let leftPointYClone = 31 * Math.sin(lA) 
        rightPointX = 31 * Math.cos(rA) // Coordenada X do ponto direito
        rightPointY = 31 * Math.sin(rA) // Coordenada Y do ponto direito
        let rightPointXClone = 31 * Math.cos(rA) 
        let rightPointYClone = 31 * Math.sin(rA)

        ctx.strokeStyle = "white"
        ctx.save()

        //Lado esquerdo
        deltas[0][0] += 0.5*sW * Math.cos(uA - Math.PI/2)
        deltas[0][1] += 0.5*sW * Math.sin(uA - Math.PI/2)
        ctx.setTransform(sW, 0, 0, sW, deltas[0][0], deltas[0][1])
        ctx.beginPath();
        ctx.moveTo(upPointX, upPointY);  
        ctx.lineTo(leftPointX, leftPointY)  
        ctx.stroke()

        //Lado base
        deltas[1][0] += 0.5*sW * Math.cos(uA + Math.PI)
        deltas[1][1] += 0.5*sW * Math.sin(uA + Math.PI)
        ctx.setTransform(sW, 0, 0, sW, deltas[1][0], deltas[1][1])
        ctx.beginPath();
        ctx.moveTo(leftPointXClone, leftPointYClone);   
        ctx.lineTo(rightPointX, rightPointY)   
        ctx.stroke()

        // Lado direito
        deltas[2][0] += 0.5*sW * Math.cos(uA + Math.PI/2)
        deltas[2][1] += 0.5*sW * Math.sin(uA + Math.PI/2)
        ctx.setTransform(sW, 0, 0, sW, deltas[2][0], deltas[2][1])
        ctx.beginPath();
        ctx.moveTo(rightPointXClone, rightPointYClone);
        ctx.lineTo(upPointXClone, upPointYClone)  
        ctx.stroke()
        
        ctx.restore()

        if(times === 100){
            shipDestroy = false
            times = 0
            init()
            rightAngle = Math.PI * 60 / 180   // ângulo do ponto direito
            leftAngle = Math.PI * 120 / 180   // ângulo do ponto esquerdo
            upAngle = Math.PI * (-90) / 180   // ângulo do ponto de onde saiem as balas

            // a nave volta para o meio da página
            deltaX = W / 2                    
            deltaY = H /2

            playerLives.lives--  //a nave perde uma vida
            g = 0                //A nave perde impulso 
            uA = 0               // Para na próxima vez em que o objeto colidir com o asteróide, seja guardada a nova direçao da nava
        }else{
            times++
        }
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
        //Para ver o hitbox do asteroide com escala
        /* ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.R*sW, 0, 2 * Math.PI)
        ctx.strokeStyle = 'red'
        ctx.stroke() */
    })
    if (!resize && !gameOver) { 
        window.requestAnimationFrame(render)
    } else {
        ctx.clearRect(0, 0, W, H)
        resizeType = 2
        if (gameOver == 1) { //Se a página não foi redimensionada, mas sim o utilizador perdeu o jogo
            menuGameOver.style.display = ""
            menuGameOver.children[1].innerText = `POINTS: ${playerPoints.points}`
            menuGameOver.children[2].addEventListener('click', () => {
                //Tudo dá reset
                menuGameOver.style.display="none"
                playerPoints.points = 0
                playerPoints.text = 'Points: 0'
                playerLives.lives = 3
                level = 1
                init()
            })
            resizeType = 0
        }
    }
}