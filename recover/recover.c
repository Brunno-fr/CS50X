#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#define BLOCK_SIZE 512

int main(int argc, char *argv[])
{
    // Aceitar um único argumento de linha de comando
    if (argc != 2)
    {
        printf("Usage: ./recover FILE\n");
        return 1;
    }

    // Abrir o cartão de memória
    FILE *card = fopen(argv[1], "r");
    if (card == NULL)
    {
        printf("Could not open file.\n");
        return 1;
    }

    // Criar um buffer para um bloco de dados
    uint8_t buffer[BLOCK_SIZE];

    // Variáveis para controle
    int jpeg_count = 0;
    char filename[8];  // "###.jpg" + '\0' = 8 caracteres
    FILE *output = NULL;

    // Enquanto ainda houver dados para ler do cartão de memória
    while (fread(buffer, 1, BLOCK_SIZE, card) == BLOCK_SIZE)
    {
        // Verificar se é o início de um JPEG
        if (buffer[0] == 0xff && buffer[1] == 0xd8 &&
            buffer[2] == 0xff && (buffer[3] & 0xf0) == 0xe0)
        {
            // Fechar arquivo atual se estiver aberto
            if (output != NULL)
            {
                fclose(output);
            }

            // Criar novo nome de arquivo
            sprintf(filename, "%03d.jpg", jpeg_count);
            output = fopen(filename, "w");
            if (output == NULL)
            {
                printf("Could not create output file.\n");
                fclose(card);
                return 1;
            }

            jpeg_count++;
        }

        // Escrever dados no arquivo se estivermos dentro de um JPEG
        if (output != NULL)
        {
            fwrite(buffer, 1, BLOCK_SIZE, output);
        }
    }

    // Fechar todos os arquivos
    if (output != NULL)
    {
        fclose(output);
    }
    fclose(card);

    return 0;
}
