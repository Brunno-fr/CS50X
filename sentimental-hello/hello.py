# hello.py - Programa que solicita o nome do usuário e imprime uma saudação

from cs50 import get_string

# Solicita o nome do usuário
name = get_string("What is your name? ")

# Imprime a saudação
print(f"hello, {name}")
