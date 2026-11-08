-- Keep a log of any SQL queries you execute as you solve the mystery.
-- Buscar relatório da cena do crime para Humphrey Street em 28 de julho de 2025
SELECT id, description
FROM crime_scene_reports
WHERE year = 2025 AND month = 7 AND day = 28
  AND street = 'Humphrey Street';

-- Obter entrevistas das testemunhas que mencionam a padaria
SELECT name, transcript
FROM interviews
WHERE year = 2025 AND month = 7 AND day = 28
  AND transcript LIKE '%bakery%';

-- Registros de segurança da padaria: carros saindo entre 10:15 e 10:25
SELECT license_plate
FROM bakery_security_logs
WHERE year = 2025 AND month = 7 AND day = 28
  AND hour = 10 AND minute BETWEEN 15 AND 25
  AND activity = 'exit';

-- Saques no caixa eletrônico na Leggett Street naquela manhã
SELECT account_number
FROM atm_transactions
WHERE year = 2025 AND month = 7 AND day = 28
  AND atm_location = 'Leggett Street'
  AND transaction_type = 'withdraw';

-- Combinar pistas do caixa eletrônico, padaria e chamadas telefônicas
SELECT name
FROM people
WHERE license_plate IN (
    SELECT license_plate
    FROM bakery_security_logs
    WHERE year = 2025 AND month = 7 AND day = 28
      AND hour = 10 AND minute BETWEEN 15 AND 25
      AND activity = 'exit'
)
AND id IN (
    SELECT person_id
    FROM bank_accounts
    JOIN atm_transactions ON bank_accounts.account_number = atm_transactions.account_number
    WHERE year = 2025 AND month = 7 AND day = 28
      AND atm_location = 'Leggett Street'
      AND transaction_type = 'withdraw'
)
AND phone_number IN (
    SELECT caller
    FROM phone_calls
    WHERE year = 2025 AND month = 7 AND day = 28
      AND duration < 60
);

-- Voo mais cedo saindo de Fiftyville em 29 de julho de 2025
SELECT id, destination_airport_id, hour, minute
FROM flights
WHERE origin_airport_id = (
    SELECT id FROM airports WHERE city = 'Fiftyville'
)
AND year = 2025 AND month = 7 AND day = 29
ORDER BY hour, minute
LIMIT 1;

-- Ladrão confirmado como Bruce
SELECT name
FROM people
JOIN passengers ON people.passport_number = passengers.passport_number
JOIN flights ON passengers.flight_id = flights.id
WHERE flights.id = (
    SELECT id
    FROM flights
    WHERE origin_airport_id = (
        SELECT id FROM airports WHERE city = 'Fiftyville'
    )
    AND year = 2025 AND month = 7 AND day = 29
    ORDER BY hour, minute
    LIMIT 1
)
AND name IN (
    SELECT name
    FROM people
    WHERE license_plate IN (
        SELECT license_plate
        FROM bakery_security_logs
        WHERE year = 2025 AND month = 7 AND day = 28
          AND hour = 10 AND minute BETWEEN 15 AND 25
          AND activity = 'exit'
    )
    AND id IN (
        SELECT person_id
        FROM bank_accounts
        JOIN atm_transactions ON bank_accounts.account_number = atm_transactions.account_number
        WHERE year = 2025 AND month = 7 AND day = 28
          AND atm_location = 'Leggett Street'
          AND transaction_type = 'withdraw'
    )
    AND phone_number IN (
        SELECT caller
        FROM phone_calls
        WHERE year = 2025 AND month = 7 AND day = 28
          AND duration < 60
    )
);

-- Cidade de destino
SELECT city
FROM airports
WHERE id = (
    SELECT destination_airport_id
    FROM flights
    WHERE origin_airport_id = (
        SELECT id FROM airports WHERE city = 'Fiftyville'
    )
    AND year = 2025 AND month = 7 AND day = 29
    ORDER BY hour, minute
    LIMIT 1
);

-- Cúmplice: pessoa para quem Bruce ligou
SELECT name
FROM people
WHERE phone_number = (
    SELECT receiver
    FROM phone_calls
    WHERE year = 2025 AND month = 7 AND day = 28
      AND duration < 60
      AND caller = (
          SELECT phone_number
          FROM people
          WHERE name = 'Bruce'
      )
);
