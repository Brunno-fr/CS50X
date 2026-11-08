import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Create transactions table if not exists
db.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        shares INTEGER NOT NULL,
        price REAL NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
        transacted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
""")

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""
    user_id = session["user_id"]

    # Get user's cash
    cash_row = db.execute("SELECT cash FROM users WHERE id = ?", user_id)
    cash = cash_row[0]["cash"]

    # Get all transactions for user
    transactions = db.execute(
        "SELECT symbol, SUM(CASE WHEN type='buy' THEN shares ELSE -shares END) as total_shares "
        "FROM transactions WHERE user_id = ? GROUP BY symbol HAVING total_shares > 0",
        user_id
    )

    portfolio = []
    grand_total = cash

    for row in transactions:
        symbol = row["symbol"]
        shares = row["total_shares"]
        quote = lookup(symbol)
        if quote:
            price = quote["price"]
            total_value = shares * price
            grand_total += total_value
            portfolio.append({
                "symbol": symbol,
                "name": quote["name"],
                "shares": shares,
                "price": price,
                "total": total_value
            })

    return render_template("index.html", portfolio=portfolio, cash=cash, grand_total=grand_total)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        # Validate symbol
        if not symbol:
            return apology("must provide symbol", 400)
        quote = lookup(symbol)
        if quote is None:
            return apology("invalid symbol", 400)

        # Validate shares
        try:
            shares = int(shares)
        except ValueError:
            return apology("shares must be a positive integer", 400)
        if shares <= 0:
            return apology("shares must be a positive integer", 400)

        # Check user's cash
        user_id = session["user_id"]
        cash_row = db.execute("SELECT cash FROM users WHERE id = ?", user_id)
        cash = cash_row[0]["cash"]

        price = quote["price"]
        total_cost = shares * price
        if cash < total_cost:
            return apology("can't afford", 400)

        # Update cash and record transaction
        db.execute("UPDATE users SET cash = cash - ? WHERE id = ?", total_cost, user_id)
        db.execute(
            "INSERT INTO transactions (user_id, symbol, shares, price, type) VALUES (?, ?, ?, ?, 'buy')",
            user_id, symbol.upper(), shares, price
        )

        flash("Bought!")
        return redirect("/")
    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    user_id = session["user_id"]
    transactions = db.execute(
        "SELECT symbol, shares, price, type, transacted_at "
        "FROM transactions WHERE user_id = ? ORDER BY transacted_at DESC",
        user_id
    )
    return render_template("history.html", transactions=transactions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote."""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        if not symbol:
            return apology("must provide symbol", 400)

        quote = lookup(symbol)
        if quote is None:
            return apology("invalid symbol", 400)

        return render_template("quoted.html", quote=quote)
    else:
        return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Validate inputs
        if not username:
            return apology("must provide username", 400)
        if not password:
            return apology("must provide password", 400)
        if not confirmation:
            return apology("must confirm password", 400)
        if password != confirmation:
            return apology("passwords do not match", 400)

        # Check if username already exists
        try:
            hash = generate_password_hash(password)
            result = db.execute(
                "INSERT INTO users (username, hash) VALUES (?, ?)", username, hash
            )
        except ValueError:
            return apology("username already exists", 400)

        # Log user in automatically
        session["user_id"] = result

        flash("Registered!")
        return redirect("/")
    else:
        return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    user_id = session["user_id"]

    # Get symbols owned by user
    owned = db.execute(
        "SELECT symbol, SUM(CASE WHEN type='buy' THEN shares ELSE -shares END) as total_shares "
        "FROM transactions WHERE user_id = ? GROUP BY symbol HAVING total_shares > 0",
        user_id
    )

    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        # Validate symbol selection
        if not symbol:
            return apology("must select a stock", 400)
        # Ensure user owns this stock
        owned_symbols = [row["symbol"] for row in owned]
        if symbol not in owned_symbols:
            return apology("stock not owned", 400)

        # Validate shares
        try:
            shares = int(shares)
        except ValueError:
            return apology("shares must be a positive integer", 400)
        if shares <= 0:
            return apology("shares must be a positive integer", 400)

        # Check if enough shares owned
        for row in owned:
            if row["symbol"] == symbol:
                current_shares = row["total_shares"]
                break
        if shares > current_shares:
            return apology("too many shares", 400)

        # Get current price
        quote = lookup(symbol)
        if quote is None:
            return apology("invalid symbol", 400)
        price = quote["price"]
        total_sale = shares * price

        # Update cash and record transaction
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", total_sale, user_id)
        db.execute(
            "INSERT INTO transactions (user_id, symbol, shares, price, type) VALUES (?, ?, ?, ?, 'sell')",
            user_id, symbol.upper(), shares, price
        )

        flash("Sold!")
        return redirect("/")
    else:
        return render_template("sell.html", symbols=owned)


@app.route("/change_password", methods=["GET", "POST"])
@login_required
def change_password():
    """Allow user to change password."""
    if request.method == "POST":
        current_password = request.form.get("current_password")
        new_password = request.form.get("new_password")
        confirmation = request.form.get("confirmation")

        if not current_password:
            return apology("must provide current password", 400)
        if not new_password:
            return apology("must provide new password", 400)
        if not confirmation:
            return apology("must confirm new password", 400)
        if new_password != confirmation:
            return apology("passwords do not match", 400)

        user_id = session["user_id"]
        rows = db.execute("SELECT hash FROM users WHERE id = ?", user_id)
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], current_password):
            return apology("invalid current password", 400)

        new_hash = generate_password_hash(new_password)
        db.execute("UPDATE users SET hash = ? WHERE id = ?", new_hash, user_id)

        flash("Password changed!")
        return redirect("/")
    else:
        return render_template("change_password.html")
