import sqlite3
from cs50 import SQL
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Configuração do banco de dados SQLite
db = SQL("sqlite:///duck.db")

# Cria a tabela se ela não existir
db.execute("""
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jogador TEXT NOT NULL,
        tempo_segundos INTEGER NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

@app.route("/")
def index():
    """Página principal do jogo"""
    return render_template("index.html")

@app.route("/ranking")
def ranking():
    """Página de ranking com os 10 melhores tempos"""
    # Busca os 10 melhores tempos (menor tempo = melhor)
    melhores = db.execute("""
        SELECT jogador, tempo_segundos, data_criacao
        FROM scores
        ORDER BY tempo_segundos ASC
        LIMIT 10
    """)
    return render_template("ranking.html", scores=melhores)

@app.route("/salvar_score", methods=["POST"])
def salvar_score():
    """Recebe os dados do jogo via JSON e salva no banco"""
    data = request.get_json()
    nome = data.get("nome")
    tempo = data.get("tempo")

    if not nome or not tempo:
        return jsonify({"erro": "Dados inválidos"}), 400

    # Insere o novo recorde
    db.execute(
        "INSERT INTO scores (jogador, tempo_segundos) VALUES (?, ?)",
        nome, tempo
    )

    # Verifica se o jogador está no TOP 10 para dar um feedback extra
    posicao = db.execute("""
        SELECT COUNT(*) + 1 as posicao
        FROM scores
        WHERE tempo_segundos < ?
        ORDER BY tempo_segundos ASC
    """, tempo)

    return jsonify({
        "mensagem": "Pontuação salva!",
        "posicao": posicao[0]["posicao"] if posicao else ">10"
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
