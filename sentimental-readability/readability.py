# readability.py

import re


def main():
    # Get user input
    text = input("Text: ")

    # Count letters, words, and sentences
    letters = count_letters(text)
    words = count_words(text)
    sentences = count_sentences(text)

    # Calculate Coleman-Liau index
    L = (letters / words) * 100  # Average letters per 100 words
    S = (sentences / words) * 100  # Average sentences per 100 words
    index = 0.0588 * L - 0.296 * S - 15.8

    # Round to nearest integer
    grade = round(index)

    # Output result
    if grade >= 16:
        print("Grade 16+")
    elif grade < 1:
        print("Before Grade 1")
    else:
        print(f"Grade {grade}")


def count_letters(text):
    """Count the number of alphabetic characters in the text."""
    count = 0
    for char in text:
        if char.isalpha():
            count += 1
    return count


def count_words(text):
    """Count the number of words in the text (sequences separated by spaces)."""
    # Split by spaces and filter out empty strings
    words = [word for word in text.split() if word]
    return len(words)


def count_sentences(text):
    """Count the number of sentences in the text (ends with ., !, or ?)."""
    # Count sentence-ending punctuation
    count = 0
    for char in text:
        if char in '.!?':
            count += 1
    return count


if __name__ == "__main__":
    main()
