CREATE TABLE lodgelog_users (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE lodgelog_address (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  from_date DATE NOT NULL,
  to_date DATE,
  street_address TEXT NOT NULL,
  unit TEXT,
  city TEXT NOT NULL,
  abb_state TEXT NOT NULL,
  zipcode  INTEGER NOT NULL,
  current BOOLEAN DEFAULT false,
  userId INTEGER REFERENCES lodgelog_users(id) ON DELETE CASCADE
);