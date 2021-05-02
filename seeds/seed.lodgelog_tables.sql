INSERT INTO lodgelog_users (username, password)
VALUES 
  ('testuser', 'testpassword'),
  ('testtwo', 'passtwo');

INSERT INTO lodgelog_address (from_date, to_date, street_address, unit, city, abb_state, zipcode, current, userId)
VALUES 
  ('2019-01-01', null, '123 Sycamore St', null, 'Cleveland', 'OH', '44040', true, 1),
  ('2015-03-20', '2018-12-28', '15 NE 2nd Ave', '20', 'Miami', 'FL', '33030', false, 1),
  ('2020-02-23', null, '19 St. George Blvd', null, 'New York', 'NY', '12345', true, 2),
  ('2010-06-15', '2020-02-22', '444 E Logan St', '2022', 'Denver', 'CO', '80203', false, 2);