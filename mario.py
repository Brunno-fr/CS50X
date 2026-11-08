from cs50 import get_int


def main():
    # Prompt user for height between 1 and 8 inclusive
    while True:
        height = get_int("Height: ")
        if height >= 1 and height <= 8:
            break

    # Build the half-pyramid
    for i in range(1, height + 1):
        # Print spaces
        print(" " * (height - i), end="")
        # Print hashes
        print("#" * i)


if __name__ == "__main__":
    main()
