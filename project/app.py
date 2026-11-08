# -*- coding: utf-8 -*-
# ============================================================
# AI Declaration: This project was initiated and primarily
# developed by the student. AI tools (ChatGPT, Copilot) were
# used for approximately 30% of the initial structuring,
# providing suggestions for architecture and debugging. All
# code was reviewed, understood, and adapted by the student.
# ============================================================

from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import random
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------- MODELOS ----------
class Node(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    zone_id = db.Column(db.Integer, db.ForeignKey('zone.id'))
    cpu = db.Column(db.Float, default=1.0)
    bandwidth = db.Column(db.Float, default=100.0)
    status = db.Column(db.String(20), default='active')

class Zone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    capacity = db.Column(db.Float, default=400.0)  # req/s
    utilization = db.Column(db.Float, default=0.0) # percentual (0-100)

class ExpansionEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    old_nodes = db.Column(db.Integer)
    new_nodes = db.Column(db.Integer)
    old_zones = db.Column(db.Integer)
    new_zones = db.Column(db.Integer)

# ---------- ROTAS ----------
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def status():
    zones = Zone.query.all()
    nodes = Node.query.all()
    total_capacity = sum(z.capacity for z in zones) or 1
    total_util = sum(z.utilization * z.capacity for z in zones) / total_capacity
    return jsonify({
        'nodes': len(nodes),
        'zones': len(zones),
        'capacity': total_capacity,
        'utilization': round(total_util, 2),
        'events': ExpansionEvent.query.count(),
        'zones_data': [{'id': z.id, 'capacity': z.capacity, 'utilization': z.utilization} for z in zones],
        'nodes_data': [{'id': n.id, 'zone_id': n.zone_id} for n in nodes]
    })

@app.route('/api/increase_demand', methods=['POST'])
def increase_demand():
    # Aumenta utilização de todas as zonas
    zones = Zone.query.all()
    for z in zones:
        increment = random.randint(5, 15)
        z.utilization = min(100, z.utilization + increment)
    db.session.commit()

    # Verifica se deve expandir (threshold 80%)
    total_capacity = sum(z.capacity for z in zones) or 1
    total_util = sum(z.utilization * z.capacity for z in zones) / total_capacity
    if total_util >= 80:
        # Criar nova zona
        new_zone = Zone(capacity=400, utilization=0)
        db.session.add(new_zone)
        db.session.commit()
        # Adicionar 4 nós
        for _ in range(4):
            node = Node(zone_id=new_zone.id)
            db.session.add(node)
        db.session.commit()
        # Registrar evento
        old_nodes = len(Node.query.all()) - 4
        old_zones = len(Zone.query.all()) - 1
        event = ExpansionEvent(
            old_nodes=old_nodes,
            new_nodes=old_nodes + 4,
            old_zones=old_zones,
            new_zones=old_zones + 1
        )
        db.session.add(event)
        db.session.commit()

    return jsonify({'success': True})
# ---------- ROTA DE RESET ----------
@app.route('/api/reset', methods=['POST'])
def reset_system():
    # Apaga todos os dados
    ExpansionEvent.query.delete()
    Node.query.delete()
    Zone.query.delete()
    db.session.commit()

    # Cria a zona inicial
    zone = Zone(capacity=400, utilization=0)
    db.session.add(zone)
    db.session.commit()

    # Cria os 4 nós iniciais
    for _ in range(4):
        node = Node(zone_id=zone.id)
        db.session.add(node)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Sistema reiniciado',
        'nodes': 4,
        'zones': 1
    })
# ---------- INICIALIZAR BANCO (criar dados iniciais) ----------
with app.app_context():
    db.create_all()
    if Zone.query.count() == 0:
        # Zona inicial
        z = Zone(capacity=400, utilization=0)
        db.session.add(z)
        db.session.commit()
        # 4 nós iniciais
        for _ in range(4):
            n = Node(zone_id=z.id)
            db.session.add(n)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)
