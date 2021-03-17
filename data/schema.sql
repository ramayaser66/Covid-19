DROP TABLE IF EXISTS country;
CREATE TABLE IF NOT EXISTS country(
    id SERIAL PRIMARY KEY NOT NULL,
    country VARCHAR(255), 
    totalconfirmed VARCHAR(255),
    totaldeaths VARCHAR(255),
    totalrecovered VARCHAR(255),
    date VARCHAR(255)

); 