# Analyysi

## Oletukset:

- ISO 8601 backend industry standard joten ei aikavyöhykettä
- Varausten päällekkäisyydet estetään huonekohtaisesti roomId:llä, ei vaadi käyttäjäId

## Tekoäly:

1. Mitä tekoäly teki hyvin?
   - copilot-instructions.md luonti pdf:n (SRS) ja antamani promptin perusteella
   - copilot-instructionsin noudattaminen
   - Promptaamalla ominaisuuksia palastellusti ja edeten järkevässä järjestyksessä saatiin ekalla vedolla jo hyvää
   - crypton käyttö
   - export funktioiden käyttö

2. Mitä tekoäly teki huonosti?
   - domain, repo ja routes tiedostojen nimeäminen index.js
   - Pari testiä puuttui booking.tests, mutta yllättävän hyvin kuitenkin huomioiden, että tests.instructions.md jäi kirjoittamatta
   - bookingsRepo.js ei camelCase
   - Vaikka lopputulos on toimiva niin copilot-instructions.md voisi olla yksinkertaisempi
   - Top-level status/message lisäys error jsoniin oli osittain oma moka

3. Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?
   - Lisäsin puuttuvat testit "start time must be before end time" ja "start time cannot be in the past" - validointi löytyy booking domainissa
   - Timestamp ja service nimi health endpointtiin - informaatiokäytäntö
   - Kevyt konsolin loggaus middleware responseille - parempi työskentelykokemus dev ympäristössä
   - Localhost url lisääminen serverin starttiin - klikkaamalla suoraa auki selaimeen
