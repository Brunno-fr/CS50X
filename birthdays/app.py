import sqlite3
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Função para conectar ao banco de dados
def get_db():
    db = sqlite3.connect("birthdays.db")
    db.row_factory = sqlite3.Row  # permite acessar colunas por nome
    return db

# Cria a tabela se não existir
def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS birthdays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            month INTEGER NOT NULL,
            day INTEGER NOT NULL
        )
    """)
    db.commit()
    db.close()

# Inicializa o banco ao iniciar a aplicação
init_db()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        # Processar o formulário de adição
        name = request.form.get("name")
        month = request.form.get("month")
        day = request.form.get("day")

        # Validação no servidor
        if not name:
            return redirect("/")
        try:
            month = int(month)
        except (TypeError, ValueError):
            return redirect("/")
        if month < 1 or month > 12:
            return redirect("/")

        try:
            day = int(day)
        except (TypeError, ValueError):
            return redirect("/")
        if day < 1 or day > 31:
            return redirect("/")

        # Inserir no banco
        db = get_db()
        db.execute("INSERT INTO birthdays (name, month, day) VALUES (?, ?, ?)",
                   (name, month, day))
        db.commit()
        db.close()

        return redirect("/")

    # GET: exibir todos os aniversários
    db = get_db()
    birthdays = db.execute("SELECT * FROM birthdays ORDER BY month, day").fetchall()
    db.close()
    return render_template("index.html", birthdays=birthdays)

@app.route("/delete/<int:id>", methods=["POST"])
def delete(id):
    db = get_db()
    db.execute("DELETE FROM birthdays WHERE id = ?", (id,))
    db.commit()
    db.close()
    return redirect("/")

@app.route("/edit/<int:id>", methods=["GET", "POST"])
def edit(id):
    db = get_db()
    if request.method == "POST":
        # Atualizar registro
        name = request.form.get("name")
        month = request.form.get("month")
        day = request.form.get("day")

        if not name:
            return redirect("/")
        try:
            month = int(month)
        except (TypeError, ValueError):
            return redirect("/")
        if month < 1 or month > 12:
            return redirect("/")

        try:
            day = int(day)
        except (TypeError, ValueError):
            return redirect("/")
        if day < 1 or day > 31:
            return redirect("/")

        db.execute("UPDATE birthdays SET name = ?, month = ?, day = ? WHERE id = ?",
                   (name, month, day, id))
        db.commit()
        db.close()
        return redirect("/")

    # GET: exibir formulário de edição
    birthday = db.execute("SELECT * FROM birthdays WHERE id = ?", (id,)).fetchone()
    db.close()
    if birthday is None:
        return redirect("/")
    return render_template("edit.html", birthday=birthday)

if __name__ == "__main__":
    app.run(debug=True)


