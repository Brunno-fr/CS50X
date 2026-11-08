// Implements a dictionary's functionality

#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

#include "dictionary.h"

// Represents a node in a hash table
typedef struct node
{
    char word[LENGTH + 1];
    struct node *next;
} node;

// Number of buckets in hash table
// Aumentei para 10000 para reduzir colisões
const unsigned int N = 10000;

// Hash table
node *table[N];

// Contador de palavras carregadas
unsigned int word_count = 0;

// Flag para indicar se o dicionário foi carregado
bool loaded = false;

// Returns true if word is in dictionary, else false
bool check(const char *word)
{
    // Obter valor hash da palavra
    unsigned int index = hash(word);

    // Percorrer a lista encadeada no bucket
    for (node *cursor = table[index]; cursor != NULL; cursor = cursor->next)
    {
        // Comparar sem diferenciar maiúsculas/minúsculas
        if (strcasecmp(cursor->word, word) == 0)
        {
            return true;
        }
    }
    return false;
}

// Hashes word to a number
unsigned int hash(const char *word)
{
    // Função hash baseada na soma dos caracteres e no tamanho
    // para melhor distribuição
    unsigned int hash_value = 0;
    unsigned int length = strlen(word);

    // Usar diferentes pesos para diferentes posições
    for (unsigned int i = 0; i < length; i++)
    {
        // Converter para minúsculo e usar fator de ponderação
        unsigned int c = tolower(word[i]);
        hash_value = (hash_value * 31) + c;
    }

    // Garantir que o valor esteja dentro do intervalo [0, N-1]
    return hash_value % N;
}

// Loads dictionary into memory, returning true if successful, else false
bool load(const char *dictionary)
{
    // Abrir arquivo do dicionário
    FILE *file = fopen(dictionary, "r");
    if (file == NULL)
    {
        return false;
    }

    // Buffer para armazenar cada palavra
    char word[LENGTH + 1];

    // Ler cada palavra do arquivo
    while (fscanf(file, "%s", word) != EOF)
    {
        // Alocar memória para um novo nó
        node *new_node = malloc(sizeof(node));
        if (new_node == NULL)
        {
            // Erro ao alocar memória
            fclose(file);
            return false;
        }

        // Copiar palavra para o nó
        strcpy(new_node->word, word);
        new_node->next = NULL;

        // Calcular índice hash
        unsigned int index = hash(word);

        // Inserir no início da lista encadeada (mais eficiente)
        new_node->next = table[index];
        table[index] = new_node;

        // Incrementar contador de palavras
        word_count++;
    }

    // Fechar arquivo
    fclose(file);
    loaded = true;
    return true;
}

// Returns number of words in dictionary if loaded, else 0 if not yet loaded
unsigned int size(void)
{
    if (!loaded)
    {
        return 0;
    }
    return word_count;
}

// Unloads dictionary from memory, returning true if successful, else false
bool unload(void)
{
    // Percorrer todos os buckets
    for (unsigned int i = 0; i < N; i++)
    {
        node *current = table[i];

        // Liberar cada nó da lista encadeada
        while (current != NULL)
        {
            node *temp = current;
            current = current->next;
            free(temp);
        }

        // Opcional: definir o ponteiro da tabela como NULL
        table[i] = NULL;
    }

    loaded = false;
    word_count = 0;
    return true;
}
