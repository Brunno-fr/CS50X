from cs50 import get_float


def main():
    # Prompt user for change owed until a non-negative value is entered
    while True:
        dollars = get_float("Change owed: ")
        if dollars >= 0:
            break

    # Convert dollars to cents
    cents = round(dollars * 100)

    # Initialize coin count
    coins = 0

    # Calculate number of quarters
    quarters = cents // 25
    cents %= 25
    coins += quarters

    # Calculate number of dimes
    dimes = cents // 10
    cents %= 10
    coins += dimes

    # Calculate number of nickels
    nickels = cents // 5
    cents %= 5
    coins += nickels

    # Remaining amount is pennies
    pennies = cents
    coins += pennies

    # Output the minimum number of coins
    print(coins)


if __name__ == "__main__":
    main()
