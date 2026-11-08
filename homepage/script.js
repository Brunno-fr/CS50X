// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Botão de saudação na página inicial
    const btnSaudacao = document.getElementById('btnSaudacao');
    if (btnSaudacao) {
        btnSaudacao.addEventListener('click', function() {
            const mensagem = document.getElementById('mensagemSaudacao');
            mensagem.textContent = 'Olá! Sou Brunno, 24 anos, brasileiro. Seja bem-vindo(a) à minha página!';
            mensagem.style.color = '#0d6efd';
        });
    }

    // Exemplo: adicionar um efeito de fade em todas as imagens (opcional)
    const imagens = document.querySelectorAll('img');
    imagens.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.opacity = '0.8';
            this.style.transition = 'opacity 0.3s';
        });
        img.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
});
