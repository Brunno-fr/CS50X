// ============================================================
//  DUCK ALIEN ASSEMBLER - Lógica Completa do Jogo
// ============================================================

// --- Elementos do DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Estado do Jogo ---
let gameState = {
    pato: { x: 350, y: 390, largura: 60, altura: 50, velocidade: 5 },
    vidas: 3,
    pecasColetadas: 0,
    pecasTotais: 5,
    tempo: 0,
    rodando: false,
    finalizado: false,
    vitoria: false,
    pecasCaindo: [],
    teclasPressionadas: { esquerda: false, direita: false },
    // Máscara para montagem do ET (cada índice é uma peça)
    etMontado: [false, false, false, false, false]
};

// --- Configuração das Peças do ET ---
// 0: Cabeça, 1: Olhos, 2: Tronco, 3: Braços, 4: Pernas
const CORES_PECAS = ['#4ade80', '#facc15', '#60a5fa', '#f472b6', '#a78bfa'];
const NOMES_PECAS = ['Cabeça', 'Olhos', 'Tronco', 'Braços', 'Pernas'];
const FORMATOS_PECA = [
    { w: 40, h: 40 }, // Cabeça
    { w: 50, h: 25 }, // Olhos
    { w: 45, h: 45 }, // Tronco
    { w: 55, h: 30 }, // Braços
    { w: 40, h: 35 }  // Pernas
];

// --- Controles ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') gameState.teclasPressionadas.esquerda = true;
    if (e.key === 'ArrowRight') gameState.teclasPressionadas.direita = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') gameState.teclasPressionadas.esquerda = false;
    if (e.key === 'ArrowRight') gameState.teclasPressionadas.direita = false;
});

// --- Inicialização ---
function iniciarJogo() {
    gameState.vidas = 3;
    gameState.pecasColetadas = 0;
    gameState.tempo = 0;
    gameState.rodando = true;
    gameState.finalizado = false;
    gameState.vitoria = false;
    gameState.etMontado = [false, false, false, false, false];
    gameState.pecasCaindo = [];
    gameState.pato.x = 350;

    // Remove o modal se estiver visível
    document.getElementById('modal').classList.add('hidden');

    // Gera as 5 peças iniciais com atraso
    for (let i = 0; i < gameState.pecasTotais; i++) {
        setTimeout(() => {
            if (gameState.rodando) spawnPeca(i);
        }, i * 1500 + 500);
    }

    atualizarUI();
    loopAnimacao();
}

// --- Spawn de uma peça ---
function spawnPeca(tipo) {
    if (!gameState.rodando || gameState.finalizado) return;
    const larguraCanvas = canvas.width;
    const peca = {
        tipo: tipo,
        x: Math.random() * (larguraCanvas - 60) + 30,
        y: -30,
        velocidade: 0.7 + Math.random() * 0.8,
        cor: CORES_PECAS[tipo],
        nome: NOMES_PECAS[tipo],
        largura: FORMATOS_PECA[tipo].w,
        altura: FORMATOS_PECA[tipo].h
    };
    gameState.pecasCaindo.push(peca);
}

// --- Desenhar o Patinho (estilo CS50) ---
function desenharPato() {
    const p = gameState.pato;
    const x = p.x, y = p.y;

    // Corpo (amarelo)
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 25, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd34d';
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cabeça
    ctx.beginPath();
    ctx.arc(x + 15, y - 5, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#fcd34d';
    ctx.fill();
    ctx.stroke();

    // Bico (laranja)
    ctx.beginPath();
    ctx.moveTo(x + 30, y - 10);
    ctx.lineTo(x + 48, y - 2);
    ctx.lineTo(x + 30, y + 6);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Olho (preto com brilho)
    ctx.beginPath();
    ctx.arc(x + 22, y - 10, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 20, y - 12, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Asa (traço simples)
    ctx.beginPath();
    ctx.ellipse(x - 12, y + 5, 10, 15, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
}

// --- Desenhar a Montagem do ET (canto superior direito) ---
function desenharMontagemET() {
    const baseX = 660, baseY = 40;
    const escala = 1.2;

    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#aac3ff";
    ctx.fillText("🧩 Montagem:", baseX, baseY - 10);

    // Desenha cada peça montada
    if (gameState.etMontado[0]) { // Cabeça
        ctx.beginPath();
        ctx.arc(baseX + 30, baseY + 30, 22 * escala, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
        ctx.stroke();
    }
    if (gameState.etMontado[1]) { // Olhos
        ctx.fillStyle = '#facc15';
        ctx.fillRect(baseX + 15, baseY + 30, 12, 8);
        ctx.fillRect(baseX + 35, baseY + 30, 12, 8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(baseX + 18, baseY + 32, 5, 5);
        ctx.fillRect(baseX + 38, baseY + 32, 5, 5);
    }
    if (gameState.etMontado[2]) { // Tronco
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(baseX + 18, baseY + 50, 24, 30);
    }
    if (gameState.etMontado[3]) { // Braços
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(baseX + 2, baseY + 52, 14, 8);
        ctx.fillRect(baseX + 44, baseY + 52, 14, 8);
    }
    if (gameState.etMontado[4]) { // Pernas
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(baseX + 20, baseY + 82, 8, 20);
        ctx.fillRect(baseX + 32, baseY + 82, 8, 20);
    }

    // Contador de progresso
    const total = gameState.etMontado.filter(v => v).length;
    ctx.fillStyle = "#ffd93d";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`${total}/5`, baseX + 45, baseY + 120);
}

// --- Lógica de Colisão e Atualização ---
function atualizarJogo() {
    if (!gameState.rodando || gameState.finalizado) return;

    // 1. Movimento do Pato
    const p = gameState.pato;
    if (gameState.teclasPressionadas.esquerda && p.x > 10) p.x -= p.velocidade;
    if (gameState.teclasPressionadas.direita && p.x < canvas.width - p.largura - 10) p.x += p.velocidade;

    // 2. Atualizar peças caindo
    const pecasRemover = [];
    for (let i = 0; i < gameState.pecasCaindo.length; i++) {
        const peca = gameState.pecasCaindo[i];
        peca.y += peca.velocidade;

        // Colisão com o pato
        const dx = (p.x + 30) - (peca.x + peca.largura/2);
        const dy = (p.y + 20) - (peca.y + peca.altura/2);
        const distancia = Math.sqrt(dx*dx + dy*dy);
        const raioColisao = 35 + Math.max(peca.largura, peca.altura)/2;

        if (distancia < raioColisao && !gameState.etMontado[peca.tipo]) {
            // Coletou!
            gameState.etMontado[peca.tipo] = true;
            gameState.pecasColetadas++;
            pecasRemover.push(i);
            atualizarUI();

            // Verifica vitória
            if (gameState.pecasColetadas === gameState.pecasTotais) {
                gameState.vitoria = true;
                gameState.rodando = false;
                gameState.finalizado = true;
                mostrarModal(true);
            }
            continue;
        }

        // Se caiu no chão
        if (peca.y > canvas.height - 20) {
            gameState.vidas--;
            pecasRemover.push(i);
            atualizarUI();

            if (gameState.vidas <= 0) {
                gameState.rodando = false;
                gameState.finalizado = true;
                mostrarModal(false);
            }
        }
    }

    // Remove peças coletadas/perdidas
    for (let i = pecasRemover.length - 1; i >= 0; i--) {
        gameState.pecasCaindo.splice(pecasRemover[i], 1);
    }

    // Respawn de peças se faltar alguma e o jogo não acabou
    const faltando = gameState.etMontado.map((v, idx) => v ? null : idx).filter(v => v !== null);
    if (faltando.length > 0 && gameState.rodando && gameState.pecasCaindo.length < 3) {
        // Spawn de uma peça aleatória que falta
        const tipo = faltando[Math.floor(Math.random() * faltando.length)];
        spawnPeca(tipo);
    }
}

// --- Renderização ---
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo com estrelas
    ctx.fillStyle = '#0d1428';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) continue; // só algumas
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    // Desenha todas as peças caindo
    for (const peca of gameState.pecasCaindo) {
        ctx.shadowColor = peca.cor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = peca.cor;
        ctx.fillRect(peca.x, peca.y, peca.largura, peca.altura);
        ctx.shadowBlur = 0;
        // Borda branca
        ctx.strokeStyle = '#ffffff80';
        ctx.lineWidth = 1;
        ctx.strokeRect(peca.x, peca.y, peca.largura, peca.altura);
        // Ícone da peça
        ctx.fillStyle = '#1e293b';
        ctx.font = "18px Arial";
        ctx.fillText(peca.nome[0], peca.x + 10, peca.y + 25);
    }

    // Desenha o patinho
    desenharPato();

    // Desenha a montagem do ET
    desenharMontagemET();

    // Se acabou, desenha overlay de fim
    if (gameState.finalizado && !document.getElementById('modal').classList.contains('hidden') === false) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// --- Loop Principal ---
let ultimoTempo = 0;
function loopAnimacao(tempoAtual) {
    if (!tempoAtual) tempoAtual = 0;

    // Contador de tempo (a cada 1000ms)
    if (gameState.rodando && !gameState.finalizado) {
        if (ultimoTempo === 0) ultimoTempo = tempoAtual;
        if (tempoAtual - ultimoTempo > 1000) {
            gameState.tempo++;
            document.getElementById('tempo').innerText = gameState.tempo;
            ultimoTempo = tempoAtual;
        }
    }

    atualizarJogo();
    desenhar();
    requestAnimationFrame(loopAnimacao);
}

// --- Atualizar UI (vidas, peças) ---
function atualizarUI() {
    document.getElementById('vidas').innerText = gameState.vidas;
    document.getElementById('pecas').innerText = gameState.pecasColetadas;
}

// --- Modal de Fim de Jogo ---
function mostrarModal(vitoria) {
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modalTitulo');
    const texto = document.getElementById('modalTexto');

    if (vitoria) {
        titulo.innerHTML = '🎉 ET Montado com Sucesso! 🛸';
        texto.innerHTML = `Você montou o alienígena em apenas <strong>${gameState.tempo} segundos</strong>!<br>Digite seu nome para entrar no ranking!`;
    } else {
        titulo.innerHTML = '💔 Game Over!';
        texto.innerHTML = `O patinho não conseguiu montar o ET a tempo...<br>Você coletou ${gameState.pecasColetadas} de 5 peças. Tente novamente!`;
        document.getElementById('nomeJogador').style.display = 'none';
        document.getElementById('btnSalvar').style.display = 'none';
        document.querySelector('label[for="nomeJogador"]').style.display = 'none';
    }
    modal.classList.remove('hidden');
}

// --- Eventos do Modal ---
document.getElementById('btnReiniciar').addEventListener('click', () => {
    document.getElementById('nomeJogador').style.display = 'block';
    document.getElementById('btnSalvar').style.display = 'inline-block';
    document.querySelector('label[for="nomeJogador"]').style.display = 'block';
    document.getElementById('nomeJogador').value = '';
    iniciarJogo();
});

document.getElementById('btnSalvar').addEventListener('click', async () => {
    const nome = document.getElementById('nomeJogador').value.trim();
    if (!nome) {
        alert('Por favor, digite seu nome!');
        return;
    }
    if (nome.length < 2) {
        alert('Nome muito curto!');
        return;
    }

    try {
        const response = await fetch('/salvar_score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, tempo: gameState.tempo })
        });
        const data = await response.json();
        if (data.posicao && data.posicao <= 10) {
            alert(`🎊 Parabéns! Você está na ${data.posicao}ª posição do ranking!`);
        } else {
            alert('✅ Recorde salvo! Confira o ranking.');
        }
        // Esconde o botão de salvar para evitar duplicidade
        document.getElementById('btnSalvar').style.display = 'none';
        document.getElementById('nomeJogador').disabled = true;
    } catch (error) {
        alert('Erro ao salvar. Tente novamente.');
        console.error(error);
    }
});

// Inicia o jogo quando a página carregar
window.onload = iniciarJogo;
