import csv
import sys


def longest_match(sequence, subsequence):
    """Returns length of longest run of subsequence in sequence."""
    # Initialize variables
    longest_run = 0
    subsequence_length = len(subsequence)
    sequence_length = len(sequence)

    # Check each character in sequence for most consecutive runs of subsequence
    for i in range(sequence_length):
        count = 0
        # Check for a subsequence match in a "substring" (a subset of characters) within sequence
        # If a match, move substring to next potential match in sequence
        # Continue moving substring and checking for matches until out of consecutive matches
        while True:
            # Adjust substring start and end
            start = i + count * subsequence_length
            end = start + subsequence_length

            # If there is a match in the substring
            if sequence[start:end] == subsequence:
                count += 1
            # If there is no match in the substring
            else:
                break

        # Update most consecutive matches found
        longest_run = max(longest_run, count)

    # After checking for runs at each character in seqeuence, return longest run found
    return longest_run


def main():
    # Check for correct number of command-line arguments
    if len(sys.argv) != 3:
        print("Usage: python dna.py data.csv sequence.txt")
        sys.exit(1)

    # Get file names from command line
    csv_filename = sys.argv[1]
    sequence_filename = sys.argv[2]

    # Read DNA sequence from text file
    with open(sequence_filename, 'r') as file:
        dna_sequence = file.read().strip()

    # Read STR data from CSV file
    database = []
    with open(csv_filename, 'r') as file:
        reader = csv.DictReader(file)
        # Get STR column names (excluding 'name')
        str_columns = reader.fieldnames[1:]

        # Read all individuals into database
        for row in reader:
            database.append(row)

    # Calculate STR counts for the DNA sequence
    dna_counts = {}
    for str_name in str_columns:
        dna_counts[str_name] = longest_match(dna_sequence, str_name)

    # Check if DNA counts match any individual in database
    for person in database:
        match = True
        for str_name in str_columns:
            # Convert STR count to integer for comparison
            if int(person[str_name]) != dna_counts[str_name]:
                match = False
                break

        if match:
            print(person['name'])
            return

    # If no match found
    print("No match")


if __name__ == "__main__":
    main()
