CREATE TABLE guild (
  id varchar(255) PRIMARY KEY,
  prefix varchar(3)
);

CREATE TABLE auction (
  id int PRIMARY KEY,
  guild_id varchar(255) NOT NULL,
  user_id varchar(255) NOT NULL,
  charact varchar(255) NOT NULL,
  img_url text NOT NULL,
  entry_price int,
  max_entries int,
  max_user_entries int,
  start_date datetime NOT NULL,
  end_date datetime NOT NULL
);

CREATE TABLE user (
  id varchar(255) PRIMARY KEY
);

CREATE TABLE auction_participation (
  id int PRIMARY KEY,
  auction_id int NOT NULL,
  user_id varchar(255) UNIQUE NOT NULL,
  entries int NOT NULL
);

ALTER TABLE auction ADD FOREIGN KEY (guild_id) REFERENCES guild (id);

ALTER TABLE auction ADD FOREIGN KEY (user_id) REFERENCES user (id);

ALTER TABLE auction_participation ADD FOREIGN KEY (auction_id) REFERENCES auction (id);

ALTER TABLE auction_participation ADD FOREIGN KEY (user_id) REFERENCES user (id);
